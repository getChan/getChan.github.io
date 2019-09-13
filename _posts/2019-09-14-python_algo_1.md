---
title:  "파이썬 자료구조와 알고리즘(1)-숫자"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - web
tags:
  - data_structure
  - algorithm
  - study
  - book
last_modified_at: 2019-09-14T08:06:00-05:00
---

# 1. 정수


```python
(999).bit_length() # 정수를 나타내는 데 필요한 바이트 수
```




    10




```python
# 문자열을 정수로 변환 or 진법 변환
s = '11'
d = int(s)
print(d)
b = int(s,2)
print(b)
```

    11
    3
    

# 2. 부동소수점
- 부호
- 유효 숫자 자릿수
- 지수

로 이루어짐

## 2.1 부동소수점끼리 비교하기
부동소수점은 이진수 분수로 표현된다.

- `unittest` 모듈의 `assertAlmostEqual()` 메서드
- ```python
def a(x, y, places=7):
    return round(abs(x-y), places) == 0
    ```

##  2.2 정수와 부동소수점 메서드
`divmod(x, y)` : x를 y로 나눌 때, 몫과 나머지를 반환


```python
divmod(45, 6)
```




    (7, 3)



`round(x, n)`
- n이 음수 : x를 n만큼 반올림한 값
- n이 양수 : x를 소수점 이하 n자리로 반올림한 값


```python
round(100.96, -2)
```




    100.0




```python
round(100.965, 2)
```




    100.97




```python
# 부동소수점을 분수로
2.75.as_integer_ratio()
```




    (11, 4)



# 3. 복소수
- `z.real, z.imag, z.congugate` 와 같은 메서드
- `import cmath`

# 4. fraction  모듈
- 분수를 다루기 위한 모듈


```python
from fractions import Fraction


def rounding_floats(number1, places):
    return round(number1, places)


def float_to_fractions(number):
    return Fraction(*number.as_integer_ratio())


def get_denominator(number1, number2):
    """ 분모를 반환한다."""
    a = Fraction(number1, number2)
    return a.denominator


def get_numerator(number1, number2):
    """ 분자를 반환한다."""
    a = Fraction(number1, number2)
    return a.numerator


def test_testing_floats():
    number1 = 1.25
    number2 = 1
    number3 = -1
    number4 = 5/4
    number6 = 6
    assert(rounding_floats(number1, number2) == 1.2)
    assert(rounding_floats(number1*10, number3) == 10)
    assert(float_to_fractions(number1) == number4)
    assert(get_denominator(number2, number6) == number6)
    assert(get_numerator(number2, number6) == number2)
    print("테스트 통과!")


if __name__ == "__main__":
    test_testing_floats()
```

    테스트 통과!
    

# 5. decimal 모듈
- **정확한** 10진법의 부동소수점 숫자가 필요한 경우
- **immutable** type인 `decimal.Decimal` 사용


```python
sum(0.1 for i in range(10)) == 1.0
```




    False




```python
from decimal import Decimal
sum(Decimal('0.1') for i in range(10)) == Decimal('1.0')
```




    True




```python
sum(Decimal('0.1') for i in range(10)) == 1.0
```




    True



# 6. 2진수, 8진수, 16진수


```python
# 정수 i의 2진수 문자열 반환
bin(999)
```




    '0b1111100111'




```python
oct(999)
```




    '0o1747'




```python
hex(999)
```




    '0x3e7'



#  7. 연습문제
## 7.1 진법 변환


```python
# 다른 진법의 숫자를 10진수로 변환
def convert_to_decimal(number, base):
    multiplier, result = 1, 0
    while number > 0:
        result += number%10 *multiplier
        multiplier *= base
        number = number // 10
    return result

if __name__ == '__main__':
    print(convert_to_decimal(1001, 2))
```

    9
    


```python
# 10진수를 다른 진법의 수로 변환
def convert_from_decimal(number, base):
    multiplier, result = 1, 0
    while number > 0:
        result += number % base * multiplier
        multiplier *= 10
        number = number // base
    return result

print(convert_from_decimal(9,2))
```

    1001
    


```python
# base가 10보다 큰 경우
# 10진법 수를 20이하의 진법으로 변환
def convert_from_decimal_larger_bases(number, base):
    strings = '0123456789ABCDEFGHIJ'
    result = ''
    while number > 0:
        digit = number % base
        result = strings[digit] + result
        number = number // base
    return result
print(convert_from_decimal_larger_bases(31, 16))
```

    1F
    


