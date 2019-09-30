---
title:  "파이썬 자료구조와 알고리즘(4)-구조와 모듈"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - web
tags:
  - data_structure
  - algorithm
  - study
  - book
last_modified_at: 2019-09-30T08:06:00-05:00
---


## 1. 모듈

모듈은 `def`를 사용하여 정의한다. `def`가 실행되면 함수의 객체와 참조가 같이 생성된다. 리턴값을 정의하지 않으면, `None`을 반환한다. 아무런 값을 반환하지 않는 함수를 *procedure*라 한다.

### 1.1 스택과 활성화 레코드

함수가 호출될 때마다 **activation record**가 생성된다. 반환값, 매개변수, 지역변수, 반환값, 반환 주소 등이 기록되며 이를 **스택**에 저장한다. 다음 순서대로 처리된다.

1. 함수의 매개변수를 스택에 push
2. 반환 주소를 스택에 저장
3. 스택의 최상위 인덱스를 함수의 지역 변수에 필요한 총량만큼 늘린다.
4. 함수로 jump

활성화 레코드의 unwinding 절차는 다음과 같다.

1. 스택의 최상위 인덱스는 함수에 소비된 총 메모리양(지역 변수)만큼 감소한다.
2. 반환 주소를 스택에서 pop
3. 스택의 최상위 인덱스는 함수의 실제 매개변수만큼 감소한다.

### 1.2 모듈의 기본값

모듈을 생성할 때, 함수 또는 메서드에서 mutable 객체를 기본값으로 사용하면 안된다. 

```python
# 나쁜 예
def append(number, number_list=[]):
    number_list.append(number)
    return number_list

# 좋은 예
def append(number, number_list=None):
    if number_list is None:
        number_list = []
    number_list.append(number)
    return number_list
```

### 1.3 __init__.py 파일
**package**는 모듈과 `__init__.py`파일이 있는 디렉터리다. 이 파일이 있어야 디렉터리를 패키지로 취급한다. 

패키지의 초기화 코드를 실행하거나, `__all__` 변수를 정의할 수도 있다. 
```python
__all__ = ['파일1', ...]
```

이름이 `__`로 시작하는 모듈을 제외한 모듈의 모든 객체를 불러온다. `__all__`있는 경우 해당 리스트의 객체를 불러온다.

```python
from 폴더이름 import *
```

### 1.4 __name__ 변수

파이썬은 모듈을 import할 때마다 `__name__`이라는 변수를 만들고, 모듈 이름을 저장한다. 


```python
hello = 'hello'

def world():
    return 'world'

if __name__ == '__main__':
    print('{} 직접 실행됨'.format(__name__))
else:
    # 이 모듈을 임포트시 실행됨
    print('{} 임포트됨'.format(__name__))
```

    __main__ 직접 실행됨



```python
__name__
```




    '__main__'



### 1.5 컴파일된 바이트코드 모듈

**byte compile code**는 표준 모듈을 많이 사용하는 프로그램의 시작 시간을 줄이기 위한 것이다.

`-O` 플래그를 사용하여 파이썬 인터프리터 호출하면, 최적화된 코드가 생성되어 `.pyc`파일로 저장된다.(`assert`문이 제거된다) 라이브러리로 배포하는 데에도 사용할 수 있다.

### 1.6 sys 모듈
`sys.path`는 인터프리터가 모듈을 검색할 경로를 담은 문자열 리스트다. `PYTHONPATH` 환경변수 또는 기본 path로 초기화된다. 


```python
import sys
sys.path
```




    ['E:\\algorithm\\파이썬 자료구조와 알고리즘',
     'C:\\Users\\skarn\\Anaconda3\\python37.zip',
     'C:\\Users\\skarn\\Anaconda3\\DLLs',
     'C:\\Users\\skarn\\Anaconda3\\lib',
     'C:\\Users\\skarn\\Anaconda3',
     '',
     'C:\\Users\\skarn\\Anaconda3\\lib\\site-packages',
     'C:\\Users\\skarn\\Anaconda3\\lib\\site-packages\\win32',
     'C:\\Users\\skarn\\Anaconda3\\lib\\site-packages\\win32\\lib',
     'C:\\Users\\skarn\\Anaconda3\\lib\\site-packages\\Pythonwin',
     'C:\\Users\\skarn\\Anaconda3\\lib\\site-packages\\IPython\\extensions',
     'C:\\Users\\skarn\\.ipython']




```python
# 임시로 path를 추가할 수 있다.
sys.path.append('모듈_디렉터리_경로')
```

`sys.ps1`과 `sys.ps2` python 인터프리터의 프롬프트 문자열을 지정한다.

`sys.argv` 변수로 명령 줄에 전달된 인수를 사용할 수 있다.

`dir()` 내장 함수는 모듈의 정의하는 모든 유형의 이름(모듈, 변수, 함수)를 찾는다.

## 2. 제어문

### 2.1 if문

### 2.2 for문

