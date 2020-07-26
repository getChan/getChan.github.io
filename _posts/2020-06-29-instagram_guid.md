---
title: "Sharding & IDs at Instagram(번역)"
excerpt: "인스타그램에서 DB guid를 생성하는 방법"
categories:
  - data
tags:
  - database
  - guid
  - bit
  - postgres
last_modified_at: 2020-06-29T08:06:00+09:00
---

> [인스타그램 미디움 포스팅](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c)을 번역한 글입니다.

단일 DB에서는 유니크 ID를 auto-increment primary key로 단순하게 구현할 수 있다. 하지만 데이터가 여러 DB에 분산 저장된다면, 위의 방식으로는 같은 순간에 유니크 ID를 생성할 수 없다. 

시스템에서 필수적으로 요구하는 특징은 다음과 같다.

1. 생성되는 ID는 시간 기준으로 정렬되어야 한다. (사진 ID의 리스트는 사진에 대한 추가 정보 없이 정렬될 수 있어야 한다.) 
2. ID는 이상적으로 64비트여야 한다.(인덱스를 작게 하고, redis와 같은 시스템에서 더 많은 스토리지를 확보하기 위함)
3. 시스템은 가능한 작은 'moving parts'를 가져야 한다. - 인스타그램이 적은 엔지니어 수로 확장할 수 있었던 가장 큰 부분은 간단하고 이해하기 쉬운 솔루션을 채택했기 때문이다.

# Existing Solutions

id 생성 문제에 대해 많은 솔루션들이 이미 존재했다.

## 웹 애플리케이션에서 ID 생성하기

id를 db가 아닌 어플리게이션에서 생성한다. 예를 들어 mongoDB의 ObjectId는 12 바이트이고 타임스탬프 정보를 인코딩한 id이다. 다른 방법으로는 UUID를 사용하는 방법이 있다.

### 장점

1. 각 애플리케이션 스레드가 id를 독립적으로 생성하므로 단일 실패 지점 문제를 최소화하고 id 생성의 경합을 최소화한다.
2. id의 첫번째 컴포넌트로 timestamp를 사용한다면, id는 time-sortable하게 유지된다.

### 단점

1. uniqueness의 보장을 위해 일반적으로 더 많은 저장 공간을 필요로 한다(96비트 이상) 
2. 몇몇 uuid 타입은 완전히 랜덤이고 정렬이 불가능하다.

## dedicated 서비스를 통한 ID생성

ex) 트위터의 Snowflake는 아파치 주키퍼를 이용해 노드를 coordinate하고 64비트의 유니크 id를 생성할 수 있다.

### 장점

1. snowflake의 id는 64비트이다. UUID의 절반 가량의 사이즈이다.
2. 시간 정보를 첫번째 컴포넌트로 사용할 수 있고, 정렬 가능하다.
3. 노드가 죽어도 살아남을 수 있는 분산 시스템이다.

### 단점

1. 아키텍쳐에 더해질 'moving parts'가 많다. 

## DB 티켓 서버

고유성을 강제하기 위해 db의 auto-increment를 사용한다. Flicker는 이 접근방식을 사용하는데, 단일 실패 지점을 막기 위해 두 개의 티켓 DB를 사용한다.

### Pros

1. DB는 이해하기 쉽고 예측가능한 확장 요소를 가지고 있다.

### Cons

1. 궁극적으로는 쓰기 연산에 병목 현상이 발생한다.
2. 추가적으로 관리할  2개의 머신이 생긴다.
3. 단일 db를 사용한다면 단일 실패 지점이 생겨나고, 여러 db를 사용하면 시간에 따른 sortable이 보장되지 않는다.

# Our Solution

우리는 postgres의 schema를 사용해서 관리하기 쉽고 DB의 논리적 샤딩을 가능하게끔 했다.

schema는 Postgres의 논리적 그룹핑 특성이다(sql table의 스키마와는 다른 개념). 각 postgres DB는 여러 스키마를 가질 수 있다.

id 생성은 Postgres의 PL/PGSQL을 이용해서 각각의 테이블에 위임했다. 

각 ID는 다음으로 구성된다.

- 41비트의 밀리세컨드 단위로 된 시간 정보(커스텀 에폭마다 41년치의 id를 제공한다.)
- 13 비트의 논리적 샤드 Id 정보
- 10 비트의 auto-incrementing 시퀀스 정보. 
  - 1024로 나머지 연산을 한 결과로, 1밀리세컨드에 1개의 샤드 당 1024개의 id를 생성할 수 있다는 것을 의미한다.

에폭의 시작부터 `1387263000`밀리세컨드가 지났다고 하면, 가장 왼쪽 41비트는 다음 값으로 채워진다.

```plsql
id = 138726300 << (64 - 41)
-- DB의 BIGINT 데이터 타입은 64비트이다. 따라서 64비트가 넘어가는 값은 무시하게 된다. 
-- (64-41) == 23개의 0을 시간 정보 뒤에 붙이게 되고, 시간 정보는 64개 비트 중 가장 왼쪽부터 41개 비트의 공간을 차지하게 된다.
```

다음으로 샤드 id를 추가한다. `userID`를 기준으로 샤딩을 하고 `2000`개의 논리적 샤드가 있으며, 유저 id가 `31341`이라고 가정하면, 샤드 Id는 `31341 % 2000 -> 1341`이다. 

다음 13개 비트는 다음과 같이 채워진다.

```plsql
id |= 1341 << (64-41-13)
-- (64-41-13) == 10개의 0을 샤드 Id 뒤에 붙이게 되고, 샤드id 정보는 64개 비트 중 (가장 왼쪽-41)부터 13개 비트의 공간을 차지하게 된다.
```

마지막으로 시퀀스 값을 추가한다( 시퀀스는 각 샤드의 각 테이블에서 유일하다 ). 테이블에 5000개의 id가 이미 존재하면, 추가할 id는 5001이고, 2^10==1024로 나머지 연산을 한 값을 채워준다.

```plsql
id |= (5001 % 1024)
-- 64비트 중 남은 10비트의 공간을 차지한다.
```

이렇게 ID를 생성하고, PL/PGQL 함수로 구현하면 된다.

```plsql
CREATE OR REPLACE FUNCTION insta5.next_id(OUT result bigint) AS $$
DECLARE
	our_epoch bigint := 1314220021721;
	seq_id bigint;
	now_millis bigint;
	shard_id int := 5;
BEGIN
	SELECT nextval('insta5.table_id_seq') %% 1024 INTO seq_id;
	
	SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
	result := (now_millis - our_epoch) << 23;
	result := result | (shard_id << 10);
	result := result | (seq_id);
END;
	$$ LANGUAGE PSLPGSQL:
```

테이블을 생성할 때 다음과 같이 수행한다.

```plsql
CREATE TABLE insta5.our_table(
	"id" bigint NOT NULL DEFAULT insta5.next_id(),
    -- ... rest of table schema ...
)
```

