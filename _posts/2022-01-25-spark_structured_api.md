---
title: "Spark 구조적 API"
excerpt: "Spark High Level API"

categories:
  - data
tags:
  - spark
last_modified_at: 2022-01-25T08:06:00-05:00
---

구조적 API 는 다양한 유형의 데이터를 처리할 수 있다. 세 가지 분산 컬렉션 API가 있다.
- Dataset
- DataFrame
- SQL 테이블과 뷰

배치와 스트리밍 처리에서 사용할 수 있고 구조적 API를 활용하면 배치와 스트리밍을 쉽게 변환할 수 있다.

# DataFrame, Dataset

- 불변이다.
- 실행 계획 수립과 처리에 사용하는 자체 데이터 타입 정보를 가지고 있는 **카탈리스트** 엔진을 사용한다.
- JVM 타입 대신 자체 데이터 포맷을 사용하여 GC와 객체 초기화 부하가 적다.
- 아무튼 최적화된 내부 포맷을 이용할 수 있다.
- spark 2.0에서 Dataframe은 Dataset으로 흡수되었다.

| DataFrame (==`Dataset<Row>`) | Dataset                 |
| ---------------------------- | ----------------------- |
| 비타입형                     | 타입형                  |
| 런타임에 타입 체크           | 컴파일 타임에 타입 체크 |
| python, R, Java, Spark       | 스칼라, 자바에서만 지원 |

# 실행 과정

1. 논리적 실행 계획
   
   사용자 코드를 논리적 실행 계획으로 변경한다. 이 과정에서는 추상적 트랜스포메이션만 표현하고 사용자의 표현식을 최적화한다.(검증 전 논리적 실행 계획)

   spark analyzer는 카탈로그, DataFrame 정보를 활용하여 검증한다(검증된 논리적 실행 계획)

   카탈리스트 옵티마이저는 논리적 실핼 계획을 최적화한다.

2. 물리적 실행 계획

   논리적 실행 계획을 클러스터 환경에서 실행하는 방법을 정의한다.
   다양한 물리적 실행 전략을 생성하고 비용 모델을 이용해서 비교 후 최적의 전략을 선택한다. 

   물리적 실행 계획은 일련의 RDD와 트랜스포메이션으로 변환된다.

3. 실행
   
   RDD를 대상으로 모든 코드를 실행하고 처리 결과를 반환한다.


# RDD

스파크의 저수준 API.

다음과 같은 경우 사용한다
- 고수준 API에서 제공하지 않는 기능이 필요한 경우. 클러스터의 물리적 데이터 배치를 세밀하게 제어해야 하는 경우
- RDD로 된 기존 코드를 유지해야 하는 경우
- accumulator, broadcast와 같은 분산형 공유 변수를 다뤄야 하는 경우

모든 DataFrame/Dataset은 RDD로 컴파일된다. 구조회된 API의 각 레코드는 스키마를 알고 있는 필드로 구성된 반면, RDD의 레코드는 자바, 스칼라, 파이썬 객체일 뿐이다.

따라서 개발자가 강력한 제어권을 가질 수 있다. 그러나 레코드의 내부 구조를 스파크에서 파악할 수 없어 최적화가 불가능하다.

> ## HBase-Spark
>
> hbase-spark 라이브러리에서는 RDD를 사용하면 Scan 객체를 직접 통제할 수 있으므로 원하는 필터를 추가할 수 있다. 스파크 최적화보다 스캔 필터 추가가 성능이 더 좋을수도...
>
> hbase-spark ('org.apache.hbase:hbase-spark:jar:2.0.0-alpha4') 코드 들여다봤는데, SparkSQL 을 이용했을때는 HBase에서의 Filter를 최적화하거나 사용하지 않는다. 단, 조건절 푸시다운 등 스파크 최적화는 지원한다.
>
> hbase-spark 이용하면 RDD의 파티셔닝을 리전별로 해준다.


# 참고

- 책 "스파크 완벽 가이드"
- [https://www.popit.kr/spark2-0-new-features1-dataset/#:~:text=Datasets,-spark2.0%20api&text=Spark2.0%EB%B6%80%ED%84%B0%EB%8A%94%20Dataset%EC%9D%80,%EB%90%98%EC%A7%80%20%EC%95%8A%EB%8A%94%20JVM%EA%B0%9D%EC%B2%B4%EC%9D%B4%EB%8B%A4](https://www.popit.kr/spark2-0-new-features1-dataset/#:~:text=Datasets,-spark2.0%20api&text=Spark2.0%EB%B6%80%ED%84%B0%EB%8A%94%20Dataset%EC%9D%80,%EB%90%98%EC%A7%80%20%EC%95%8A%EB%8A%94%20JVM%EA%B0%9D%EC%B2%B4%EC%9D%B4%EB%8B%A4)