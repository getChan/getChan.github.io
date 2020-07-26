---
title: "PostgreSQL `pg_catalog`"
excerpt: "시스템 카탈로그로 db 메타데이터 조회하기"
categories:
  - data
tags:
  - database
  - postgresql
last_modified_at: 2020-07-22T08:06:00+09:00
---

시스템 카탈로그란 RDMBS에 대한 metadata들을 저장하는 장소이다. 

 `information_schema`에도 메타데이터 정보가 저장되어 있는데, `pg_catalog` 시스템 카탈로그 정보를 조인해서 얻은 **view**이다.

`CREATE database` 와 같은 쿼리를 수행하면 `pg_catalog`에 자동으로 insert된다. 시스템 카탈로그를 직접 조작하는 것은 위험하다.

`pg_catalog`는 각 DB 내부에 존재하는 schema 다.

> 데이터베이스 구조 : Database -> Schema -> Table (Objects..)

# 스키마와 테이블 이름 조회하기

```sql
SELECT schemaname, tablename 
FROM pg_catalog.pg_tables 
WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';
```

# 특정 테이블의 컬럼 정보 조회하기

```sql
SELECT attname, format_type(atttypid, atttypmod)
FROM pg_catalog.pg_attribute
WHERE attrelid = '<table>'::regclass
	AND attnum > 0
	AND NOT attisdropped;
```

- pg_attribute 테이블 명세

| Name           | Type   | References     | Description                                                  |
| -------------- | ------ | -------------- | ------------------------------------------------------------ |
| `attrelid`     | `oid`  | `pg_class.oid` | The table this column belongs to                             |
| `attname`      | `name` |                | The column name                                              |
| `atttypid`     | `oid`  | `pg_type.oid`  | The data type of this column                                 |
| `atttypmod`    | `int4` |                | `atttypmod` records type-specific data supplied at table creation time (for example, the maximum length of a `varchar` column). It is passed to type-specific input functions and length coercion functions. The value will generally be -1 for types that do not need `atttypmod`. |
| `attnum`       | `int2` |                | The number of the column. Ordinary columns are numbered from 1 up. System columns, such as `oid`, have (arbitrary) negative numbers. |
| `attisdropped` | `bool` |                | This column has been dropped and is no longer valid. A dropped column is still physically present in the table, but is ignored by the parser and so cannot be accessed via SQL. |

- `format_type()` 시스템 함수

| Name                                     | Return Type | Description                 |
| ---------------------------------------- | ----------- | --------------------------- |
| `format_type(type_oid, typemod)` | `text`      | get SQL name of a data type |

- [`regclass` 는 OID ( objecrt identifier Types )](https://www.postgresql.org/docs/11/datatype-oid.html)

| Name       | References | Description   | Value Example |
| ---------- | ---------- | ------------- | ------------- |
| `regclass` | `pg_class` | relation name | `pg_type`     |

