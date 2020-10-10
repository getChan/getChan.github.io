---

title: "면접 문제 - 배열과 문자열"
excerpt: "배열과 문자열 관련 문제 풀이"
categories:
  - algorithm
tags:
  - python
  - string
  - array
last_modified_at: 2020-10-09T08:06:00+09:00
---
# 중복 확인
> 문자열이 주어졌을 때, 문자열에 같은 문자가 중복되어 등장하는지 확인하는 알고리즘을 작성하라. 자료구조를 추가로 사용하지 않고 풀 수 있는 알고리즘 또한 고민하라.

```python
def is_unique_chars(string:str) -> bool:
  '''
  bitmask 이용하는 방법
  '''
  bit = 0
  for ch in string:
    if bit & (1 << ord(ch)):
      return True
    bit |= 1 << ord(ch)
  return False
```

# 순열 확인
> 문자열 두 개가 주어졌을 때 이 둘이 서로 순열 관계에 있는지 확인하는 메서드를 작성하라.

```python
def is_permutation1(string1:str, string2:str) -> bool:
  '''
  정렬을 이용해 O(NlogN) 시간에 해결하는 방법
  '''
  if len(string1) != len(string2):
      return False
  string1 = sorted(string1) # NlogN
  string2 = sorted(string2) # NlogN
  if string1 != string2:
    return False
  return True

def is_permutation2(string1:str, string2:str) -> bool:
    from collections import defaultdict
    '''
    카운트를 통해 O(N) 에 해결하는 방법
    '''
    if len(string1) != len(string2):
        return False
    cnt = defaultdict(int)
    for ch in string1:
        cnt[ch] += 1
    for ch in string2:
        cnt[ch] -= 1
        if cnt[ch] < 0:
            return False
    return True
```

# O 행렬
> `M X N` 행렬의 한 원소가 0일 경우, 해당 원소가 속한 행과 열의 모든 원소를 0으로 설정하는 알고리즘을 작성하라.

```python
def maxtrix_o(matrix: list) -> list:
    rows, cols = [], []
    for i in range(len(matrix)):
        for j in range(len(matrix[0])):
            if matrix[i][j] == 0:
                rows.append(i)
                cols.append(j)
                break
    for i in range(len(matrix)):
        for col in cols:
            matrix[i][col] = 0
    for i in range(len(matrix[0])):
        for row in rows:
            matrix[row][i] = 0
    return matrix
```

# 문자열 회전
> 한 단어가 다른 문자열에 포함되어 있는지 판별하는 함수를 한 번만 호출해서 `s2`가 `s1`을 회전시킨 결과인지 판별하는 함수를 작성하라.

```python
def is_shift_string1(s1:str, s2: str) -> bool:
    from collections import deque
    s1 = deque(s1)
    s2 = list(s2)
    for _ in range(len(s1)):
        if list(s1) == s2:
            return True
        s1.rotate()
    return False

def is_shift_string2(s1:str, s2:str) -> bool:
    def is_substring(s1:str, s2:str) -> bool:
        if len(s2) > len(s1):
            s1, s2 = s2, s1
        n = len(s2)
        for i in range(len(s1)-n):
            if s1[i:i+n] == s2:
                return True
        return False
    if len(s1) == len(s2):
        return is_substring(s1*2, s2)
    return False
```

# 문제 출처
책 *Cracking the Coding Interview*