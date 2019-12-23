---
title: "분산컴퓨팅(4)-Hive:bee: and Sqoop"
excerpt: "빅데이터분산컴퓨팅 강의 정리"

categories:
  - data
tags:
  - dataEnginnering
  - hadoop
last_modified_at: 2019-12-22T08:06:00-05:00
---

> 숭실대학교 박영택교수님의 "빅데이터분산컴퓨팅" 강의를 참고했습니다.

# Hive:bee:

- Facebook에서 시작
- "ETL"은 python을 통해 구현됨

## motivation

- Yahoo는 Hadoop에서의 어플리케이션 작업을 가능케 하기 위해 pig를 사용해 작업함
  - 주 사용 목적은 unstructured data의 처리
- Facebook은 Hadoop에서의 warehouse solutions 작업을 전개하였고, Hive 개발로 이어짐
- MR의 한계점
- M/R model을 사용해야 함
- 재사용 불가
- 에러가 발생하기 쉬움
- MapReduce함수의 다중 stage 필요함

## Overview

- Intuitive
  - Unstructured data를 테이블처럼 보이게 함
  - 이 테이블에 SQL 쿼리를 직접 사용할 수 있음
  - 해당 쿼리에 대해 지정된 excution plan을 수립함
- What's Hive
  - structured data를 Hadoop file system에 저장하기 위한 data warehousing system
  - excution Hadoop / MapReduce plans을 통해 사용하기 쉬운 쿼리를 제공함

## Pros

- 대용량 데이터를 쉽게 처리할 수 있음
- SQL queries를 제공
- 사용자가 정의한 확장 인터페이스 제공
- Programmability
- Efficient execution plans를 제공
- 다른 데이터베이스와의 상호 연동성

## Cons

- 데이터를 추가하는 방법이 쉽지 않음
- HDFS안의 파일은 수정 불가

## Application

- Log processing
  - Daily Report
  - 사용자행위평가 및 예측
- Data / Text mining
  - 기계학습
- Business inteligence
  - 광고 배달
  - 스팸 메일 감지

## Architecture

![image-20191222162115532](E:\getChan.github.io\assets\images\distributed_system\hive_1.png)

## HiveQL

- Subset of SQL
- Mata-Data queries
- Limited equality 와 join predicates
- No interts on existing tables (to preserve worm property)
  - 전체 테이블을 덮어 쓸 수 있음

# Sqoop

Hadoop 과 RDB 사이의 데이터 전송 툴

![image-20191222163741052](E:\getChan.github.io\assets\images\distributed_system\hive_2.png)



## Importing Data with Sqoop

> gcp인스턴스에 docker로 예제 hadoop 환경을 구축해놓았다(Cloudera). 해당 환경에서 Sqoop을 통해 RDB 내의 데이터를 HDFS에 적재해보자.

- Sqoop 명령어를 이용해 db list 확인

  ```shell
  $sqoop list-databases --connect jdbc:mysql://localhost\
  --username root --password cloudera
  ```

  ```
  Warning: /usr/lib/sqoop/../accumulo does not exist! Accumulo imports will fail.
  Please set $ACCUMULO_HOME to the root of your Accumulo installation.
  19/12/22 07:44:38 INFO sqoop.Sqoop: Running Sqoop version: 1.4.6-cdh5.7.0
  19/12/22 07:44:38 WARN tool.BaseSqoopTool: Setting your password on the command
  -line is insecure. Consider using -P instead.
  19/12/22 07:44:39 INFO manager.MySQLManager: Preparing to use a MySQL streaming
   resultset.
  information_schema
  cm
  firehose
  hue
  metastore
  mysql
  nav
  navms
  oozie
  retail_db
  rman
  sentry
  ```

- Sqoop 명령어를 이용해 `retail_db` db 안의 테이블 목록 확인

  ```shell
  $sqoop list-tables --connect jdbc:mysql://localhost/retail_db \
  --username root --password cloudera
  ```

  ```
  Warning: /usr/lib/sqoop/../accumulo does not exist! Accumulo imports will fail.
  Please set $ACCUMULO_HOME to the root of your Accumulo installation.
  19/12/22 07:50:13 INFO sqoop.Sqoop: Running Sqoop version: 1.4.6-cdh5.7.0
  19/12/22 07:50:13 WARN tool.BaseSqoopTool: Setting your password on the command
  -line is insecure. Consider using -P instead.
  19/12/22 07:50:13 INFO manager.MySQLManager: Preparing to use a MySQL streaming
   resultset.
  categories
  customers
  departments
  order_items
  orders
  products
  ```

- `customers` 테이블을 HDFS로 가져오기

  ```shell
  $sqoop import \
  --connect jdbc:mysql://localhost/retail_db \
  --table customers --fields-terminated-by '\t' \ 
  --username root --password cloudera
  ```

> 이 과정에서 많은 문제가 발생했다.
>
> 1. 도커 컨테이너에서 하둡 서비스들이 전부 꺼짐
> 2. 서비스를 재실행하는 cloudera 쉘 스크립트가 알 수 없는 에러가 남
> 3. 쉘 스크립트 수정해서 일부 서비스 재실행 성공
> 4. 하둡을 비정상적으로 종료해서 safe mode 진입함
> 5. safe mode OFF
> 6. hadoop job이 실행되지 않음 (`The auxService:mapreduce_shuffle does not exist`)
> 7. [yarn 설정파일 수정으로 해결](https://community.cloudera.com/t5/Support-Questions/I-run-a-Hadoop-job-but-it-got-stucked-and-nothing-is/td-p/47856/page/2)
> 8. **Shuffle 단계에서 메모리 부족으로 process kill 됨** :sob:





