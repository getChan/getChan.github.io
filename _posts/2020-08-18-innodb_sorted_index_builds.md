---

title: "InnoDB Sorted Index Builds"
excerpt: "InnoDB에서 인덱스를 생성하는 방법"
categories:
  - data
tags:
  - database
  - mysql
last_modified_at: 2020-08-18T08:06:00+09:00
---

> 대량의 데이터를 적재할 때, 테이블의 인덱스를 Drop 후 적재한뒤 재생성하는 방법이 더 빠른 이유에 대해 찾아봤다.
>
> MySQL 5.7 버전부터 인덱스를 생성하는 방식 본문과 같이 변경되면서, 인덱스 생성 시간을 줄여주게 되었다.
>
> 이전 버전에서는 테이블의 레코드를 한 건씩 읽으면서 키 칼럼이 정렬되지 않은 상태로 B-Tree 인덱스에 추가하는 방식이었다.

# Sorted Index Builds

InnoDB는 인덱스를 생성하거나 rebuild할 때 한 번에 하나의 인덱스 레코드를 삽입하는 대신 Bulk Load를 수행합니다. spartial index에 대해서는 지원하지 않습니다.

인덱스 생성은 다음 단계를 거칩니다.

1. clustered index가 스캔되고 인덱스 항목이 생성되어 sort buffer에 추가된다. sort buffer가 가득 차면 항목들은 정렬되어 임시 중간 파일에 써진다. 이 과정을 `run`이라고 한다
2. 하나 이상의 `run`이 임시 중간 파일에 써지면, 병합 정렬이 모든 파일에 거쳐 수행된다.
3. 정렬된 항목들이 B-Tree에 삽입된다.

이전의 방법은 한 번에 한 레코드씩 트리에 삽입하였는데, 이 방식은 삽입 위치를 검색하는 비용과 B tree 노드의 지속적인 분할 및 병합으로 인해 더 느리다.

# Reference :books:

[mysql 공식문서](https://dev.mysql.com/doc/refman/5.7/en/sorted-index-builds.html)