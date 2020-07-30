---

title: "PostgreSQL populating a Database"
excerpt: "postgres 데이터 적재 성능 높이기"
categories:
  - data
tags:
  - database
  - postgresql
  - ETL
last_modified_at: 2020-07-29T08:06:00+09:00
---

> postgresql 11 공식문서를 번역 / 정리한 글입니다.

대량의 데이터를 효율적으로 적재하기 위한 방법들

# Disable Autocommit 

여러 번 `INSERT` 연산을 하지 말고 Autocommit 을  disable 한 뒤 모든 데이터를 INSERT하고 한번에 커밋하면 성능이 빨라진다.

# Use *COPY*

` COPY`명령은 많은 row를 적재하는데 최적화되어 있다. 단일 명령이기 때문에 autocommit 을 disable할 필요가 없다. 

COPY를 쓸 수 없다면 `PREPARE`를 이용해서 insert문을 생성한 뒤 `EXCUTE`로 여러 번 수행하자. INSERT문을 반복해서 파싱하지 않아도 되서 오버헤드를 줄일 수 있다.

그래도 COPY를 사용하는 게 거의 항상 빠르다.

COPY는 `CREATE TABLE` 또는 `TRUNCATE` 와 같은 트랜잭션 내에서 사용될 때 가장 빠르다. 

- 에러가 발생했을 때, 새로 적재되는 데이터는 어짜피 삭제되기 때문에. WAL을 작성할 필요가 없기 때문이다.
  - wal-level이 `minimal`로 설정되고, 파티션되지 않은 테이블이여야 WAL 쓰지 않는다.
- CREATE / TRUNCATE 하지 않으면, 이전 상태로 rollback하기 위해 copy from에 대한 WAL을 작성해야함.

> postgresql `TRUNCATE`
>
> - MVCC-safe하지 않다. 동시 트랜잭션에서 한 트랜잭션이 TRUNCATE를 하면 다른 트랜잭션 또한 비어있는 것으로 보인다.
> - **transcation-safe하다. transaction이 커밋되지 않으면 안전하게 truncate이전으로 롤백한다.**

# Remove Indexes

이미 존재하는 데이터에서 새롭게 인덱스를 생성하는 것이 매번 데이터가 적재될때마다 인덱스를 갱신하는 것보다 빠르다.

- 새로 테이블을 생성할 때는 모든 데이터 적재 이후 인덱스를 생성하자.
- 기존 테이블에 데이터를 추가하는 경우에는 인덱스를 삭제하고 데이터를 적재한 뒤 인덱스를 재생성하자.
  - 인덱스가 삭제되있는 동안은 다른 사용자의 성능이 저하될 수 있다.
  - 유니크 인덱스를 삭제하면 유니크 조건을 체크하지 않는다. 인덱스로 생성할 컬럼이 고유한지 확인해야 한다.

# Remove Foreign Key Constraints

인덱스처럼, 외래키 제약조건도 bulk로 확인하는게 각 행마다 확인하는 것보다 효율적이다.

- 외래키 제약조건을 drop하고, 데이터를 적재한 뒤 제약조건을 다시 생성하자. 
  - 외래키 제약조건을 만족하는지 직접 확인해야 한다.

외래키 제약조건이 있는 테이블에 적재할 때, trigger 가 발생하는데 데이터가 커서 트리거 이벤트 큐가 메모리를 초과하면 완전히 실패할 수도 있다. 이때는 제약조건의 삭제가 필수적이다.

# Increase *maintenance_work_mem*

일시적으로 `maintenance_work_mem` 환경변수를 증가시키면 성능이 향상된다.

- `CREATE INDEX`랑 `ALTER TABLE ADD FOREIGN KEY `명령의 속도를 증가시켜준다.

# Increase *max_wal_size*

일시적으로 `max_wal_size` 환경변수를 증가시키면 성능이 향상된다.

- 대용량의 데이터가 적재되면 체크포인트 빈도가 많아지는데
  - 체크포인트에서는 모든 더티 페이지를 디스크로 flush하는 입출력이 많이 발생한다.(성능저하)
- max_wal_size를 증가시켜서 체크포인트 수를 줄일 수 있다.

# Disable WAL Archival and Streaming Replication

...읽어보았으나 아직 이해하기 힘듬

https://www.postgresql.org/docs/11/populate.html#POPULATE-PITR

# Run *ANALYZE* Afterwards

데이터 적재 후 통계 정보를 업데이트하기 위해 ANALYZE를 수행합시다.



# Reference

[postgresql 11 공식문서](https://www.postgresql.org/docs/11/populate.html)