---
title: "Apache Arrow DataFusion 논문 메모"
excerpt: "Apache Arrow DataFusion: a Fast, Embeddable, Modular Analytic Query Engine"

categories:
  - data
tags:
  - rust
  - data
last_modified_at: 2024-06-08T08:00:00-08:00
---

논문 [Apache Arrow DataFusion: a Fast, Embeddable, Modular Analytic Query Engine](http://andrew.nerdnetworks.org/other/SIGMOD-2024-lamb.pdf)

Apache Arrow DataFusion : Rust 및 Apache Arrow 메모리 모델 기반으로 구현된 쿼리 엔진.

# 기반 에코시스템
- Apache Arrow
  - 데이터를 저장하는 메모리 모델. 컬럼 기반이며 캐시 친화적.
  - 빠른 인메모리 처리, 랜덤 액서스에 특화됨
- Apache Parquet
  - 컬럼 기반의 데이터 파일 포맷. 
  - 효율적인 데이터 압축
  - 스키마 인코딩
  - 내장 스키마 서술
  - 블룸 필터로 빠른 데이터 접근
  - 대량의 데이터를 공간 효율적인 방법으로 저장하는데 특화됨.
- Rust
  - 저수준이라 빠르면서도, 메모리 안정성을 보장하는 프로그래밍 언어
  - 메모리와 스레드 안전성 문제를 메모리 소유권 모델로 해결함.

# 특징

## 카탈로그와 데이터 소스
- 카탈로그
  - 테이블, 컬럼, 자료형, 통계정보, 저장소 세부사항 등의 메타데이터를 제공하는 것.
  - 쿼리를 계획하는 데 필요함.
  - DataFusion은 단순한 인메모리 카탈로그와 Hive스타일의 파티션된 파일/디렉토리 기반 카탈로그가 있다.
  - 대부분의 시스템은 하이브 메타스토어 등의 외부 카탈로그를 사용한다.
- 데이터 소스
  - DataFusion은 `TableProviders`를 포함한다.
  - Parquet, Avro 등 일반적으로 사용되는 파일 포맷을 사용하기 위함.
  - predicate, projection, limit 푸시다운을 지원한다.
  - parquet reader는 arrow rust 구현체를 사용하며 predicate 푸시다운, 지연 구체화, 블룸 필터, 중첩 타입을 구현했다.

## Front Ends
- 데이터타입
  -  Apache Arrow 타입 시스템을 사용한다.
- SQL Planner
  - `sqlparser-rs` 로 SQL을 파싱하고 `LogicalPlan`을 생성한다.
  - SQL 문법의 대부분을 지원한다.
- `DataFrame`, `LogicalPlanBuilder` APIs
  - DataFrame API를 지원한다.
    - 절차적 스타일의 쿼리 플랜을 만들기 위한 API
    - SQL과 동일한 `LogicalPlan`을 생성한다.
    - 동일하게 최적화되고 실행된다.
  - `LogicalPlanBuilder` 
    - 러스트 빌더 패턴으로 커스텀 플랜을 직접 생성하기 위해 사용된다.

## 논리계획과 옵티마이저
- Plans and Expressions
  - 논리적이고 물리적인 수준에서 관계 연산자 및 표현식 트리를 위한 구조를 포함한다.
  - 해당 구조를 (역)직렬화하기 위한 라이브러리를 포함한다.
  - 계획 시점의 통계 정보를 담는 구조를 포함한다.
- Expression Analysis
  - 기본 표현식 평가에 더해서 단순화, interval analysis, range propagation 등의 라이브러리를 포함한다.
  - 통계와 결합해서 계획 시점의 파티션 제거, predicate cardinality 및 selectivity 추정 등을 제공한다.
- Functional Library
  - 내장 스칼라, 윈도우, 집계 함수 라이브러리를 제공한다.
  - 함수들은 arrow array를 조작한다. 
  - SQL과 DataFrame API 둘 다 호출 가능하다.
- Rewrites
  - 확장 가능한 계획 재작성 프레임웍을 포함한다.
  - 가용 연산자, 함수 시그니처를 위한 자동 타입 강제 등을 수행

## 실행 엔진
- DataFusion은 pull 기반의 스트리밍 실행 모델을 사용한다.
- Volcano 스타일을 기반으로 작업을 멀티코어에 분산한다.
- Streaming Execution
  - 가능 여부를 떠나서 모든 연산자는 출력을 증분해서 생성한다.
  - Arrow 배열은 `RecordBatches`로 묶인다.
  - 파이프라인을 깨는 연산(풀 정렬, 최종 집계, 해시 조인)은 필요하다면 디스크에 스필한다.
```rust
impl Stream for MyOperator {
  ...
  // Pull next input (may yield at await)
  while let Some(batch) = stream.next().await {
    // Calculate, check if output is ready
    if Some(output) = self.process(&batch)? {
      // "Return" RecordBatch to output
      tx.send(batch).await
    }
  }
}
```
- Multi-Core Execution
  - 각 실행계획은 하나 이상의 스트림으로 실행된다.
  - 스트림들은 병렬 실행된다.
  - 대부분의 스트림은 각 입력만 처리하면 된다.
  - 때로는 형제 스트림과 조정이 필요하다.
    - 해시조인시 공유 해시 테이블을 만들 때
    - 리파티션시 다른 스트림에 재분배할때
  - 각 실행계획이 생성한 스트림 수는 파티셔닝이라 한다.
    - 계획시점에 결정된다.
- Thread Scheduling
  - 스트림은 러스트 `async` 함수로 구현된다.
  - Tokio 런타임으로 구현된 스레드 풀에서 실행된다.
    - 비동기 네트워크 입출력 및 CPU 집적 애플리케이션에 효과적
- Memory Management
  - `MemoryPool`로 메모리 관리
    - 동시 실행 쿼리 간 공유된다.
  - 2가지 내장 메모리풀 구현
    - `GreedyPool`
      - 프로세스별 메모리 제한을 강제
      - 쿼리 내 스트림 간 공정한 자원 분산은 하지 않는다.
    - `FairPool`
      - 파이프라인을 깨는 연산 스트림 간 동일한 리소스를 분배한다.

## 최적화