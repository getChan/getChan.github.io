---
title: "Parquet 중첩 타입(Nested Types) 비교"
excerpt: "Map, Struct, JSON, Variant — 스키마 유연성과 푸시다운 효율의 트레이드오프"
categories:
  - data
tags:
  - data
  - parquet
  - iceberg
  - columnar
  - variant
---

## 1. 논리적 관점 (스키마, 유연성, 쿼리 표현력)

| 타입 | 스키마 유연성 | 중첩 구조 | 키/값 타입 제약 |
|---|---|---|---|
| Struct | 정적 (컴파일타임) | 가능, 고정 필드 | 필드명·타입 모두 스키마에 고정 |
| Map | 반정적 | value에 중첩 가능 | key 타입 고정, value 타입 고정 |
| String(JSON) | 완전 동적 | 중첩 가능 (문자열) | 없음 (그냥 바이트 덩어리) |
| Variant | 완전 동적 | 중첩 가능 | 없음, 런타임 타입 정보 포함 |
| Shredded Variant | 동적+정적 혼합 | 중첩 가능 | 자주 쓰는 경로는 별도 컬럼으로 고정 |

### Struct

- 스키마가 파일 작성 시점에 완전히 결정됨
- 필드 추가/삭제 → 스키마 evolution 필요 (ALTER TABLE 등)
- 중첩 필드에 대한 컬럼 통계(min/max/null count) 완벽히 지원
- SQL: `col.field_name` 형태로 직접 접근

### Map

- key-value 쌍의 컬렉션. key 타입은 고정 (보통 STRING)
- 키 집합이 행마다 달라질 수 있음 → Struct보다 유연
- 그러나 "키 K의 값이 100 이상" 같은 조건은 컬럼 통계로 처리 불가
- SQL: `col['key']` 형태 접근

### String(JSON)

- Parquet 입장에서는 그냥 BYTE_ARRAY. 의미론적으로만 JSON
- 엔진이 JSON인지 모름 → 통계·인덱싱 전혀 없음
- 쿼리 시 전체 문자열 파싱 필수 (`get_json_object` 등)
- 가장 범용적이지만 성능은 최악

### Variant (Parquet Spec v2 / Iceberg v3)

- Apache Parquet에서 공식 제안된 새 논리 타입 (2023~2024)
- 이진 인코딩으로 타입 정보 포함 (BOOLEAN/INT/FLOAT/STRING/ARRAY/OBJECT 등)
- 런타임에 스키마 없이도 타입 체크·경로 탐색 가능
- Iceberg v3의 핵심 타입으로 채택

### Shredded Variant

- Variant의 확장: 자주 접근하는 경로를 별도 Parquet 컬럼으로 "분해(shred)"
- 나머지 동적 부분은 여전히 Variant로 보관
- Struct의 정적 효율성 + Variant의 동적 유연성을 동시에 추구

---

## 2. 물리적 저장 구조

### Struct

```
parquet row group
├── col.a   (INT64)   ← 독립 컬럼
├── col.b   (STRING)  ← 독립 컬럼
└── col.c   (DOUBLE)  ← 독립 컬럼
```

각 필드가 완전히 독립된 컬럼으로 분리 저장된다. Dremel encoding(repetition/definition levels)이 적용되며 각 컬럼에 독립적인 min/max/null 통계가 붙는다.

### Map

```
parquet row group
└── col (MAP)
    └── key_value (repeated group)
        ├── key   (STRING)
        └── value (INT64)
```

key, value 각각 하나의 컬럼. `key='foo'`인 value만 가져오려면 key 컬럼 전체 스캔이 필요하다.

### String(JSON)

```
parquet row group
└── col (BYTE_ARRAY)  ← 그냥 바이트
    통계: min/max는 바이트 비교 (의미 없음)
```

완전 불투명 바이트 덩어리. 압축은 되지만 컬럼 푸시다운 전혀 불가.

### Variant

```
parquet row group
└── col (VARIANT)
    ├── metadata (BYTE_ARRAY)  ← 딕셔너리: 필드명 → id 매핑
    └── value   (BYTE_ARRAY)  ← 이진 인코딩된 실제 값
```

- `metadata` 컬럼: 해당 row group에 등장한 모든 필드명을 딕셔너리로
- `value` 컬럼: 타입 태그(1바이트) + 실제 값의 이진 인코딩
- JSON보다 파싱 비용 낮음. 컬럼 통계는 여전히 제한적

### Shredded Variant

```
parquet row group
└── col (VARIANT)
    ├── metadata   (BYTE_ARRAY)
    ├── value      (BYTE_ARRAY)     ← shred된 경로는 null or absent
    ├── col.price  (DOUBLE)         ← shredded 컬럼 ①
    ├── col.user_id(INT64)          ← shredded 컬럼 ②
    └── col.tags   (LIST<STRING>)   ← shredded 컬럼 ③
```

