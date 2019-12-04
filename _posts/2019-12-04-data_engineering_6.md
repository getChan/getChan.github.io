---
title: "DE 스터디(6) - Hadoop ​:elephant:​"
excerpt: "data engineering 스터디 정리입니다."

categories:
  - data
tags:
  - study
  - linux
  - dataEnginnering
  - hadoop
last_modified_at: 2019-12-04T08:06:00-05:00
---
​:elephant:​

# Parallel Computing

## 병렬 처리

- 여러 개의 코어를 사용하여 동시에 연산을 처리하는 것
- 크고 복잡한 문제를 작게 나누어 빠르게 해결
- 프로세서(코어)간 커뮤니케이션은 shared memory또는 message passing으로 이루어짐
- 병렬 처리의 종류
  - 비트 수준(BLP)
    - 프로세스가 처리하는 비트 수를 늘려서 속도 향상
    - Instruction level parallelism
  - 데이터 수준(DLP)
    - 프로그램 루프에 내재된 병렬화
    - task-level parallelism

## 분산 처리

- 인터넷에 연결된 여러 컴퓨터들의 처리 능력을 이용하여 거대한 계산 문제를 해결하는 기술
- 가상의 대용량 고성능 컴퓨터(super virtual computer)를 구성하여 처리
- 컴퓨터들은 익명이며, 각자 메모리를 보유하고 있음
- 병렬 처리와 다르면서도 비슷한 개념(다중 코어 사용 연산은 병렬 처리와 동일)
- 분산 처리의 특징
  - 고가용성(High Availability)
    - 한 대의 노드가 고장나더라도 다른 노드에서 연산을 이어서 수행 가능하다
  - 위치 투명성(Transparency)
    - 네트워크에 연결된 노드들은 모든 자원을 로컬 자원처럼 다룰 수 있어야 함 -> 분산파일시스템(DFS) 제공
  - 수평 확장성(Scale-Out)
    - 노드 자체의 성능을 올리는 것이 아니라, 노드를 추가함으로써 시스템 성능 향상

## Cloud Computing

- 정보를 자신의 컴퓨터가 아닌 인터넷에 연결된 다른 컴퓨터(데이터센터)에서 처리하는 기술
- 병렬 처리와 분산 처리를 활용
- 구성 가능한 컴퓨팅 자원(서버, 저장소 등)에 대해 어디서나 접근 가능
- 주문한 만큼 자원 사용
  - 자원을 유연하게 운용 가능하고 self-design 용이

# Hadoop

- High Availability **distributed** Object-Oriented platform
- 분산 컴퓨팅(클라우드 컴퓨팅) 기술을 활용한 대용량 데이터 분산 처리
- 빅데이터를 위한 범용 저장소 및 분석 플랫폼 제공
- 단일에서 수천 대의 머신으로 확장 가능하도록 설계
- java로 구현

- 장점
  - 오픈소스로 라이선스 비용 부담 감소
  - 시스템 중단 없이 장비 추가 용이(Scale-Out)
  - 안정적이고 확장성이 높음
    - 하둡을 기바느로 다양한 오픈소스 프레임워크가 구현되어 있음 (ex. spark)
    - 일부 장비에 장애가 발생해도 전체 시스템에는 영향이 없음(fault-Tolerance)
  - 대용량 데이터의 일괄(배치) 처리 가능
- 단점
  - 저장된 데이터 변경 불가(안정성을 위함)
    - 변경은 데이터 삭제 후 새로 생성하는 것
  - 속도가 느림 -> 실시간 데이터 처리에 부적합
  - 설치와 설정이 어려움

## 구성 요소

- 하둡 일반
  - 다른 모듈을 지원하기 위한 공통 Component
- HDFS
- YARN (Resource Manager, Job Scheduler)
  - 전체적으로 job을 분배
- MapReduce
- Oozie (Job Scheduler)
  - MapReduce job이 잘 실행되고 있는지

> 스파크는 하둡 위에서도 실행 가능하고 독립적으로도 실행 가능하다.

