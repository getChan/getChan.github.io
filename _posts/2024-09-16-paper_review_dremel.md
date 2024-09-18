---
title: "Dremel 논문"
excerpt: "Dremel: Interactive Analysis of Web-Scale Datasets"

categories:
  - data
tags:
  - data
last_modified_at: 2024-09-16T08:00:00-08:00
---

논문 [Dremel: Interactive Analysis of Web-Scale Datasets](https://research.google.com/pubs/archive/36632.pdf)

# Abstract
- 확장 가능한 대화형 애드혹 쿼리 시스템. 
- 읽기 전용 데이터를 분석하는데 쓰인다.
- 다계층 실행 트리와 컬럼 기반 데이터 레이아웃을 결합한다.
- 1조개 행 집계 쿼리를 수초 내 실행 가능
- 수천개 CPU와 페타바이트 급 데이터로 확장 가능
- 맵리듀스 기반 연산을 보완했다.

# Introduction
- Dremel은 MapReduce의 완전한 대안은 아니다.
- Dremel은 웹 검색과 병렬 DBMS 아이디어를 기반으로 한다.
  - 1. 아키텍처는 분산 검색 엔진의 서빙 트리 개념을 차용한다. 쿼리는 트리에서 푸시 다운되며 각 단계별로 재작성된다. 쿼리의 결과는 트리의 저수준에서 받은 응답을 집계하여 구성된다.
  - 2. 애드혹 쿼리를 위한 고수준 SQL-like 언어를 제공한다. Hive나 Pig와는 다르게 MR job으로 변환하지 않고 native하게 실행한다.
  - 3. 컬럼 기반 저장 표현을 사용한다. 이는 보조 저장장치로부터 더 적은 데이터를 읽을 수 있게 하고, 효율적인 압축으로 CPU를 적게 사용한다.
- 논문에서 소개할 것들
  - 1. 중첩된 데이터에 대한 새로운 컬럼 기반 저장 형식. 그리고 중첩 레코드를 컬럼으로 분해하고 조립하는 알고리즘
  - 2. Dremel의 쿼리 언어와 실행에 대한 개괄. 컬럼 기반의 중첩 데이터에서 효과적으로 수행하도록 설계됨.
  - 3. 웹 검색에서 사용되는 실행 트리가 데이터베이스 처리에 어떻게 적용되는지. 집계 쿼리를 효율적으로 수행하는 데 있어 어떤 도움이 되는지.
  - 4. 1조 레코드, 수 테라바이트 데이터셋에 대한 1000~4000개 노드에서의 실험. 

# Data Model
Protocol Buffers라 불리는 데이터 모델은 강타입 중첩 레코드 구조이다.

$$τ = dom | ⟨A1 : τ[∗|?],...,An : τ[∗|?]⟩$$
- $τ$는 원자 또는 레코드 타입을 나타낸다.
  - 원자 타입은 정수, 부동소수점 문자열 등을 나타낸다.
  - 레코드 타입은 1개 이상의 필드를 가진다. $*$는 여러 레코드가 올 수 있음을 나타내고, $?$는 필드가 없을 수 있음을 나타낸다.

예시
![](https://miro.medium.com/v2/resize:fit:1268/format:webp/1*5KAWZ8wncEouLmopUJ7ZdQ.jpeg)

> copilot. **dremel encoding vs parquet?**
> 
> 1. Origin and Usage: Dremel encoding was developed by Google for use in their Dremel system, which is used for interactive analysis of large datasets. Parquet, on the other hand, was developed by Twitter and Cloudera for use in the Hadoop ecosystem, and is often used with tools like Apache Spark and Apache Hive.
> 
> 2. Data Model: Both Dremel and Parquet support nested data structures. However, Dremel uses a model based on Protocol Buffers, while Parquet uses a model based on Apache Avro.
> 
> 3. Encoding and Compression: Both Dremel and Parquet support a variety of encoding and compression techniques. However, Parquet is often praised for its efficient use of encoding and compression to reduce storage space and increase query performance.
> 
> 4. Compatibility: Dremel encoding is primarily used within Google's ecosystem. Parquet, being an open-source project, has wider compatibility with various big data processing tools in the Hadoop ecosystem.

# Nested Columnar Storage
주어진 필드의 모든 값을 연속적으로 저장하여 접근 효율을 높여야 한다.
  
## Repetition and Definition Levels
값만 가지고는 레코드의 구조를 전달할 수 없다. 컬럼 기반의 레코드 구조에서 무손실 표현을 위해 필요하다.
![](https://miro.medium.com/v2/resize:fit:1364/format:webp/1*tq5rrNEhmuHKilpOqmdM9A.jpeg)

**반복 수준**
- 값은 반복될 수 있다. (figure 2 r1 참고). 
- 반복 수준 : 반복된 값 중에서, 어떤 필드의 값인지를 알려준다.

**정의 수준**
- 얼마나 많은 필드가 정의되지 않을 수 있는지(optional 혹은 repeated 때문에) 를 알려준다.

**인코딩**
- 각 컬럼은 블록의 집합으로 저장된다. 
  - 각 블록은 반복과 정의 수준을 포함한다.
  - 그리고 압축된 필드값을 가진다.

> 이해가 잘 안된다...

## Splitting Recoreds into Columns
