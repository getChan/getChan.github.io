---
title: "OLAP 엔진과 조인 전략 정리"
excerpt: "Hash Join, Sort-Merge Join, Spark, Presto, Druid의 실행과 저장 구조"
categories:
  - data
tags:
  - database
  - spark
  - presto
  - druid
  - parquet
  - olap
last_modified_at: 2026-08-23T23:00:00+09:00
---

오늘은 대규모 분석 엔진이 조인과 데이터를 어떻게 처리하는지 정리했다.

## Hash Join과 Sort-Merge Join

등가 조인(`=`)에서는 보통 Hash Join이 빠르다. 한쪽 입력으로 해시 테이블을 만들고, 다른 쪽 입력을 probe하면서 매칭하기 때문이다.

- 평균 시간 복잡도: `O(N + M)`
- 입력을 미리 정렬할 필요가 없음
- 대신 해시 테이블을 위한 메모리가 필요함

Sort-Merge Join은 양쪽 입력을 조인 키로 정렬한 뒤, 정렬된 두 스트림을 앞에서부터 비교한다.

- 입력이 이미 정렬되어 있으면 효율적
- 정렬 결과를 이후 연산에서 재사용할 수 있음
- 정렬 비용과 spill 비용이 발생할 수 있음
- 메모리 사용량을 비교적 예측하기 쉬움

따라서 단순히 “Hash Join이 항상 빠르다”라기보다는 다음처럼 이해하는 것이 좋다.

```text
작은 입력 또는 정렬되지 않은 등가 조인 → Hash Join
큰 입력끼리의 안정적인 분산 조인       → Sort-Merge Join
입력이 이미 정렬됨                     → Sort-Merge Join
작은 테이블을 모든 워커에 복제 가능     → Broadcast Hash Join
```

## Spark의 Sort-Merge Join

Spark SQL은 일반적으로 `SortMergeJoin`을 선호한다. 이는 Spark가 파이프라인 실행을 하지 않기 때문이 아니다. Spark도 stage 내부에서는 여러 연산을 파이프라인으로 실행한다.

차이는 대규모 셔플 조인에서의 기본 선택이다. 큰 데이터를 해시 테이블에 담는 것보다, 셔플과 정렬을 이용해 메모리 사용량과 실행 규모를 예측하기 쉬운 방식을 선호한다.

실행 계획은 대략 다음과 같다.

```text
입력
→ ShuffleExchange(hash(join_key))
→ Sort(join_key)
→ SortMergeJoin
```

중요한 점은 **셔플 자체가 조인 키 기준 정렬을 보장하지 않는다**는 것이다. 셔플은 데이터를 목적 파티션으로 재분배하는 작업이고, `SortMergeJoin`에 필요한 키 정렬은 보통 그 다음 `SortExec`가 수행한다.

Spark의 key sort는 메모리에서 정렬하다가 메모리가 부족하면 정렬된 run을 디스크로 spill하고, 이후 여러 run을 병합하는 external merge sort 형태로 동작한다. 구현 세부사항은 Spark 버전에 따라 달라질 수 있지만, 개념적으로는 다음과 같다.

```text
메모리 내 정렬
→ 필요하면 sorted run spill
→ 여러 run을 k-way merge
→ 정렬된 스트림을 SortMergeJoin에 전달
```

작은 테이블이면 Spark가 `BroadcastHashJoin`을 선택할 수 있고, AQE(Adaptive Query Execution)는 실행 중 통계를 보고 일부 조인을 `ShuffledHashJoin`으로 바꿀 수도 있다.

## Presto/Trino의 Hash Join

Presto/Trino는 일반적으로 분산 Hash Join을 기본 전략으로 사용한다.

양쪽 데이터를 조인 키의 해시값에 따라 워커로 분배한 뒤, 각 워커에서 한쪽을 build side로 해시 테이블에 만들고 다른 쪽을 probe한다.

```text
양쪽 입력
→ hash(join_key)로 분산
→ 각 워커에서 build-side hash table 생성
→ probe-side와 매칭
```

Presto/Trino는 대화형 쿼리에서 정렬 비용을 피하고 빠르게 결과를 내는 데 초점을 둔다. 물론 작은 테이블은 broadcast 방식으로 처리할 수 있고, 메모리 부족 시 spill을 사용할 수 있다.

Spark와 Presto/Trino의 기본값 차이는 파이프라인 실행 여부의 차이라기보다, 큰 분산 조인에서 무엇을 기본적인 안정성과 성능의 기준으로 삼는지에 대한 차이에 가깝다.

## 셔플 데이터 손실과 재시도

### Spark

Spark는 lineage와 stage 경계를 이용해 중간 결과를 복구한다.

