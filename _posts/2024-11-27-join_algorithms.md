---
title: "조인 알고리듬의 구현"
excerpt: "Implementation of Join Algorithms"
categories:
  - data
tags:
  - data
  - cs
last_modified_at: 2024-11-27T08:00:00-08:00
---

# 단일 머신 조인 알고리즘

## Nested Loop Join

```sudo
for each tuple r in R do begin
   for each tuple s in S do begin
      if r and s satisfy the join condition
         output the tuple <r, s>
   end
end
```
- 인덱스를 필요로 하지 않는다.
- 동등 조인이 아닌 경우에도 사용 가능하다.
- 시간 복잡도는 $O(n^2)$이다.

## Sort-Merge Join

```sudo
while not at the end of either relation do begin
   if r and s match on the join attribute
      output the tuple <r, s>
   if r < s
      advance to the next tuple in R
   else advance to the next tuple in S
end
```
- 조인 컬럼으로 정렬되어 있어야 한다.
- 정렬되어 있다면 시간 복잡도는 $O(n)$이다. 
  - 투 포인터 알고리즘과 유사하다.
- 동등 조인만 가능하다.

## Hash Join

```sudo
for each tuple s in S do begin
   insert s into hash table H
end
for each tuple r in R do begin
   if there is a tuple s in H that matches hash(r) then
      output the tuple <r, s>
end
```
- 동등 조인만 가능하다.
- S를 build input이라 하고 R을 probe input이라 한다.
- 크기가 작은 테이블을 build input으로 사용하는 것이 좋다.
  - 해시 테이블은 메모리보다 작아야 하기 때문이다.
- 시간 복잡도는 $O(n)$이다.

# Apache Spark의 조인 알고리즘

# 참고 
- Database System Concepts, 7th Edition. *Abraham Silberschatz, Henry F. Korth, S. Sudarshan. McGraw-Hill Education. 2019.*
- 