---
title: "HBase 클라이언트"
excerpt: "HBase Client Architecture"

categories:
  - data
tags:
  - hbase
last_modified_at: 2021-03-08T08:06:00-05:00
---

HBase 클라이언트는 특정 row range를 가지는 리전서버를 `hbase:meta` 테이블에서 찾는다.
- 이러면 마스터를 통하지 않고 read, write 요청을 한다

이 정보는 클라이언트 측에 캐시되서 연속된 요청이 조회 과정을 거치지 않아도 된다.

리전서버가 죽거나 마스터에 의해 재할당되면 클라이언트는 카탈로그 테이블을 다시 쿼리해서 새로운 리전 정보를 가져온다


# `hbase:meta` 테이블

`.META.`로도 불렸던 해당 테이블은 사스템의 모든 리전 리스트를 유지한다.
- `hbase:meta`의 위치는 주키퍼에 저장됨

테이블 구조

Key
- Region key of the format (`[table],[region start key],[region id]`)

Values
- `info:regioninfo` (serialized HRegionInfo instance for this region)
- `info:server` (server:port of the RegionServer containing this region)
- `info:serverstartcode` (start-time of the RegionServer process containing this region)

API는 HBase 1.0.0 이후로 변경됬다.

# `1.0.0` 이전 API

`HTable` 인스턴스로 HBase 클러스터와 통신했다. `HTable` 인스턴스는 thread-safe가 아니라 하나의 스레드만 해당 인스턴스를 사용할 수 있다.

내부에서는 Connection들이 맵 안에 저장되고 사용 중인 `Configuration` 인스턴스가 키가 된다.
- 같은 `Configuration` 인스턴스를 참조하는 `HTable` 은 같은 `HConnection` 인스턴스를 공유한다.