shredded 컬럼에 해당 경로의 값이 있으면 저장하고, Variant value에는 중복 저장하지 않는다. shredded 컬럼에는 완전한 Parquet 통계가 생성된다.

---

## 3. 컬럼 푸시다운 & 필터링 비교

| 타입 | Row Group 통계 필터링 | Page-level 필터링 | 경로 직접 컬럼 I/O | 필터 pushdown 효율 |
|---|---|---|---|---|
| Struct | ✅ 각 필드 | ✅ | ✅ 해당 필드만 | 최상 |
| Map | ⚠️ key/value 수준 | ⚠️ | ❌ 전체 스캔 | 낮음 |
| String(JSON) | ❌ | ❌ | ❌ 전체 읽기 | 없음 |
| Variant | ❌ | ❌ | ❌ 전체 읽기 | 없음에 가까움 |
| Shredded Variant | ✅ shred된 필드만 | ✅ shred된 필드만 | ✅ shred된 경로만 독립 I/O | shred 경로는 최상, 나머지는 Variant 수준 |

구체적인 예시:

```sql
-- 이 쿼리에서 각 타입이 어떻게 동작하는가
SELECT * FROM t WHERE data.price > 100.0
```

- **Struct(price DOUBLE)**: price 컬럼만 읽음. row group min/max로 블록 스킵. 최적
- **Map**: key='price' 찾으려면 key 컬럼 전체 + value 컬럼 전체 읽어야 함
- **String(JSON)**: 모든 행 읽고 JSON 파싱 후 필터
- **Variant**: 모든 행 value 컬럼 읽고 이진 파싱 후 필터 (JSON보단 빠름)
- **Shredded Variant(price shredded)**: Struct와 동일하게 동작

---

## 4. 인코딩 & 압축 효율

| 타입 | 인코딩 특성 |
|---|---|
| Struct | 각 필드 독립 인코딩. 동일 타입 연속 → RLE/Dict 최대 효과 |
| Map | key 컬럼은 Dict 인코딩 잘 됨 (반복 문자열). value는 분산 |
| String(JSON) | Snappy/Zstd 블록 압축만. 컬럼 지향 인코딩 효과 없음 |
| Variant | metadata 딕셔너리로 필드명 중복 제거. value는 이진이라 JSON보단 낫지만 typed 컬럼보단 나쁨 |
| Shredded Variant | shredded 컬럼: Struct 수준. 잔여 Variant: Variant 수준 |

---

## 5. 스키마 진화(Schema Evolution) 대응

| 타입 | 새 필드 추가 시 |
|---|---|
| Struct | ALTER TABLE 필요. 구 파일의 새 필드는 null로 읽힘 |
| Map | 코드 변경 없이 새 key 그냥 삽입 가능 |
| String(JSON) | 코드 변경 없이 새 key 그냥 삽입 가능. 쿼리도 즉시 사용 |
| Variant | 코드 변경 없이 새 경로 삽입 가능 |
| Shredded Variant | 새 경로는 Variant에 담김 (즉시 가능). 자주 쓰이면 나중에 shred 추가 (테이블 변경 필요) |

---

## 6. 언제 무엇을 써야 하나

| 상황 | 추천 |
|---|---|
| 스키마 완전히 알고 있음, 고정 | **Struct** |
| 키 집합이 다양하지만 value 타입은 균일 | **Map** |
| 레거시 시스템, 빠른 PoC, JSON 그대로 dump | **String(JSON)** |
| 스키마 미확정, 탐색적 분석, 이벤트 로그 | **Variant** |
| 일부 경로 자주 쿼리 + 나머지는 동적 | **Shredded Variant** ← 이상적 |

---

## 7. 생태계 현황 (2025 기준)

- **Struct / Map**: 모든 엔진 지원 (Spark, Trino, DuckDB, Hive 등)
- **String(JSON)**: 모든 엔진 지원. `get_json_object`, `json_extract` 등 함수로 사용
- **Variant**: Parquet spec PR 제안됨, Iceberg v3 명세 포함. Spark 4.0, DuckDB 일부 지원 시작
- **Shredded Variant**: Iceberg v3 명세에 포함. Spark 4.0 실험적 지원. 아직 엔진 지원 초기 단계

Variant / Shredded Variant는 "반정형 데이터를 레이크하우스에서 SQL로 효율적으로 다루자"는 흐름(Snowflake VARIANT, BigQuery JSON → 표준화)의 Parquet/Iceberg 구현체다.
