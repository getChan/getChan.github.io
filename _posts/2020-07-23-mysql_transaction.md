---
title: "MySQL 트랜잭션"
excerpt: "mysql 트랜잭션 개념과 트랜잭션 격리 수준"
categories:
  - TIL
tags:
  - database
  - mysql
  - transaction
last_modified_at: 2020-07-26T08:06:00+09:00
---

트랜잭션은 작업의 완전성을 보장해 준다.

# MySQL의 트랜잭션

MyISAM, MEMORY 등의 스토리지 엔진은 트랜잭션을 지원하지 않는다.  InnoDB는 지원한다.

## 주의사항

- 프로그램의 코드가 데이터베이스 커넥션을 가지고 있는 범위와 
- 트랜잭션이 활성화되어 있는 프로그램의 범위를 최소화해야 한다.
- 프로그램의 코드 라인 수가 한두줄이라 하더라도, 네트워크 작업이 있는 경우는 반드시 트랜잭션에서 배제해야 한다.

이러한 실수가 생겨나면 DBMS서버가 높은 부하 상태로 빠지거나 위험한 상태에 빠지게 된다.

# MySQL의 격리 수준

|                 | DIRTY READ    | NON-REPEATABLE READ | PHANTOM READ                           |
| --------------- | ------------- | ------------------- | -------------------------------------- |
| READ UNCOMMITED | 발생          | 발생                | 발생                                   |
| READ COMMITED   | 발생하지 않음 | 발생                | 발생                                   |
| REPEATABLE READ | 발생하지 않음 | 발생하지 않음       | 발생<br />(InnoDB에서는 발생하지 않음) |
| SERIALIZABLE    | 발생하지 않음 | 발생하지 않음       | 발생하지 않음                          |

오라클과 같은 DBMS에서는 READ COMMITED 수준을 많이 사용하며, MySQL에서는 REPEATABLE READ를 많이 사용한다.

## READ UNCOMMITED

각 트랜잭션에서의 변경 내용이 COMMIT 이나 ROLLBACK 여부에 상관없이 다른 트랜잭션에서 보여진다. dirty read가 허용되는 격리 수준.

Dirty Read : 한 트랜잭션에서 처리한 작업이 완료되지 않았는데도, 다른 트랜잭션에서 볼 수 있게 되는 현상.

<img src="https://nesoy.github.io/assets/posts/img/2019-05-08-21-09-02.png" alt="No Image" style="zoom:33%;" />

## READ COMMITED

오라클 DBMS의 기본 격리 수준이며 온라인 서비스에서 가장 많이 선택되는 격리 수준

COMMIT 이 완료된 데이터만 다른 트랜잭션에서 조회할 수 있다. dirty read 발생하지 않지만 REAPEATABLE READ를 보장하지 않는다.

<img src="https://nesoy.github.io/assets/posts/img/2019-05-08-21-18-08.png" alt="No Image" style="zoom:33%;" />

### NON-REPEATABLE READ

**하나의 트랜잭션 내**에서 똑같은 SELECT 쿼리를 실행했을 때 다른 결과를 가져오게 되는 현상. 

<img src="https://nesoy.github.io/assets/posts/img/2019-05-08-21-25-41.png" alt="No Image" style="zoom:33%;" />

## REPEATABLE READ

InnoDB 스토리지 엔진에서 기본으로 사용되는 격리 수준. 바이너리 로그를 가진 MySQL 장비에서는 최소 REPEATABLE READ 격리 수준 이상을 사용해야 한다.

NON-REPEATABLE READ 가 발생하지 않는다.

InnoDB 엔진은 트랜잭션이  ROLLBACK될 가능성에 대비해 변경 전 레코드를 Undo 공간에 백업해두고 실제 레코드 값을 변경한다. 이러한 방식을 **MVCC**라고 한다.

REPEATABLE READ는  MVCC를 위해 undo 영역에 백업된 이전 데이터를 이용해 동일 트랜잭션 내에서는 동일한 결과를 보여줄 수 있도록 보장한다.

> READ COMMITED도 MVCC를 이용해 COMMIT되기 전의 데이터를 보여준다. REPEATABLE READ와의 차이는 버전 가운데 몇 번째 이전 버전까지 찾아야 하는지에 있다.

<img src="https://nesoy.github.io/assets/posts/img/2019-05-08-21-52-08.png" alt="No Image" style="zoom:33%;" />

트랜잭션 2가 BEGIN명령으로 트랜잭션을 시작하면서 10번 트랜잭션 번호를 부여받았다. 해당 트랜잭션은 10번보다 작은 트랜잭션 번호에서 변경한 것만 보게 된다. 

### MVCC

일반적으로 레코드 레벨의 트랜잭션을 지원하는 DBMS가 지원하는 기능이며, **잠금을 사용하지 않는 일관된 읽기**를 제공하는 목적이다.

InnoDB는 undo log를 이용해 이 기능을 구현한다. 

UPDATE문이 실행되면 각 영역은 다음과 같은 값을 가진다.

- InnoDB의 버퍼 풀
  - 커밋 여부와 관계없이 새로운 값으로 업데이트된다. 
- 디스크의 데이터 파일
  - 새로운 값으로 업데이트될수도, 아닐 수도 있다. ( 체크포인트나 InnoDB의 write 스레드에 의해)
- Undo Log
  - 새로운 값으로 변경되기 이전의 값을 보관하고 있다.

undo 영역에 백업된 레코드의 수가 많아지면 MySQL의 처리 성능이 떨어질 수 있다.

### PHANTOM READ

한 트랜잭션에서 다른 트랜잭션에서 수행한 변경 작업에 의해 레코드가 보였다 안 보였다 하는 현상.

<img src="https://nesoy.github.io/assets/posts/img/2019-05-08-22-14-18.png" alt="No Image" style="zoom:33%;" />

> ### SELECT ... FOR UPDATE
>
> 동시성 제어를 위해 특정 row에 대해서 배타락를 거는 쿼리
>
> SELECT 하는 레코드에 쓰기 잠금을 걸어야 하는데, undo record에는 잠금을 걸 수 없다. 따라서 `FOR UPDATE`로 조회되는 레코드는 undo 영역이 아닌 현재 레코드의 값을 가져오게 된다.
>
> [https://dololak.tistory.com/446](https://dololak.tistory.com/446)

## SERIALIZABLE

InnoDB 테이블에서 기본적으로 순수한 SELECT 문은 아무런 레코드 잠금도 설정하지 않는다. (non-locking consistent read)

하지만 격리 수준이 SERIALIZABLE로 설정되면 읽기 작업도 공유락(읽기 락)을 획득해야 하며, 동시에 다른 트랜잭션은 해당 레코드를 변경할 수 없게 된다.

즉. **한 트랜잭션에서 읽고 쓰는 레코드를 다른 트랜잭션에서는 절대 접근할 수 없다.**

InnoDB 엔진에서는 REPEATABLE READ 수준에서도 PHANTOM READ 가 발생하지 않기 때문에, 굳이 사용할 필요는 없다.

# Reference

책 Real MySQL, 이성욱 저

https://nesoy.github.io/articles/2019-05/Database-Transaction-isolation

https://dololak.tistory.com/446