## HDFS
- 블록 : HDFS로 읽거나 기록할 수 있는 데이터의 최소량
  - 기본 블록 크기는 64MB
- 네임 노드, 데이터 노드
  - 네임 노드(마스터)

## MapReduce

**병렬 처리 프로그래밍 모델**

- 단계
  - Split
  - **Map**
  - Combiner
  - Partitioner
  - Shuffle(sort)
  - Sort
  - **Reduce**
  - Output

## Oozie

- 여러 Job의 파이프라인을 만드는 시스템
  
## Yarn

**Yarn Scheduler** 중요하다
- FIFO scheduler
- Capacity scheduler
- Fair Scheduler

# Spark

- 인메모리 분산 데이터 분석 시스템 (클러스터 컴퓨팅 프레임워크)
- **RDD 데이터 타입(변하지 않는 데이터 셋)** : RAM을 ROM처럼 활용
- MR 모델을 대화형 명령어 쿼리나 스트리밍, 머신 러닝이 가능하도록 확장
- Scala 언어로 구현되어 있으며, 자바 가상 머신(JVM)으로 실행됨
- **MapReduce 과정을 알아서 처리해 줌**

## Spark Application 실행 구조

- 드라이버
  - 역할
    - 사용자 프로그램을 태스크로 변환
    - 익스큐터 태스크 스케줄링
    - 스파크 app. 정보 관리
- 익스큐터
  - **주어진 Spark 작업의 개별 태스크들을 실행하는 작업 실행 프로세스**
- 클러스터 매니저
  - **드라이버 실행 관리**
  - Spark에 붙이거나 뗄 수 있는 형태의 구성 요소
  - 다양한 외부 매니저 자원
- Spark Session과 언어 API
  - 다양한 언어로 스파크 코드 실행 가능
  - Spark Session은 익스큐터에 태스크를 전달하기 전에 JVM에서 실행할 수 있는 코드로 변환
- Spark Application 실행 단계
  1. 드라이버 위에 있는 사용자 코드가 RDD 논리 그래프 생성
  2. 논리 그래프를 실행 계획(태스크)로 변환
  3. 태스크 스케쥴링 및 실행

## Spark 단점
- 높은 메모리 요구
- 연속적인 처리에 유리(간단한 분석의 경우 타 모델과 큰 차이 없음)
- 딥 러닝의 경우(빠르기는 하지만) 실시간 처리 어려움
  - Spark에서 GPU 프로그래밍은 아직 불가능.
  - 딥러닝은 아직 GPU로 쓰고 있다
- 불안정성(RAM의 처리로 데이터 유실 가능성)

## RDD

### RDD 연산

- Transformation
- Action

> spark 2.0 버전부터는 RDD 연산을 직접 하는 경우가 드물다.

- **Lazy-Excution(여유로운 실행)**
  - **Lineage(계보)** : 동일 RDD를 생성하는 설계도 = RDD 관계도(그래프)


## Spark management

> 하둡의 리소스 관리와 유사하다.

## Spark Components

- DataFrame
- DataSets
- Spark ML
  - 변환자 : 원시 데이터를 다양한 방식으로 변환하는 함수
    - ex) One-hot-encoding
  - 추정자
    - 데이터 정규화(변환 초기화)
    - 모델을 학습시키지 위해 사용하는 알고리즘
    - ex) model fitting
  - 평가기 : 모델 성능 테스트
    - evaluation

### Spark Streaming
- **실시간 데이터 스트림 처리**
  - 맵리듀스 속도가 100배 빨라졌기 때문에 가능해졌다
- 마이크로배치 아키텍처

### Structured Streaming
- 데이터 스트림을 테이블로 표현
- 모든 처리를 Table로 한다

- 입력 테이블
- 결과 테이블
- Trigger : 데이터가 입력 테이블에서 처리되는 타이밍
- 처리 모드

### Spark GraphX

그래프 처리를 위한 확장 RDD 제공
- 노드(객체)와 간선(관계)
  
그래프 알고리즘과 그래프 빌더 포함