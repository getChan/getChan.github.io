---
title:  "프로그래머스-N진수 게임"
excerpt: "진법 변환 문제"

categories:
  - algorithm
tags:
  - python
  - algorithm
  - math
last_modified_at: 2019-11-01T08:06:00-05:00
---
> 진법 변환 문제 + 논리적인 알고리즘 
> 
> 알고리즘 구현이 생각보다 복잡해서 풀지 못했다. 

# 문제
N진수 게임 (https://programmers.co.kr/learn/courses/30/lessons/17687)

2018 카카오 블라인드 채용 3차 문제입니다. [해설](https://tech.kakao.com/2017/11/14/kakao-blind-recruitment-round-3/)

# 풀이

1. 문제 해석

    진법 변환 문제이다.

    하지만, 논리적으로 알고리즘 구현하는 것도 쉽지 않다.

2. 알고리즘

    진법 변환

3. 코드
```python
def convert_from_decimal(number, base):  # 진법 변환 함수
    digits = '0123456789ABCDEF'
    if number == 0: # 0 일때 처리해줘야 한다.
        return '0'
    result = ''
    while number:
        result = digits[number%base] + result
        number = number // base
    return result

def solution(n, t, m, p):
    total = '' # 모든 진법변환 결과 
    answer = '' # 내가 알아야 할 결과
    for i in range(t*m): # (사람 수 * 정답 숫자의 수) 안에 무조건 들어있다.
        total += convert_from_decimal(i, n)
    for i, ch in enumerate(total): 
        if i % m +1 == p: # 내가 알아야 할 수 = 내 차례의 수이면
            answer += ch
        if len(answer) >= t:
            return answer
```