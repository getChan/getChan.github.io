---
title:  "파이썬 자료구조와 알고리즘(2)-내장 시퀀스 타입"
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

내장 시퀀스 타입의 속성
- 멤버십 연산 : `in` 키워드 사용
- 크기 함수 : `len(seq)`
- 슬라이싱 속성 : `seq[:-1]`
- 반복성 : 반복문에 있는 데이터를 순회할 수 있음

파이썬은 **문자열, 튜플, 리스트, byte array, bytes** 5개의 내장 시퀀스 타입이 있다.

## 1. deep copy & slicing
### 1.1 mutable
튜플, 문자열, 바이트는 **immutable**,리스트와 bytearray는 **mutable**이다.
immutable은 mutable보다 **효율적이다** 또한 일부 collection data type은 immutable type으로 indexing 할 수 있다.

파이썬의 모든 변수는 객체 참조.
따라서 muttable 객체 copy 시에 주의해야 한다.

`a = b`라고 하면 `a`는 실제 `b`가 참조하는 곳을 가리킨다.

**DEEP COPY** 개념을 이해해야 한다


```python
myList = [1,2,3,4]
newList = myList[:]
newList2 = list(myList)
```


```python
# set의 deep copy
people = {'버피', '에인절', '자일스'}
slayers = people.copy() # deep copy
slayers.discard('자일스') # if it's member
slayers.remove('에인절') # must be member
print(slayers)
print(people)
```

    {'버피'}
    {'버피', '자일스', '에인절'}



```python
# dict의 deep copy
myDict = {'안녕':'세상'}
newDict = myDict.copy()
```

그러나, 위의 `.copy()`도 swallow copy이다. mutable객체 안에 mutable 객체가 또 있을 경우 안쪽 객체는 copy하지 않는다.


```python
import copy
myObj = 'object'
newObj = copy.copy(myObj) # swallow copy
newObj2 = copy.deepcopy(myObj) #'찐' deep copy
```

### 1.2 슬라이싱 연산자 
## 2. 문자열
객체의 출력 형식은 `str`과 `repr`이 있다.
### 2.1 유니코드 문자열
파이썬3부터 모든 문자열은 byte가 아닌 unicode다 문자열 앞에 `u`를 붙여 만든다.


```python
u'잘가\u0020세상 !'
```




    '잘가 세상 !'



### 2.2 문자열 메서드

`join()`


```python
slayer = ['버피', '앤', '아스틴']
''.join(reversed(slayer))
```




    '아스틴앤버피'



`ljust()`, `rjust()`

`A.ljust(width, fillchar)` : `A`를 포함한 길이만큼 채운다


```python
name = '스칼렛'
name.ljust(50, '-')
```




    '스칼렛-----------------------------------------------'



`A.format()` : 변수를 추가하거나 형식화


```python
'이름 : {who}, 나이 {0}'.format(12, who='에이미')
```




    '이름 : 에이미, 나이 12'




```python
'{} {} {}'.format('파이썬', '자료구조', '알고리즘')
```




    '파이썬 자료구조 알고리즘'




```python
import decimal
'{0} {0!s} {0!r} {0!a}'.format(decimal.Decimal('99.9'))
```




    "99.9 99.9 Decimal('99.9') Decimal('99.9')"



#### 문자열 언패킹
`**`연산자. key-value dict가 생성된다.

`locals()` : 현재 scope에 있는 local 변수를 dict로 반환



```python
hero = '버피'
num = 999
'{num}:{hero}'.format(**locals())
```




    '999:버피'



#### splitlines()
`A.splitlines()` : `A`에 대해 `\n`을 기준으로 분리하여 반환


```python
slayers = '로미오\n줄리엣'
slayers.splitlines()
```




    ['로미오', '줄리엣']



#### split()
`A.split(t, n)` : `A`에서 `t`를 기준으로 `n`번만큼 분리한 문자열 리스트

`rsplit(t, n)` : 오른쪽에서 왼쪽으로 분자열 분리


```python
'asdas'.split('a', 1)
```




    ['', 'sdas']



#### strip()
`A.strip(b)` : 문자열 `A` 앞뒤의 문자열 `B`를 제거


