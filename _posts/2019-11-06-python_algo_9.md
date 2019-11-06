---
title:  "파이썬 자료구조와 알고리즘(9)-정렬"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - algorithm
tags:
  - data_structure
  - algorithm
  - study
  - book
last_modified_at: 2019-11-06T08:06:00-05:00
---

무식하게 정렬하는 방법은 시간복잡도가 $O(n^2)$ 이다. 더 나은 정렬 알고리즘을 찾아보자.

- 제자리 정렬

    정렬할 항목의 수에 비해 작은 저장 공간을 사용해야 할 때에 쓴다.

- 안정적 정렬

    수의 크기가 같은 데이터 요소의 순서를 그대로 보존한다. 
    
대부분의 **비교 정렬** 알고리즘은 최악의 경우 $O(n\log{n})$보다 좋지 않다.

# 1. 2차 정렬

## 1.1. 버블 정렬

**버블 정렬**은 인접한 두 항목을 비교하여 정렬하는 방식이다. $O(n^2)$의 시간복잡도 이지만 코드가 단순하다.

```python
def bubble_sort(seq):
    length = len(seq)-1
    for num in range(length, 0, -1):
        for i in range(num):
            if seq[i] > seq[i+1]:
                seq[i], seq[i+1] = seq[i+1], seq[i]
    return seq
```

## 1.2. 선택 정렬

**선택 정렬**은 리스트에서 가장 작거나 큰 항목을 찾아서 첫번째 항목과 위치를 바꾼다. 다음 항목을 찾아서 두번째 항목과 위치를 바꾼다. 이 과정을 반복한다. 리스트가 정렬되어 있어도 복잡도는 $O(n^2)$이다. 

```python
def selection_sort(seq):
    for num in range(len(seq)-1):
        mini = num
        for i in range(num+1, len(seq)):
            if seq[mini] > seq[i]:
                mini = i
        seq[num], seq[mini] = seq[mini], seq[num]
    return seq
```

## 1.3. 삽입 정렬

**삽입 정렬**은 최선의 경우 $O(n)$이고 평균/최악의 경우 $O(n^2)$이다. 데이터 크기가 작고 리스트가 정렬되어 있으면 병합 정렬이나 퀵 정렬보다 성능이 좋다.

```python
def insertion_sort(seq):
    for i in range(1, len(seq)):
        j = i
        while j > 0 and seq[j-1] > seq[j]:
            seq[j-1], seq[j] = seq[j], seq[j-1]
            j -= 1
    return seq

def insertion_sort_rec(seq, i=None):
    if i is None:
        i = len(seq) - 1
    if i == 0:
        return i
    insertion_sort_rec(seq, i-1)
    j = i
    while j > 0 and seq[j-1] > seq[j]:
        seq[j-1], seq[j] = seq[j], seq[j-1]
        j -= 1
    return seq
```

## 1.4. 놈 정렬

앞으로 이동하며 잘못 정렬된 값을 찾은 후, 올바른 위치로 값을 교환하며 다시 뒤로 이동한다. 최선 $O(n)$, 최악 $O(n^2)$.

```python
def gnome_sort(seq):
    i = 0
    while i < len(seq):
        if i == 0 or seq[i-1] <= seq[i]:
            i += 1
        else:
            seq[i], seq[i-1] = seq[i-1], seq[i]
            i -= 1
    return seq
```

# 2. 선형 정렬

## 2.1. 카운트 정렬

**카운트 정렬**은 작은 범위의 정수를 정렬할 때 유용하며, 숫자의 발생 횟수를 계산하는 카운트를 사용한다. 각 숫자 간 간격이 크다면 비효율적이다. 간격이 크지 않다면 $O(n+k)$이다. 안정적 정렬이다.

```python
from collections import defaultdict

def count_sort_dict(a):
    b, c = [], defaultdict(list)
    for x in a:
        c[x].append(x)
    for k in range(min(c), max(c)+1):
        b.extend(c[k])
    return b
```

# 3. 로그 선형 정렬

## 3.1 sort()와 sorted()

