---
title: "MySQL 락"
excerpt: "mysql lock 개념에 대한 정리"
categories:
  - data
tags:
  - database
  - mysql
  - lock
last_modified_at: 2020-07-26T08:06:00+09:00
---

 MySQL서버의 락

- 스토리지 엔진 레벨
  -  스토리지 엔진 간 상호 영향을 미치지 않는다.
- MySQL 엔진 레벨
  - 모든 스토리지 엔진에 영향을 미친다.
  - 테이블 락 이외에 유저 락, 네임 락을 제공한다.

# MySQL 엔진의 잠금

## 글로벌 락

- `FLUSH TABLES WITH READ LOCKS` 명령으로 획득할 수 있다. 
- MySQL에서 제공하는 락 가운데 가장 범위가 크다.
- 한 세션에서 글로벌 락을 획득하면 다른 세션에서 SELECT를 제외한 대부분의 DDL, DML 문장을 실행하는 경우 글로벌 락이 해제될 때까지 대기 상태로 남는다.
- MySQL 서버 전제에 영향을 미친다.
- 작업 대상 테이블, 데이터베이스에 관계없이 영향을 미친다.
- `mysqldump` 같은 백업 프로그램은 내부적으로 이 명령을 실행할 때가 많다.

## 테이블 락

- 개별 테이블 단위로 설정되는 잠금
- 명시적 / 묵시적으로 특정 테이블의 락을 획득할 수 있다.
- 명시적으로 `LOCK TABLES table_name [ READ | WRITE ]`명령으로 특정 테이블의 락을 획득할 수 있다.
  - `UNLOCK TABLES` 명령으로 잠금을 해제할 수 있다.
- 묵시적인 테이블 락은 MyISAM 이나 MEMORY 테이블에 데이터를 변경하는 쿼리를 실행하면 발생한다.
- InnoDB 테이블의 경우 스토리지 엔진 차원에서 레코드 기반의 잠금을 제공하기 때문에 단순 데이터 변경 쿼리로 락이 설정되지 않는다.
  - 정확히는 InnoDB에서 테이블 락이 설정되나, DML쿼리에서는 무시되고 DDL의 경우에만 영향을 미친다.

## 유저 락

- `GET_LOCK()` 함수를 이용해 잠금을 설정한다.
- 단순히 사용자가 지정한 string에 대해 획득하고 해제하는 잠금
- db서버 한 대에 여러 웹 서버가 접속할 때나, 한번에 많은 레코드를 변경할 경우 데드락을 해결할 때 주로 사용된다.

## 네임 락

- db 오브젝트의 이름을 변경하는 경우 묵시적으로 획득하는 락
- 원본 이름, 목표 이름 두 개 다 락이 걸린다.
- `RENAME TABLE rank To rank_backup, rank_new TO rank;`

# InnoDB 스토리지 엔진의 잠금

MySQL에서 제공하는 락과는 별개로 스토리지 엔진 내부에서 레코드 기반의 잠금 방식을 탑재하고 있다. INFORMATION_SCHEMA 데이터베이스에서 락에 관한 정보들을 찾을수 있다.

## InnoDB의 잠금 방식

- Optimistic Locking:grin:
  - 각 트랜잭션이 같은 레코드를 변경할 일은 거의 없을걸? 
  - 우선 변경하고 마지막에 락 충돌이 있었는지 확인해서 ROLLBACK 하자! ​​
- Pessimistic Locking:thinking:
  - 현재 트랜잭션에서 변경하려는 레코드에 대해 먼저 락 얻고 변경하자! ​​
  - 높은 동시성 처리에 유리하다.
  - InnoDB는 해당 방식을 채택한다.

## InnoDB 잠금 종류

- 레코드 기반의 락을 제공한다.
- 레코드 락이 페이지 락 또는 테이블 락으로 레벨업되는 경우는 없다.
- 레코드 락
  - 레코드 자체만을 잠그는 락
  - InnoDB 엔진은 레코드 자체가 아니라 인덱스의 레코드를 잠근다.
  - primary key 또는 unique index 에 대해서는 레코드 락을 건다.
- GAP lock
  - 레코드와 레코드 사이의 간격을 잠근다.
  - 레코드와 레코드 사이의 간격에 새로운 레코드가 INSERT 되는 것을 제어한다.
  - next key lock의 일부로 사용된다.
- next key lock
  - record lock 과 gap lock을 합쳐놓은 형태의 lock
- auto increment lock
  - AUTO_INCREMENT 속성을 가지는 칼럼에 적용되는 테이블 수준의 락

## 인덱스와 잠금

InnoDB는 레코드가 아닌 인덱스를 잠그는 방식이다. 즉, 변경해야 할 레코드를 찾기 위해 **검색한 인덱스의 레코드를 모두 잠가야 한다.**

테이블에 인덱스가 없다면 테이블을 풀 스캔하면서 UPDATE 작업을 하는데, 테이블의 모든 레코드를 잠그게 된다.

불필요한 레코드의 잠금 현상은 next key lock 때문에 발생한다.

따라서 MySQL의 InnoDB에서는 인덱스 설계를 중요시해야 하겠다.

## 트랜잭션 격리 수준과 잠금

불필요한 레코드의 잠금 현상을 줄이기 위해서는 next ket lock / gap lock 을 줄여야 한다. 방법은 다음과 같다.

1. 레코드 기반의 바이너리 로그를 사용 + 트랜잭션 격리 수준을 READ-COMMITED로 설정
2. 바이너리 로그를 비활성화 + 트랜잭션 격리 수준을 READ-COMMITED로 설정 

## 레코드 수준의 잠금 확인 및 해제

MySQL 5.1 부터 잠금이나 잠금을 대기하고 있는 트랜잭션에 대해 상세한 메타 정보를 제공한다. `INFORMATION_SCHEMA` 데이터베이스의 `INNODB_LOCKS`, `INNODB_LOCK_WAITS`, `INNODB_TRX` 라는 테이블을 조인해서 어떤 커넥션이 어떤 커넥션을 기다리고 있는지 알아낼 수 있다.

# Reference

책 Real MySQL, 이성욱 저
