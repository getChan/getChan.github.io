---
title: "HBase rowkey design case"
excerpt: "rowkey 설계의 여러 사례"

categories:
  - data
tags:
  - hbase
  - rowkey
last_modified_at: 2022-01-07T08:06:00-05:00
---

# Reversed URL

크롤러에서 URL을 HBase rowkey로 저장할 때는 도메인 이름을 뒤집어서 저장한다.

```
# 원본 URL
https://play.google.com/store/apps/details?id=com.towneers.www&hl=ko

# Reversed URL
com.google.play:https/store/apps/details?id=com.towneers.www&hl=ko
```

## 왜?

**prefix 키 스캔의 효율을 위해서다.**

우리가 `play.google.com` 호스트 이름을 가진 URL들을 전부 조회하려 한다고 가정하자.
(일반적으로 `https://play`를 prefix로 하는 URL보다 `play.google.com`를 호스트로 하는 URL들을 조회하려는 경우가 많을 것이다.)

Reversed URL로 저장되어 있다면 `play.google.com` 을 호스트 이름으로 하는 URL들을 조회할 때 전체 테이블을 scan할 필요가 없다. `com.google.play` prefix가 일치하는 리전만 scan하면 되고, 순차 read이기에 성능도 좋다.

반면 원본 URL로 저장되어 있다면 `http`를 prefix로 하는 리전을 scan해야 하고, 이는 테이블을 full scan하게 된다.

> HBase의 테이블은 rowkey를 기반으로 정렬되어 있고, 테이블은 리전이라는 개념의 단위로 파티셔닝되어 분산 저장된다.

# Salting

리전서버를 구분하는 prefix를 추가해 row가 전체 리전 서버에 분산되도록 한다.

```
# 원본 rowkey
com.google.play:https/store/apps/details?id=com.towneers.www&hl=ko

# salted rowkey
00001:com.google.play:https/store/apps/details?id=com.towneers.www&hl=ko
```

## 왜?
**쓰기 부하 분산을 위해**   

prefix가 유사한 row가 집중적으로 write되면 특정 서버에 쓰기 연산이 집중될 수 있다. 리전서버의 구분자를 접두어로 추가하면 부하 분산이 가능하다.

## 장단점

장점 - 병렬 읽기가 가능하다.
스레드 또는 프로세스를 여러개 실행해서 각 리전 서버별로 read 가능하다.

단점 - url prefix로 scan 시 조각난 데이터를 받게 된다. 리전서버 구분자를 관리해야 하는 번거로움.