```python
slayers = '로미오 앤 줄리엣 99'
slayers.strip('99')
```




    '로미오 앤 줄리엣 '




```python
# 파일에서 모든 단어를 알파벳순으로 등장횟수 출력
import string
import sys


def count_unique_word():
    words = {}
    strip = string.whitespace + string.punctuation + string.digits + "\"'"
    for filename in sys.argv[1:]:
        with open(filename) as file:
            for line in file:
                for word in line.lower().split():
                    word = word.strip(strip)
                    if len(word) > 2:
                        words[word] = words.get(word, 0) + 1

    for word in sorted(words):
        print("'{0}': {1}번".format(word, words[word]))
```

#### swapcase()
- `A.swapcase()` : 대소문자 반전한 문자열 반환
- `A.capitalize()` : 문자열 첫 글자를 대문자로
- `A.lower()` : 전체 문자열을 소문자로
- `A.upper()` : 전체 문자열을 대문자로

#### index(), find()
- `A.index(sub, start, end)` : `sub`의 인덱스 위치를 반환, 실패하면 `ValueError`
- `A.find(sub, start, end)` : `sub`의 인덱스 위치를 반환, 실패하면 `-1`
- `rindex(sub, start, end)` : 문자열 오른쪽에서부터 일치하는 인덱스 반환

#### count() 메서드
`A.count(sub, start, end)` : `sub`가 나온 횟수 반환

#### replace() 메서드
`A.replace(old, new, maxreplace)` : 변경한 문자열의 복사본 반환

#### f-strings



```python
name = '프레드'
f'그의 이름은 {name}입니다.'
```




    '그의 이름은 프레드입니다.'



## 3. 튜플

### 3.1 튜플 메서드
- `A.count(x)`
- `A.index(x)`

### 3.2 튜플 언패킹
모든 iterable 객체는 `*`를 사용하여 언패킹 가능

### 3.3 Named Tuple
`collections.namedtuple(typename, field_names)`


```python
import collections
Person = collections.namedtuple('Person', 'name age gender')
p = Person('아스팅', 30, '남')
p
```




    Person(name='아스팅', age=30, gender='남')



## 4. 리스트
> 리스트는 배열이다.

- `append()`, `pop()` : O(1)
- `remove()`, `index()`, `in` : O(n)
- `insert()` : O(n)
- `sort()` : O(NlogN)

> 검색이나 멤버십 연산은 **set**, **dict**형이 빠르다

### 4.1 리스트 메서드

### 4.2 리스트 언패킹
튜플 언패킹과 비슷하다 함수의 전달 인수로 `*`를 사용할 수 있다.

### 4.3 리스트 컴프리헨션

### 4.4 리스트 메서드 성능 측정
`timeit` 모듈의 `Timer` 객체를 생성해 사용한다.


```python
def test4():
    l = list(range(1000))
    
if __name__ == '__main__':
    import timeit
    t1 = timeit.Timer('test4()', 'from __main__ import test4')
    print('concat', t1.timeit(number=1000), 'milliseconds')
```

    concat 0.039145500000131506 milliseconds


## 5. 바이트와 바이트 배열
byte는 immutable, bytearray는 mutable

### 5.1 비트와 비트 연산자
`1 << x ` : 1을 x번 왼쪽으로 이동한다. 2^x를 빠르게 계산한다.

`x & (x-1)` : 0이면 x는 2의 제곱수


```python
x = 4
1 << x
```




    16




```python
x = 8
x & (x-1)
```




    0



## 6. 연습문제


```python
# 1. 문자열 전체 반전하기
def revert(s):
    if s:
        s = s[-1] + revert(s[:-1])
    return s
def revert2(s):
    return s[::-1]
    
str1 = 'hello world'
str2 = revert(str1)
print(revert(str1))
print(revert(str1))
```

    dlrow olleh
    dlrow olleh



