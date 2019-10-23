---
title:  "파이썬 자료구조와 알고리즘(3)-컬렉션 자료구조"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - algorithm
tags:
  - data_structure
  - algorithm
  - study
  - book
last_modified_at: 2019-09-17T08:06:00-05:00
---

**컬렉션** 자료구조는 데이터를 서로 연관시키지 않고 모아두는 컨테이너다. 시퀀스 자료구조의 세 속성을 가진다.
- 멤버십 연산자 `in`
- 크기 함수 `len(seq)`
- iterate

## 1. Set
iterable하고 mutable하며 중복 허용하지 않고 정렬되지 않는 컬렉션 타입이다. indexing은 불가능하다. **membership**연산 및 **중복 제거**에 사용된다.
- insert : O(1)
- union : O(m+n)
- intersection : O(n)

> frozen set은 immutable object이다.

### 1.1 셋 메서드
- `A.add(x)`
- `A.update(B)` 혹은 `A|=B`는 B를 A에 추가한다.(합집합)
- `A.union(B)` 와 A|B는 `update()`메서드와 같지만 연산 결과를 복사본으로 반환한다.
- `A.intersection(B)`와 `A&B`는 A와 B의 교집합의 복사본을 반환한다.
- `A.difference(B)`와 `A-B`는 A와 B의 차집합의 복사본을 반환한다.
- `A.clear()`는 A의 모든 항목을 제거한다.
- `A.discard(x)`는 A의 항목 x를 제거하며 반환값은 없다.
- `A.remove(x)`는 `discard()`와 같지만 x가 없을 경우 `KeyError`
- `A.pop()`은 한 항목을 무작위로 제거하고 반환한다. 셋이 비어있을 경우 `KeyError`

### 1.2 셋과 리스트
리스트 타입은 셋 타입으로 변환할 수 있다. 딕셔너리에서도 셋 속성을 사용할 수 있다.

## 2. Dictionary
딕셔너리는 해시 테이블로 구현되어 있다. 해시 함수는 특정 객체에 해당하는 정수 값을 상수 시간에 계산한다. 정소는 연관 배열의 인덱스로 사용된다.


```python
hash('b')
```




    -4097819455848722177



컬렉션 **매핑 타입**인 딕셔너리는 iterable하다.`in`과 `len()`도 지원한다. 정렬되지 않은 매핑 타입은 임의 순서로 iterate한다. 항목에 접근하는 시간 복잡도 O(1)이며 mutable하다. 또한 삽입 순서를 기억하지 않으며 indexing할 수 없다.

## 2.1 딕셔너리 메서드
- `A.setdefalut(key, default)`는 A에 key가 없을 경우 새 키와 defalut가 딕셔너리에 저장된다.
- `A.update(B)`는 딕셔너리 A에 딕셔너리 B의 키가 존재하면 A의 (키,값)을 B의 (키,값)으로 갱신한다. 존재하지 않으면 (키,값)을 추가한다.
- `A.get(key)`는 A의 key 값을 반환한다. key가 없으면 아무것도 반환하지 않는다.
- `items()`, `values()`, `keys()`는 딕셔너리 view이다.
- `A.pop(key)`는 A의 key를 제거한 후 그 값을 반환한다. `A.popitem()`은 A에서 (키,값)을 제거한 후 반환한다.
- `A.clear()`는 딕셔너리의 모든 항목을 제거한다.

### 2.2 딕셔너리 성능
연산 | 시간복잡도
----- | -----
복사 | O(N)
조회 | O(1)
할당 | O(1)
삭제 | O(N)
멤버십 | O(1)
반복 | O(N)

### 2.3 딕셔너리 순회
딕셔너리의 키는 삽입 순서로 나타난다. 키의 정렬을 통해 정렬된 상태로 순회할 수 있다.

### 2.4 딕셔너리 분기
```python
functions = dict(h=hello, w=world)
functions[action]()
```
case문처럼 사용 유용해 보임

