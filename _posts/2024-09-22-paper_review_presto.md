---
title: "Presto 논문"
excerpt: "Presto: SQL on Everyting"
categories:
  - data
tags:
  - data
last_modified_at: 2024-09-22T08:00:00-08:00
---

논문 [Presto: SQL on Everything](https://trino.io/Presto_SQL_on_Everything.pdf)

# Abstract
Presto는 Facebook 내 SQL 분석 워크로드에 대부분을 지원하는 분산 쿼리 엔진이다. Presto의 커넥터 API는 고성능 입출력 인터페이스를 제공하기 위해 플러그인을 허용한다. 하둡 데이터 웨어하우스, RDBMS, NoSQL시스템, 스트림 처리 시스템 등이 플러그인에 포함된다. 이 논문에서는 Facebook에서 Prestor 가 지원하는 유즈케이스를 먼저 소개하고 아키텍처와 구현을 설명한다. 이후 유즈케이스를 위한 특직과 성능 최적화를 소개한다. 마지막으로 성능 결과를 소개한다.

# Introduction
큰 데이터에서 빠르고 쉽게 인사이트를 추출하는 능력은 점점 중요해진다. 큰 데이터를 수집하고 저장하는 것이 싸지면서, 빠르고 쉬운 쿼리는 더 중요해졌다. SQL과 같은 쿼리 언어를 사용하면 조직 내 많은 사람들의 데이터 분석 접근성을 좋게 한다. 그러나 조직 내 호환되지 않는 여러 SQL-like 시스템을 사용하면 사용성은 떨어진다. 

Presto는 2013년에 Facebook에서 만들었다. AWS Athena또한 Presto로 만들어졌다. 

Presto는 ANSI SQL을 지원한다. 하둡, RDBMS, NoSQL 시스템, Kafka와 같은 스트리밍 시스템에 쿼리할 수 있다. 'Generic RPC' 커넥터를 활용하면 쉽게 SQL 인터페이스를 추가할 수 있다. Presto는 HTTP API, JDBC 를 지원하며 업계 표준 BI도구와 호환된다. 빌트인 하이브 커넥터는 HDFS/S3 와 같은 분산 파일 시스템에 네이티브하게 r/w 할 수 있다. ORC, Parquet, Avro와 같은 파일 포맷도 지원한다.

Presto는 대화형/BI 쿼리와 장시간 배치 ETL잡을 수행하고 A/B 테스팅에도 사용된다. 매일 Facebook의 수백 페타바이트 데이터와 수조개 행을 처리한다.

Presto 특징
- 멀티 테넌트. 수백 개의 메모리, 입출력, CPU집중 쿼리를 수행한다. 클러스터 리소스를 활용하면서 수천 개의 워커 노드로 확장된다. 
- 확장성. 하나의 쿼리로 여러 데이터 소스를 처리할 수 있다. 여러 시스템을 통합하는 복잡성을 줄인다.
- 유연성. 다양한 유스케이스를 지원한다.
- 고성능. 코드 생성을 포함한 여러 기능과 최적화가 가능하다. 여러 쿼리는 워커 노드 내 하나의 long-lived JVM 프로세스를 공유한다. 이는 응답 시간을 줄이지만 통합된 스케줄링, 리소스 관리와 고립성을 요구한다.

# Use Cases

## Interactive Analytics
페이스북은 대량의 멀티테넌트 데이터 웨어하우스를 운영중이다. 비즈니스 함수와 조직 유닛은 운영 클러스터의 작은 집합을 공유한다. 데이터는 분산 파일시스템에 저장되고 메타데이터는 별도 서비스에 저장된다. 이러한 시스템은 HDFS, Hive metastore service와 유사한 API를 가진다. 이를 'Facebook Data warehouse'라 부르며 Presto의 Hive 커넥터 변형을 이용해 읽고 쓴다. 

엔지니어와 데이터 사이언티스트들은 가설 검증, 시각화 혹은 대시보딩을 위해 적은 양의 데이터(~50GB-3TB compressed)를 주로 수행한다. 유저는 주로 쿼리 작성 도구, BI도구, Jupyter notebook를 사용한다. 각 클러스터는 다양한 형태의 50~100개 쿼리를 동시 수행하며 수초/분 내 결과를 반환해야 한다. 유저는 **수행 시간에 예민하며 쿼리 자원 요구사항에 관심이 없다.** 유저는 탐색 분석 대부분에서 전체 결과 반환을 요구하지 않는다. 쿼리는 최초 결과 반환 후 취소되거나 `LIMIT` 절을 사용하여 반환 데이터를 제한한다.

## Batch ETL
새로운 데이터는 일정 간격의 ETL쿼리를 수행함으로써 데이터 웨어하우스에 적재된다. 쿼리는 task들의 의존성을 결정하고 적절하게 스케줄링하는 워크플로 관리 시스템에 의해 스케줄링된다. Presto는 레거시 배치 처리 시스템으로부터의 이전을 지원한다. 또한 ETL쿼리는 CPU의 많은 부분을 차지한다. 이러한 쿼리들은 데이터 엔지니어에 의해 작성되고 최적화된다. ETL 쿼리들은 대화형 분석 쿼리보다 리소스를 많이 사용한다. 또한 CPU-heavy한 변환과 메모리 집약적 집계 혹은 조인을 사용한다. **쿼리 지연은 리소스 효율성과 클러스터 처리량보다 상대적으로 덜 중요하다.**

## A/B Testing
A/B 테스팅은 통계적 가설 검증을 통한 제품 변경의 임팩트를 평가하는 것이다. Facebook 내 대부분의 A/B 테스트 인프라는 Presto에서 수행된다. 유저들은 테스트 결과가 몇 시간 내 제공되며 정확하기를 기대한다. 또한 유저가 더 깊은 통찰력을 얻기 위해 대화형 대기 시간(∼5-30초) 내에서 결과에 대해 임의의 slice와 dice를 수행할 수 있어야 한다. 미리 집계하는 방식으로 요구사항을 충족하는 것은 어렵다. 때문에 결과는 즉시 계산되어야 한다. 연산은 여러 데이터 셋을 조인해야 한다. 쿼리는 작아야 한다. 

## Developer / Advertiser Analytics

외부 개발자나 광고주를 위한 리포팅 도구는 Presto를 사용한다. *Facebook Analytics* 는 Facebook 플랫폼을 사용하여 애플리케이션을 개발하는 개발자를 위한 분석 도구이다. 이는 제한된 쿼리 집합을 사용하여 웹 인터페이스를 노출한다. 집계 데이터 크기는 크지만 쿼리는 매우 선택적이다. 유저가 그들의 앱과 광고에만 접근하기 때문이다. 대부분의 쿼리는 조인, 집계, 윈도우 함수를 포함한다. 데이터 수집 지연 시간은 수분이며 쿼리 지연시간은 수초 내로 매우 제한적이다. 클러스터 99.999%의 가용해야 하며 많은 유저의 수백개 동시 쿼리를 지원해야 한다.

> 느낀점
> - 배치 ETL에도 쓰는군.
> - 유즈케이스가 우리 회사 상황과 비슷하군.

# Architecture Overview
Presto 클러스터는 단일 코디네이터 노드와 하나 이상의 워커 노드로 구성된다.
- 코디네이터는 쿼리를 받아서 파싱하고 계획하고 최적화한다. 또한 쿼리간 조정을 담당한다.
- 워커 노드는 쿼리를 처리한다.

![](https://velog.velcdn.com/images/jjs1216/post/770c9489-1781-4f93-be9c-c873386576ad/image.png)

1. 클라이언트는 코디네이터에게 SQL 구문을 담은 HTTP 요청을 보낸다.
2. 코디네이터는 쿼리 정책 평가, SQL파싱 및 분석, 분산 실행 계획을 생성 및 최적화하여 요청을 처리한다.
3. 코디네이터는 계획을 워커에게 분배하고 task의 수행을 시작한다. 그리고 외부 저장소에 있는 데이터 청크를 처리하는 splits를 나열한다. splits는 task에 할당되어 데이터를 읽는 역할을 한다.
4. 워커 노드는 task를 실행한다. task는 splits를 처리해 외부 저장소에서 데이터를 가져오거나, 다른 워커에서 생성한 중간 결과를 처리한다. 

- 워커는 많은 쿼리에서 발생한 쿼리를 동시에 처리한다.
- task 실행은 가능한 파이프라인되고 데이터는 사용 가능하지면 task간 전달된다.
- 특정 쿼리에서는 모든 데이터가 처리되기 전 결과를 반환할 수 있다.
- 중간 데이터와 상태는 가능한 인메모리에 저장된다.
- 노드 간 데이터 셔플될 때는 최소 지연시간을 위해 버퍼링이 조정된다.

Presto는 확장 가능하여 다영한 플러그인 인터페이스를 제공한다. 플러그인은 커스텀 데이터 타입, 함수, 접근 제어, 이벤트 컨슈머, 쿼리 정책, 설정 프로퍼티를 제공한다. 

또한 presto가 외부 데이터 저장소와 통신할 수 있는 connectors를 제공한다.
- Connector API는 메타데이터 API, 데이터 위치 API, 데이터 소스 API, 데이터 싱크 API 4가지로 구성된다.
- API는 물리적으로 분산된 실행 엔진 환경에서 효율적인 구현을 허용하도록 설계되었다.

# System Design

## A. SQL Dialect
Presto는 ANSI SQL 명세를 따른다. 명세의 모든 기능을 구현한 것은 아니지만 구현된 기능은 가능한 명세를 지원한다. 사용성을 위한 적은 확장만 추가로 만들어져 있다. 예를 들어 ANSI SQL에서 맵과 배열 타입과 같은 복잡한 타입의 연산은 까다롭다. 이를 단순화하기 위해 익명 함수와 내장 고차 함수(transform, filter, reduce)를 지원한다.

## B. Client Interfaces, Parsing, and Planning
1. 클라이언트 인터페이스 : 코디네이터는 주로 RESTful HTTP 인터페이스를 노출하고 CLI도 지원한다. 다양한 BI도구와 호환되는 JDBC 드라이버도 지원한다. 
2. 파싱 : SQL문을 구문 트리로 변환하기 위해 ANTLR 기반의 파서를 사용한다. 분석기는 타입 결정, 변환, 함수 해석, 스코프, 서브쿼리, 집계, 윈도우 등을 결정하기 위해 트리를 사용한다. 
3. 논리 계획 : 논리 플래너는 구문 트리와 분석 정보를 이용해서 plan node의 트리 형태로 인코딩된 중간 표현(IR)을 생성한다. 각 노드는 물리적 논리적 연산을 나타낸다. 계획 노드의 자식은 입력값이다. 플래너는 완전히 논리적인 노드를 생성한다. **어떻게** 계획이 실행될 지에 대한 정보는 갖지 않는다. 

![](https://dt5vp8kor0orz.cloudfront.net/deb3b1023aa97d164a291e64032fa3f05d566a58/3-Figure2-1.png)

## C. Query Optimization
논리 계획을 효율적인 실행 전략을 가진 물리적인 구조로 변환한다. 특정 지점에 도달하기까지 greedy하게 변환 규칙 집합을 평가한다. presto는 predicate, limit 푸시다운, column pruning, decorrelation 등의 룰을 가진다. 테이블과 컬럼 통계를 사용해 조인 전략 선택, 조인 재정렬 등 비용 기반의 최적화도 한다. 
  1. Data Layouts : 옵티마이저는 커넥터 Data Layout API를 통해 데이터의 물리적 layout을 알 수 있다. 커넥터는 위치, 파티셔닝, 정렬, 그룹핑, 인덱스 등 데이터 속성을 알려준다. 단일 테이블에서 다른 속성을 가진 여러 layout을 반환할 수 있다. 옵티마이저는 최적의 layout을 선택한다.
  2. Predicate Pushdown : 옵티마이저는 range와 equality predicate을 커넥터에게 전달하여 데이터를 효과적으로 필터링할 수 있다. MySQL 커넥터는 데이터가 존재하는 샤드만 조회한다. 여러 레이아웃이 있다면 predicate 컬럼에 인덱싱된 레이아웃을 선택한다. 하이브 커넥터는 partition pruning 및 파일 포맷 특징을 활용해서 성능 향상한다.
  3. Inter-node Parallelism : 계획에서 워커간 병렬 수행될 부분(**stage**)를 식별한다. stage는 하나 이상으로 분산된다. 각각 다른 집합의 입력 데이터에서 동일한 계산을 수행한다. 엔진은 버퍼된 인메모리 데이터 전송(**shuffle**)을 통해 stage간 데이터를 전달한다. 셔플은 지연시간, 버퍼 메모리, 높은 CPU 오버헤드를 추가한다. 때문에 옵티마이저는 총 셔플 수를 신중하게 추론해야 한다.
  4. Intra-node Parallelism : 옵티마이저는 단일 노드에서 스레드로 병렬화할수 있는 부분을 식별한다. 이전시간 오버헤드와 상태(해시테이블 등) 이 효율적으로 스레드 간 공유될 수 있기에 노드간 병렬화보다 노드내 병렬화가 더 효율적이다. 엔진은 단일 파이프라인을 여러 스레드에서 수행할 수있다. 

![](https://dt5vp8kor0orz.cloudfront.net/deb3b1023aa97d164a291e64032fa3f05d566a58/4-Figure3-1.png) ![](https://dt5vp8kor0orz.cloudfront.net/deb3b1023aa97d164a291e64032fa3f05d566a58/5-Figure4-1.png)

## D. Scheduling