내장 `sort()`와 `sorted()` 메서드는 **팀소트** 알고리즘으로 구현되어 있다. 팀소트는 병합 정렬과 삽입 정렬에서 파생된 하이브리드 정렬 알고리즘이다.

## 3.2 병합 정렬

**병합 정렬**은 리스트를 반으로 나누어 정렬되지 않은 리스트를 만든다. 리스트의 크기가 1이될 때까지 리스트를 나눈 뒤 정렬하고 병합한다. 안정적인 정렬이며 대규모 데이터에 대해서도 속도가 빠르다. 배열의 경우 제자리 정렬이 아니기 때문에 메모리를 많이 필요로 하며, 공간복잡도는 $O(n)$이다. 연결 리스트의 경우 제자리 정렬이 가능하며 공간복잡도는 $O(log{n})$이다. 최악,최선,평균 시간복잡도는 모두 $O(n\log{n})$이다.


1. `pop()`을 이용한 병합 정렬

```python
def merge_sort(seq):
    if len(seq) < 2:
        return seq
    mid = len(seq) // 2
    left, right = seq[:mid], seq[mid:]
    if len(left) > 1:
        left = merge_sort(left)
    if len(right) > 1:
        right = merge_sort(right)
    res = []
    while left and right:
        if left[-1] >= right[-1]:
            res.append(left.pop())
        else:
            res.append(right.pop())
    res.reverse()
    return (left or right) + res

```
2. 두 개의 함수를 이용한 병합 정렬

```python
def merge_sort_sep(seq):
    '''
    한 함수에서는 배열을 나누고, 다른 함수에서는 배열을 병합한다.
    '''
    if len(seq) < 2:
        return seq
    mid = len(seq) // 2
    left = merge_sort_sep(seq[:mid])
    right = merge_sort_sep(seq[mid:])

    return merge(left, right)

def merge(left, right):
    if not left or not right:
        return left or right
    result = []
    i, j = 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    if left[i:]: # 남아있으면
        result.extend(left[i:])
    if right[i:]:
        result.extend(right[j:])
    return result
```

## 3.3 퀵 정렬
**퀵 정렬**은 피벗을 이용한다. 피벗 앞에는 피벗보다 작은 값, 뒤에는 큰 값이 오도록 리스트를 둘로 나눈다. 

피벗이 최솟값 또는 최댓값일 경우 최악의 시간복잡도 $O(n^2)$이다. 최선의 경우와 평균 시간복잡도는 $O(n\log{n})$이다. 안정적 정렬이 아니다.

1. 함수 하나로 구현하는 방법

```python
def quick_sort_cache(seq):
    if len(seq) < 2:
        return seq
    ipivot = len(seq) # 피벗 인덱스
    pivot = seq[ipivot] # 피벗

    before = [x for i, x in enumerate(seq) if x <= pivot and i != ipivot]
    after = [x for i, x in enumerate(seq) if x > pivot and i != ipivot]

    return quick_sort_cache(before) + [pivot] + quick_sort_cache(after)
```

2. 두 개 함수로 구현하는 방법 

```python
def partition_divided(seq):
    pivot, seq = seq[0], seq[1:]
    before = [x for x in seq if x <= pivot]
    after = [x for x in seq if x > pivot]

    return before, pivot, after

def quick_sort_cache_divided(seq):
    if len(seq) < 2:
        return seq
    before, pivot, after = partition_divided(seq)

    return quick_sort_cache_divided(before) + [pivot] + \
        quick_sort_cache_divided(after)
```

3. ~~캐시 사용하지 않고 구현하는 방법~~ 책 참조

## 3.4. 힙 정렬

**힙 정렬**은 최대(최소)값을 n번 찾을 때, 로그 선형의 시간복잡도를 가진다. 

`heapq`모듈을 사용하여 모든 값을 `push`한 다음 한 번에 하나씩 `pop`하여 구현한다.

```python
import heapq

def heap_sort(seq):
    h = heapq.heapify(seq) # 상수 시간복잡도
    
    return [heapq.heappop(h) for _ in range(len(h))] # logn * n
```