셔플 데이터를 읽는 task가 `FetchFailed`를 만나면 보통 전체 쿼리를 처음부터 실행하지 않는다. 잃어버린 셔플 파티션을 만들었던 upstream map task 또는 stage를 다시 실행하고, 복구된 셔플 데이터를 이용해 downstream task를 재시도한다.

```text
셔플 데이터 손실
→ 잃어버린 셔플 파티션을 만든 upstream 재실행
→ downstream task 재시도
```

즉 “셔플 시점부터”라는 표현은 대체로 맞지만, 정확히는 **잃어버린 셔플 파티션을 생성한 stage부터 필요한 범위만 재계산**한다.

### Presto/Trino

일반적인 Presto 설정에서는 fault tolerance가 기본으로 켜져 있지 않다. 워커나 task에 문제가 생기면 중간 결과를 Spark lineage처럼 다시 계산하기보다는 쿼리가 실패하고 사용자가 다시 실행하는 경우가 기본이다.

Trino의 fault-tolerant execution을 사용하면 설정에 따라 달라진다.

```text
retry-policy=QUERY → 쿼리 전체 재시도
retry-policy=TASK  → 실패한 task 재시도
```

`TASK` 모드에서는 exchange 데이터를 외부 저장소에 spool해 두고, 실패한 task가 기존 exchange 데이터를 재사용할 수 있다. 따라서 Spark의 lineage 기반 재계산과 달리, **exchange materialization 기반 복구**에 가깝다.

## Druid와 내부 저장 포맷

Druid는 Parquet 파일을 내부 기본 저장 포맷으로 사용하지 않는다. ingestion한 데이터를 자체적인 **Druid segment** 포맷으로 변환해 저장한다.

```text
원본 이벤트
→ Druid ingestion
→ Druid native segment
→ 컬럼형 데이터 + 압축 + bitmap/inverted index
```

Druid segment도 컬럼 지향이고 압축과 인덱스를 사용하므로 Parquet와 비슷한 면은 있다. 하지만 Parquet가 범용 파일 포맷이라면, Druid segment는 Druid 쿼리 엔진에 맞춘 실행용 저장 포맷이다.

```text
Druid      → 자체 segment 포맷
Prometheus → 자체 TSDB block/chunk 포맷
Databricks → Delta Lake 위의 Parquet 파일
```

Druid는 시간 범위, 차원 필터, 집계 쿼리를 빠르게 처리하는 데 특화되어 있다. 반대로 임의의 대형 테이블 조인이나 row-level update에는 적합하지 않다.

## Prometheus와 Datadog

Prometheus는 Druid를 내부 엔진으로 사용하지 않고 자체 TSDB를 사용한다. 시계열 데이터를 block과 chunk로 저장하고, metric name과 label에서 시계열을 찾기 위한 인덱스를 함께 저장한다. WAL과 compaction도 자체 방식이다.

Datadog 역시 공개된 기술 자료 기준으로 자체적인 대규모 시계열 데이터베이스와 인덱싱 시스템을 운영한다. Datadog이 Druid를 모니터링할 수 있는 integration을 제공하는 것과, Datadog 내부가 Druid로 동작하는 것은 다른 이야기다.

Mixpanel 같은 제품 분석 서비스는 Druid와 비슷한 workload를 가진다.

- 이벤트를 시간·사용자·속성 기준으로 저장
- 기간별 필터와 집계
- 퍼널 분석
- 리텐션과 코호트 분석
- 사용자 세그먼트 분석

다만 Mixpanel은 CRM보다는 Product Analytics 플랫폼에 가깝고, 실제 내부 저장 엔진이 Druid인지 여부는 공개 정보만으로 단정할 수 없다.

## AWS에서 Druid와 비슷한 선택지

AWS에는 Druid와 완전히 같은 제품보다는 용도별 대안이 있다.

```text
메트릭·시계열 데이터       → Amazon Timestream
이벤트 OLAP·BI·대형 조인  → Amazon Redshift
로그 검색·관찰성           → Amazon OpenSearch Service
```

Timestream은 시계열 데이터에 특화되어 있고, Redshift는 Kinesis/MSK streaming ingestion과 materialized view를 이용해 이벤트 분석을 구성할 수 있다. OpenSearch는 Druid보다 로그 검색과 탐색형 분석에 더 가깝다.

결국 제품 선택은 다음처럼 정리할 수 있다.

```text
초저지연 이벤트 집계       → Druid 계열
범용 SQL·조인·BI·ML        → Databricks/Redshift 계열
메트릭과 운영 시계열        → Prometheus/Timestream 계열
로그 검색과 관찰성          → OpenSearch 계열
```