```python
# 재귀 함수를 사용한 진법 변환
def convert_dec_to_any_base_rec(number, base):
    convertString = '0123456789ABCDEF'
    if number < base:
        return convertString[number]
    else:
        return convert_dec_to_any_base_rec(number//base, base) + convertString[number % base]
print(convert_dec_to_any_base_rec(9,2))
```

    1001
    

## 7.2 최대공약수


```python
def finding_gcd(a, b):
    while b != 0:
        result = b
        a, b = b, a % b
    return result
print(finding_gcd(12, 21))
```

    3
    

## 7.3 random 모듈
## 7.4 피보나치 수열
[피보나치 수열을 구하는 여러 방법](https://www.acmicpc.net/blog/view/28)


```python
import math

# 재귀를 사용하는 방법 : O(2^n)
def find_fibonacci_seq_rec(n):
    if n < 2 : 
        return n
    return find_fibonacci_seq_rec(n-2) + find_fibonacci_seq_rec(n-1)

# 반복문 사용하는 방법 : O(n)
def find_fibonacci_seq_iter(n):
    if n < 2:
        return n
    a, b = 0, 1
    for i in range(n):
        a, b = b, a+b
    return a

# 수식 사용하는 방법 : O(1), 70이상은 정확하지 않다
def find_fibonacci_seq_form(n):
    sq5 = math.sqrt(5)
    phi = (1+sq5) / 2
    return int(math.floor(phi ** n / sq5))


print(find_fibonacci_seq_rec(10))
print(find_fibonacci_seq_iter(10))
print(find_fibonacci_seq_form(10))
```

    55
    55
    55
    


```python
# generator 이용하는 방법
# 전체 시퀀스를 메모리에 올리지 않는다.
def fib_generator():
    a, b = 0, 1
    while True:
        yield b
        a, b = b, a+b
fg = fib_generator()
for _ in range(10):
    print(next(fg), end=' ')
```

    1 1 2 3 5 8 13 21 34 55 

## 7.5 소수
1. 브루트 포스
2. 제곱근을 이용

    $m = \sqrt{n}, m * m = n$ 이라 가정한다.
    
    n이 소수가 아니면, 
    
    $n = a * b$ 이므로
    
    $m * m = a * b$ 이다.
    
    m은 실수, n, a, b 는 자연수
    

    1. a > m 이면, b < m
    2. a = m 이면, b = m
    3. a < m 이면, b > m
    
    세 가지 경우 모두 min(a, b) <= m이다.
    
    따라서, m까지만 검색하여 적어도 하나의 n과 나누어 떨어지는 수가 있으면,
    
    n이 소수가 아님을 보여준다


```python
import math
import random

# 1. brute force
def finding_prime(number):
    num = abs(number)
    if num < 4 :
        return True
    for x in range(2, num):
        if num % x == 0:
            return False
    return True

# 2. using sqrt
def finding_prime_sqrt(number):
    num = abs(number)
    if num < 4:
        return True
    for x in range(2, int(math.sqrt(num))+1):
        if num % x == 0:
            return False
    return True

# 3. 페르마의 소정리
def finding_prime_fermat(number):
    if number <= 102:
        for a in range(2, number):
            if pow(a, number-1, number) != 1:
                return False
        return True
    else:
        for i in range(100):
            a = random.randint(2, number-1)
            if pow(a, number-1, number) != 1:
                return False
        return True

def test_finding_prime():
    number1 = 17
    number2 = 20
    
print(finding_prime(17))
print(finding_prime(20))
print(finding_prime_sqrt(17))
print(finding_prime_sqrt(20))
print(finding_prime_fermat(17))
print(finding_prime_fermat(20))
```

    True
    False
    True
    False
    True
    False
    


```python
import math
import random
import sys
# n비트 소수 생성 코드
def generate_prime(number=3):
    while True:
        p = random.randint(pow(2, number-2), pow(2, number-1)-1)
        p = 2*p+1
        if finding_prime_sqrt(p):
            return p
generate_prime(4)        
```




    13



# 8. numpy
파이썬 리스트에 비해 연산이 매우 효율적이다.