```python
# 2. 문자열 단어 단위로 반전
def reverser1(string1):
    return ' '.join(string1.split()[::-1])
    
def reverser(string1, p1=0, p2=None):
    '''
    문자열을 바꾼다.
    '''
    if len(string1) < 2:
        return string1
    p2 = p2 or len(string1)-1
    while p1 < p2:
        string1[p1], string1[p2] = string1[p2], string1[p1]
        p1 += 1
        p2 -= 1
        
def reversing_words_sentence_logic(string1):
    reverser(string1)
    p = 0
    start = 0
    while p < len(string1):
        if string1[p] == ' ':
            # 단어 재반전
            reverser(string1, p1=start, p2=p-1)
            start = p+1
        p += 1
    # 마지막 단어를 반전한다.
    reverser(string1, p1=start, p2=p-1)
    return ''.join(string1)
    
        
str1 = '파이썬 알고리즘 재미있다.'
print(reverser1(str1))
print(reversing_words_sentence_logic(list(str1)))
```

    재미있다. 알고리즘 파이썬
    재미있다. 알고리즘 파이썬



```python
# 하나의 반복문만 사용하는 방법
def reverse_words_brute(string):
    word, sentence = [], []
    for char in string:
        if char != ' ':
            word.append(char)
        else:
            if word:
                # 여러 공백이 있는 경우 조건문 건너뛴다.
                sentence.append(''.join(word))
            word = []
    # 마지막 단어
    if word != []:
        sentence.append(''.join(word))
    sentence.reverse()
    return ' '.join(sentence)    
            
    
str1 = '파이썬 알고리즘 재미있다.'
print(reverse_words_brute(str1))
```

    재미있다. 알고리즘 파이썬


### 6.3 단순 문자열 압축


```python
def str_compression1(s):
    tmp = ''
    result = ''
    cnt = 1
    for ch in s:
        if ch != tmp:
            result += str(cnt)
            result += ch
            cnt = 1
            tmp = ch
        else:
            cnt += 1
    else:
        result += str(cnt)
    
    return result[1:]

def str_compression2(s):
    count, last = 1, ''
    list_aux = []
    for i, c in enumerate(s):
        if last == c:
            count += 1
        else:
            if i != 0:
                list_aux.append(str(count))
            list_aux.append(c)
            count = 1
            last = c
    list_aux.append(str(count))
    return ''.join(list_aux)
str_compression2('aabcccccaaa')
```




    'a2b1c5a3'



### 6.4 문자열 순열
순열은 서로 다른 *n*개 중 *r*개를 골라 순서를 고려해 나열한 경우의 수이다.

길이 *n*의 문자열에서 *n*의 문자를 모두 선택하는 경우의 문자열을 나열해보자


```python
import itertools

def perm3(s):
    permobj = itertools.permutations(s)
    return [''.join(i) for i in permobj]

def perm(s):
    if len(s) < 2:
        return s
    res = []
    for i,c in enumerate(s):
        for cc in perm(s[:i]+s[i+1:]):
            res.append(c + cc)
    return res



val = '012'
print(perm(val))
# print(perm2(val))
```

    ['012', '021', '102', '120', '201', '210']



```python
# 길이 n일때 n 이하에 수에 대해서 모든 순열의 경우의 수
def combination(s):
    if len(s) < 2:
        return s
    res = []
    for i, c in enumerate(s):
        res.append(c)
        for cc in combination(s[:i]+s[i+1:]):
            res.append(c+cc)
    return res
print(combination('abc'))
```

    ['a', 'ab', 'abc', 'ac', 'acb', 'b', 'ba', 'bac', 'bc', 'bca', 'c', 'ca', 'cab', 'cb', 'cba']


### 6.5 회문
앞에서 읽으나 뒤에서 읽으나 동일한 단어


```python
def is_palindrome(s):
    l = s.split(' ')
    s2 = ''.join(l)
    for i in range(len(s2) // 2):
        if s2[i] != s2[-(i+1)]:
            return False
    else:
        return True
    
def is_palindrome2(s):
    l = s.split(' ')
    s2 = ''.join(l)
    return s2 == s2[::-1]

def is_palindrome3(s):
    s = s.strip()
    if len(s) < 2:
        return True
    if s[0] == s[-1]:
        return is_palindrome3(s[1:-1])
    else:
        return False
str1 = '다시 합창합시다'
print(is_palindrome(str1))
print(is_palindrome2(str1))
print(is_palindrome3(str1))
```

    True
    True
    True
    