### 2.3 boolean
암묵적인 `False` 사용에 대한 구글 파이썬 스타일 가이드
- `==` 또는 `!=` 연산자로 내장 변수 `None`과 같은 싱글턴을 비교하지 않는다. 대신 `is` 또는 `is not`을 사용한다.
- `if x is not None` 과 `if not x`를 잘 구분해서 사용한다.
- `if len(시퀀스)` 보다 `if 시퀀스`를 써라
- 암묵적인 `False`는 위험하다

### 2.4 return 대 yield
`__iter__()`와 `__next__()`메서드를 둘 다 정의하면 이터레이터 프로토콜을 구현한 셈이다.

`yield` 키워드는 각 반환값을 호출자에게 반환하고, 반환값이 모두 소진되었을 때에만 메서드가 종료된다.


### 2.5 break 대 continue
반복문의 `else`절은 `for`문에서 모두 iteration 했거나, `while`에서 조건이 `False`가 되었을 때 실행된다.

### 2.6 range()

### 2.7 enumerate()

### 2.8 zip()

### 2.9 filter()
시퀀스 항목 중 함수 조건이 `True`인 항목만 추출해서 반환한다.

### 2.10 map()

### 2.11 lambda
`defaultdict`에서 누락된 키에 대한 기본값 설정 시 매우 유용하다.


```python
from collections import defaultdict
minus_one_dict = defaultdict(lambda : -1)
point_zero_dict = defaultdict(lambda : (0,0))
message_dict = defaultdict(lambda : 'No message')
```

## 3. 파일 처리


```python
# 파일 읽어서 빈 줄을 제거하는 코드
import sys

def read_data(filename):
    lines = []
    fh = None
    try:
        fh = open(filename)
        for line in fh:
            if line.strip():
                lines.append(line)
    except (IOError, OSError) as err:
        print(err)
    finally:
        if fh is not None:
            fh.close()
    return lines

def write_data(lines, filename):
    fh = None
    try:
        fh = open(filename, 'w')
        for line in lines:
            fh.write(line)
    except EnvironmentError as err:
        print(err)
    finally:
        if fh is not None:
            fh.close()
            
def remove_blank_lines():
    for filename in sys.argv[1:]:
        lines = read_data(filename)
        if lines:
            write_data(lines, filename)
            
if __name__ == '__main__':
    remove_blank_lines()
```

    [Errno 2] No such file or directory: '-f'


### 3.1 파일 처리 메서드
- `open(filename, mode, encoding)` : 파일 객체를 반환한다
- `read(size)` : `size`만큼의 내용을 읽고, 문자열로 반환한다.
- `readline()` : 파일에서 한 줄을 읽는다. 개행 문자는 문자열 끝에 남는다. 파마지막 행에서만 생략된다.
- `readlines(size)` : 파일의 모든 데이터 행을 포함한 리스트를 반환한다.


- `write()` : 데이터를 파일에 쓰고, `None`을 반환한다.
- `tell()` : 파일의 현재 위치를 나타내는 정수를 반환한다.
- `seek(offset, from-what)` : 파일 내 탐색 위치를 변경할 때 사용한다.


- `close()` : 파일을 닫고, 시스템 자원을 해제한다.


- `peek(n)` : 파일 포인터 위치를 이동하지 않고, n 바이트를 반환한다.
- `fileno()` : 파일 서술자를 반환한다.

### 3.2 shutil 모듈
시스템에서 파일을 조작할 때 유용하다. shell util 인 듯

### 3.3 pickle 모듈
파이썬 객체를 가져와서 문자열 표현으로 변환한다.(serialization)

### 3.4 struct 모듈
파이썬 객체를 이진 표현으로, 이진 표현을 파이썬 객체로 변환할 수 있다. 객체는 특정 길이의 문자열만 처리할 수 있다.


## 4. 오류 처리
**synrax error**가 있으면 컴파일이 아예 안 되지만, **exception**은 실행 중에야 발견할 수 있으므로 신중하게 처리해야 한다.

### 4.1 예외 처리
`try-except-finally` 문을 사용하여 예측 가능한 예외를 처리할 수 있다. `raise`문을 사용하여 특정 예외를 의도적으로 발생시킬 수 있다.
`else`문을 사용할 수도 있다.

### 4.2 예외 처리 스타일 가이드
- `raise MyError('오류 메시지')` 또는 `raise MyError`와 같이 예외를 발생시킨다. 두 개의 인수 형식을 사용하지 않는다.
- `assert` 문은 내부적으로 정확성을 보장하기 위해 사용한다. 정확한 사용법과 예상치 못한 이벤트에 대해서는 `raise`로 예외를 발생시키자.
- 라이브러리 또는 패키지에 따라 자체적인 예외를 정의하자. 내장 `Exception` 클래스를 상속해서.
- 모든 예외를 처리하는 `except:, except Exception, except StandardError`를 사용하지 않는다. 
- `try / except` 블록 내 코드의 양을 최소화한다. 실제 오류를 발견하기 어렵다.
- `try` 문 예외 여부에 관계없이 `finally`문을 꼭 사용한다. 자원을 정리하는 데 유용하다.
- 예외를 처리할 때는`,` 대신 `as`를 사용한다.