## 3. 파이썬 컬렉션 자료구조

### 3.1 defaultDict
내장 딕셔너리의 모든 연산과 메서드를 사용할 수 있고, 누락된 키도 사용 가능하다.

### 3.2 orderedDict
내장 딕셔너리의 모든 연산과 메서드를 사용할 수 있고, 누락된 키도 사용 가능하다. 삽입 순서대로 항목을 저장한다.일반적으로 딕셔너리를 여러번 순회하는 경우와 항목의 삽입을 거의 수행하지 않을 것으로 예상되는 경우에 효율적이다.

### 3.3 Counter
hashable한 객체를 카운팅하는 서브클래스. 셋 연산을 사용할 수 있다.
> **hashable** : An object is hashable if it has a hash value which never changes during its lifetime (it needs a __hash__() method), and can be compared to other objects (it needs an __eq__() method). Hashable objects which compare equal must have the same hash value.

## 4. 연습문제

### 4.1 단어 횟수 세기


```python
from collections import Counter

def find_top_N_recurring_words(seq, N):    
    counter = Counter(seq.split())
    return counter.most_common(N)
seq = '버피 에인절 몬스터 잰더 윌로 버피 몬스터 슈퍼 버피 에인절'
N = 3
find_top_N_recurring_words(seq, N)
```




    [('버피', 3), ('에인절', 2), ('몬스터', 2)]



### 4.2 Anagram
문장 또는 단어의 철자 순서를 바꾸는 놀이, 두 문자열이 에너그램이 확인하는 알고리즘 작성하라. 셋은 발생 횟수를 계산하지 않고, 리스트는 정렬 연산이 O(NlogN)이다. 딕셔너리를 사용해보자.



```python
from collections import Counter
def is_anagram(s1, s2):
    return not Counter(s1)-Counter(s2)

s1 = 'marina'
s2 = 'aniram'
print(is_anagram(s1, s2))
s1 = 'google'
s2 = 'gouglo'
print(is_anagram(s1, s2))
```

    True
    False



```python
# 해시 함수의 속성을 이용하는 방법
# ord() 함수는 인수가 유니코드 객체일 때 유니코드를 나타내는 정수를 반환.
# 인수가 8비트 문자열일 경우 바이트 값을 반환한다.
import string

def hash_func(s1, s2):
    return sum([ord(_) for _ in s1 if _ not in string.whitespace]) \
== sum([ord(_) for _ in s2 if _ not in string.whitespace])

s1 = 'marina'
s2 = 'aniram'
print(hash_func(s1, s2))
s1 = 'google'
s2 = 'gouglo'
print(hash_func(s1, s2))
```

    True
    False


### 4.3 주사위 합계 경로
주사위를 두 번 던져 합이 특정 수가 나오는 경우의 수와 경로를 구하라.


```python
from collections import Counter, defaultdict


def find_dice_probabilities(S, n_faces=6):
    if S > 2 * n_faces or S < 2:
        return None
    cdict = Counter()
    ddict = defaultdict(list)
    for dice1 in range(1, n_faces+1):
        for dice2 in range(1, n_faces+1):
            cdict[dice1+dice2] += 1
            ddict[dice1+dice2].append([dice1, dice2])
    return cdict[S], ddict[S]


S = 5
find_dice_probabilities(S)
```




    (4, [[1, 4], [2, 3], [3, 2], [4, 1]])



### 4.4 단어의 중복 문자 제거
단어에서 중복되는 문자를 찾아 제거하라


```python
import string
from collections import Counter

def delete_unique_word1(str1):
    table_c = {key: 0 for key in string.ascii_lowercase}
    for ch in str1:
        table_c[ch] += 1
    for k, v in table_c.items():
        if v > 1:
            str1 = str1.replace(k, '')

    return str1


def delete_unique_word2(str1):
    wcnt = Counter(str1)
    return ''.join([k for k,v in wcnt.items() if v==1])
    

str1 = 'google'
delete_unique_word2(str1)
```




    'le'


