---
title: "파이썬 데코레이터 use case"
excerpt: "dp와 airflow에서 decorator를 적용해본 경험"
categories:
  - TIL
tags:
  - python
  - design pattern
  - airflow
  - dp
last_modified_at: 2020-06-14T08:06:00-05:00
---

# 데코레이터 패턴

>- implement the interface of the extended (decorated) object (`Component`) transparently by forwarding all requests to it
>- perform additional functionality before/after forwarding a request.

라고 위키백과에 나와있다. 한 객체에 기능을 확장하는 패턴 정도로 받아들이면 될 것 같다. 프록시 패턴과 매우 유사하다.

![img](https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Decorator_UML_class_diagram.svg/400px-Decorator_UML_class_diagram.svg.png)

# In Python

파이썬에서는 함수에 함수를 인자로 전달하는 방법으로 구현된다. `wrapper_function`안에 여러 로직은 `original function`이 실행된기 전에 수행된다.

```python
def decorator_function(original_function):  #1
    def wrapper_function():  #5
        return original_function()  #7
    return wrapper_function  #6

def display():  #2
    print 'display 함수가 실행됐습니다.'  #8

decorated_display = decorator_function(display)  #3
decorated_display()  #4
```

```sh
$ python decorator.py
display 함수가 실행됐습니다.
```

## Logging

프록시 패턴과 유사해서 로깅 기능을 구현하는 데도 적절하게 사용된다고 한다.

```python
import datetime
import time

def my_logger(original_function):
    import logging
    logging.basicConfig(filename='{}.log'.format(original_function.__name__), level=logging.INFO)
    
    def wrapper(*args, **kwargs):
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        logging.info(
            '[{}] 실행결과 args - {}, kwargs - {}'.format(timestamp, args, kwargs))
        return original_function(*args, **kwargs)

    return wrapper

@my_logger
def display_info(name, age):
    time.sleep(1)
    print 'display_info({}, {}) 함수가 실행됐습니다.'.format(name, age)

display_info('John', 25)
```

## Dynamic Programming

나는 알고리즘에서 dp로 문제를 해결해야 할 때(특정 함수 호출의 결과값을 저장해야 할 때) 주로 사용해왔다.

```python
def memo(func):
	cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memo
def fibo(n):
    if n < 2:
        return 1
    else:
        return fibo(n-2) + fibo(n-1)
```

# Airflow에 적용

airflow에서 XCOM을 사용하면서 데코레이터를 적용해보았다. 

XCOM은 airflow의 task 간에 특정 상태 정보를 공유하기 위해서 사용되는 개념인데, 특정 함수에서 xcom을 통해 변수를 가져오려면 다음과 같이 코드를 작성해야 한다.

```python
def pull_function(**context):
    value = context['task_instance'].xcom_pull(task_ids='pushing_task')
```

하지만 매번 특정 함수의 파라미터를 `**context` 로 변경하고 내부 코드도 재작성하면 기존 함수의 재사용성이 떨어지는 번거로운 일이 생긴다. 이 문제를 세련되게 풀어보고자 데코레이터 함수를 작성했다.

```python
def pull_xcom_param(*task_ids_to_pull):
    '''
    일반 함수에서 airflow의 xcom 변수를 가져오게끔 하는 데코레이터 함수
    :task_ids_to_pull: 파라미터를 가져올 task ids
    '''
    def wrapper(func):
        def decorator(**context):
            xcom = context['task_instance'].xcom_pull(task_ids=task_ids_to_pull)
            return func(*xcom)
        return decorator
    return wrapper

def push_function():
    return value

@pull_xcom_param('pushing_task')
def pull_function(pushed_value):
    print(pushed_value)
```

이렇게 하면 기존 함수 코드에 데코레이터 함수명과 task id만 더해주면 깔끔하게 재사용이 가능하다. 하나 뿐만 아니라 여러개의 task도 pull이 가능하다. *단. 태스크에서 pull하려는 매개변수의 순서와 데코레이터에 넘겨주는 task_id의 순서가 같아야 한다.*

데코레이터와 같은 디자인 패턴들을 실제 코드에 적용해볼 때면 왠지 모르게 뿌듯하다. :sunglasses:

# Reference

[https://en.wikipedia.org/wiki/Decorator_pattern](https://en.wikipedia.org/wiki/Decorator_pattern)

[http://schoolofweb.net/blog/posts/파이썬-데코레이터-decorator/](http://schoolofweb.net/blog/posts/파이썬-데코레이터-decorator/)