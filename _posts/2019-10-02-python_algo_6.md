---
title:  "파이썬 자료구조와 알고리즘(6)-파이썬 고급 주제"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - web
tags:
  - study
  - book
  - python
  - debug, test
  - threading
last_modified_at: 2019-10-02T08:06:00-05:00
---



# 1. 멀티 프로세스와 멀티 스레드
##### 멀티 프로세스
별도의 메모리 영역을 가지며, 특별한 매커니즘으로만 통신할 수 있다. 프로세서는 각 스레드에 대해 별도의 레지스터 집합을 불러오거나 저장하는데, 프로세스 간 데이터 공유와 통신용으로는 비효율적이다. 파이썬에서는 멀티 프로세스 방식에 `subprocess` 모듈을 사용한다.

##### 멀티 스레드
단일 프로세스 내의 멀티 스레드는 동일한 메모리에 접근한다. 스레드는 데이터 공유를 통해 간단하게 통신하는데. `threading` 모듈의 처리를 통해 한번에 한 스레드만 메모리 영역에 접근할 수 있다. 각 프로세스가 독립적인 스택, 힙, 코드, 데이터 영역을 가지는 반면, 한 프로세스에 속한 스레드는 스택 영역을 제외한 메모리 영역을 공유한다.

파이썬에서는 진짜 병렬실행은 지원 않는다. GIL 을 얻어야 한 스레드가 실행된다.

> **동시성**은 논리적으로 여러 작업이 동시에 실행되는 것처럼 보이는 것이다. 
> **병렬성**은 물리적으로 여러 작업이 동시에 처리되는 것이다. 데이터 병렬성과 작업 병렬성이 있다.

## 1.1 subprocess 모듈
`subprocess` 모듈은 '부모-자식' 프로세스 쌍을 생성하는 데 사용된다. 부모 프로세스는 사용자에 의해 실행되며 차례로 다른 처리를 하는 자식 프로세스의 인스턴스를 실행한다. 멀티 코어의 이점을 살리고 *동시성* 문제를 운영체제가 알아서 처리하도록 한다.


```python
import subprocess
subprocess.run(["echo", "이것은 subprocess입니다."])
```


```python
subprocess.run(['sleep', '10'])
```

## 1.2 threading 모듈
스레드가 여러 개로 분리되면, 스레드 간 데이터 공유의 복잡성이 증가한다. 또한 lock과 deadlock을 회피하는 데 주의를 기울여야 한다. 파이썬 프로그램에는 단 하나의 메인 스레드만 존재한다. 멀티 스레드를 사용하려면 `threading` 모듈을 사용한다

내부적으로 락을 관리하려면 `queue` 모듈을 사용한다. 큐에 의존하면 자원의 접근을 직렬화할 수 있고, 이는 곧 한 번에 하나의 스레드만 데이터에 접근할 수 있게 한다는 뜻이다.(FIFO) 실행 중인 스레드가 있는 동안에는 프로그램은 종료되지 않는다.

worker thread가 작업을 마쳤는데도 프로그램이 종료되지 않는다면 문제가 된다. 스레드를 daemon으로 바꾸면 데몬 스레드가 실행되지 않는 즉시 프로그램이 종료된다. `queue.join()` 메서드는 큐가 빌 때까지 기다린다.


```python
import queue
import threading

q = queue.Queue()

def worker(num):
    while True:
        item = q.get()
        if item is None:
            break
        # 작업을 처리한다
        print('스레드 {} : 처리 완료 {}'.format(num+1, item))
        q.task_done()
        
if __name__ == '__main__':
    num_worker_threads = 5
    threads = []
    for i in range(num_worker_threads):
        t = threading.Thread(target=worker, args=(i,))
        t.start()
        threads.append(t)
    
    for item in range(20):
        q.put(item)
        
    # 모든 작업이 끝날 때까지 대기한다(block)
    q.join()
    
    # 워커 스레드를 종료한다(stop)
    for i in range(num_worker_threads):
        q.put(None)
    for t in threads:
        t.join()
```

    스레드 1 : 처리 완료 0스레드 2 : 처리 완료 1
    스레드 1 : 처리 완료 2
    스레드 1 : 처리 완료 3
    스레드 1 : 처리 완료 4
    스레드 1 : 처리 완료 5
    스레드 1 : 처리 완료 6
    스레드 1 : 처리 완료 7
    스레드 1 : 처리 완료 8
    스레드 1 : 처리 완료 9
    스레드 1 : 처리 완료 10
    스레드 1 : 처리 완료 11
    스레드 1 : 처리 완료 12
    스레드 1 : 처리 완료 13
    스레드 1 : 처리 완료 14
    스레드 1 : 처리 완료 15
    스레드 1 : 처리 완료 16
    스레드 1 : 처리 완료 17
    스레드 1 : 처리 완료 18
    스레드 1 : 처리 완료 19


​    

## 1.3 뮤텍스와 세마포어
**뮤텍스**는 락과 같다. 뮤텍스는 공유 리소스에 한번에 하나의 스레드만 접근할 수 있도록 하는 mutual exclusion 동시성 제어 정책을 강제하기 위해 설계되었다. 예를 들어 한 스레드가 배열을 수정하고 있다고 가정하자. 배열 작업을 절반 이상 수행했을 때, 프로세서가 다른 스레드로 전환했다고 하자. 여기에서 뮤텍스를 사용하지 않는다면, 두 스레드가 동시에 배열을 수정하는 일이 벌어질 것이다.

개념적으로, 뮤텍스는 1부터 시작하는 정수다. 스레드는 배열을 변경해야 할 때마다 뮤텍스를 '잠근다' 즉, 스레드는 뮤텍스가 양수가 될 때까지 대기한 다음 숫자를 1 감소시킨다.(이것이 곧 락이다). 배열 수정을 마치면 뮤텍스가 잠금 해제되어 숫자가 1 증가한다(언락). 배열을 수정하기 전에 뮤텍스를 잠근 후, 수정 작업이 끝나고 잠금을 해제하면, 두 스레드가 배열을 동시에 수정하는 일은 일어나지 않는다.


```python
from threading import Thread, Lock
import threading

# mutex를 사용하지 않을 때
def worker(mutex, data, thread_safe):
    if thread_safe:
        mutex.acquire()
    try:
        print('스레드 {} : {}\n'.format(threading.get_ident(), data))
    finally:
        if thread_safe:
            mutex.realase()

if __name__ == '__main__':
    threads = []
    thread_safe = False
    mutex = Lock()
    for i in range(20):
        t = Thread(target=worker, args=(mutex, i, thread_safe))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
```

    스레드 5168 : 0
    
    스레드 8724 : 1
    
    스레드 1792 : 2
    
    스레드 12084 : 3
    
    스레드 10032 : 4
    
    스레드 9380 : 5
    
    스레드 12912 : 6
    
    스레드 13220 : 7
    
    스레드 11996 : 8
    스레드 1256 : 9


​    
    스레드 5028 : 10
    
    스레드 8876 : 11
    
    스레드 11416 : 12
    
    스레드 10780 : 13
    
    스레드 11668 : 14
    
    스레드 12856 : 15
    
    스레드 13236 : 16
    스레드 3676 : 17


​    
    스레드 12500 : 18
    
    스레드 13196 : 19


​    


```python
from threading import Thread, Lock
import threading

# mutex를 사용힐 때
def worker(mutex, data, thread_safe):
    if thread_safe:
        mutex.acquire()
    try:
        print('스레드 {} : {}\n'.format(threading.get_ident(), data))
    finally:
        if thread_safe:
            mutex.release()

if __name__ == '__main__':
    threads = []
    thread_safe = True
    mutex = Lock()
    for i in range(20):
        t = Thread(target=worker, args=(mutex, i, thread_safe))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
```

    스레드 13116 : 0
    
    스레드 10760 : 1
    
    스레드 13160 : 2
    
    스레드 11604 : 3
    
    스레드 3588 : 4
    
    스레드 5544 : 5
    
    스레드 1612 : 6
    
    스레드 5196 : 7
    
    스레드 2148 : 8
    
    스레드 13300 : 9
    
    스레드 12384 : 10
    
    스레드 792 : 11
    
    스레드 916 : 12
    
    스레드 436 : 13
    
    스레드 11124 : 14
    
    스레드 11796 : 15
    
    스레드 12144 : 16
    
    스레드 12804 : 17
    
    스레드 7404 : 18
    
    스레드 12076 : 19


​    

**semaphore**는 1보다 큰  수로 시작할 수 있다. 세마포어 값은 곧 한번에 자원에 접근할 수 있는 스레드의 수다. 뮤텍스의 락 및 언락 작업과 유사한 wait 및 signal 작업을 지원한다. 


```python
import threading
import time


class ThreadPool(object):
    def __init__(self):
        self.active = []
        self.lock = threading.Lock()

    def acquire(self, name):
        with self.lock:
            self.active.append(name)
            print('획득: {} | 스레드 풀 {}'.format(name, self.active))
    def release(self, name):
        with self.lock:
            self.active.remove(name)
            print('반환: {} | 스레드 풀 {}'.format(name, self.active))

def worker(semaphore, pool):
    with semaphore:
        name = threading.currentThread().getName()
        pool.acquire(name)
        time.sleep(1)
        pool.release(name)
        
if __name__ == '__main__':
    threads = []
    pool = ThreadPool()
    semaphore = threading.Semaphore(3)
    for i in range(10):
        t = threading.Thread(
        target=worker, name='스레드 '+str(i), args=(semaphore, pool))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
```

    획득: 스레드 0 | 스레드 풀 ['스레드 0']
    획득: 스레드 1 | 스레드 풀 ['스레드 0', '스레드 1']
    획득: 스레드 2 | 스레드 풀 ['스레드 0', '스레드 1', '스레드 2']
    반환: 스레드 0 | 스레드 풀 ['스레드 1', '스레드 2']
    획득: 스레드 3 | 스레드 풀 ['스레드 1', '스레드 2', '스레드 3']
    반환: 스레드 1 | 스레드 풀 ['스레드 2', '스레드 3']
    획득: 스레드 4 | 스레드 풀 ['스레드 2', '스레드 3', '스레드 4']
    반환: 스레드 2 | 스레드 풀 ['스레드 3', '스레드 4']
    획득: 스레드 5 | 스레드 풀 ['스레드 3', '스레드 4', '스레드 5']
    반환: 스레드 3 | 스레드 풀 ['스레드 4', '스레드 5']
    획득: 스레드 6 | 스레드 풀 ['스레드 4', '스레드 5', '스레드 6']
    반환: 스레드 4 | 스레드 풀 ['스레드 5', '스레드 6']
    획득: 스레드 7 | 스레드 풀 ['스레드 5', '스레드 6', '스레드 7']
    반환: 스레드 5 | 스레드 풀 ['스레드 6', '스레드 7']
    획득: 스레드 8 | 스레드 풀 ['스레드 6', '스레드 7', '스레드 8']
    반환: 스레드 6 | 스레드 풀 ['스레드 7', '스레드 8']
    획득: 스레드 9 | 스레드 풀 ['스레드 7', '스레드 8', '스레드 9']
    반환: 스레드 7 | 스레드 풀 ['스레드 8', '스레드 9']
    반환: 스레드 8 | 스레드 풀 ['스레드 9']
    반환: 스레드 9 | 스레드 풀 []


## 1.4 데드락과 스핀락
**Deadlock**은 두 개 이상의 프로세스나 스레드가 서로 상대방의 작업이 끝나기만을 기다리고 있기 때문에 결과적으로 아무것도 완료되지 못하는 상태다. 프로그램에서 락을 할당하고, 락을 순서대로 획득한다면, 데드락을 막을 수 있다(일반적으로)

다음 네 조건을 충족하면 데드락이 발생한다. 하나라도 막을 수 있다면, 데드락을 해결할 수 있다.

1. **상호 배제** : 자원은 한 번에 한 프로세스(혹은 스레드)만 사용할 수 있다.
2. **점유와 대기** : 한 프로세스가 자원을 가지고 있는 상태에서, 다른 프로세스가 쓰는 자원의 반납을 기다린다.
3. **비선점** : 다른 프로세스가 이미 점유한 자원을 강제로 뺏어오지 못한다.
4. **순환 대기** : 프로세스 A, B, C가 있다고 가정할 때 A는 B가 점유한 자원을, B는 C가 점유한 자원을, C는 A가 점유한 자원을 대기하는 상태.

**스핀락**은 고성능 컴퓨팅 상황에 유용한 **busy waiting**의 한 형태다. 스핀락은 임계 구역에 진입이 불가능할 때, 진입이 가능할 때까지 반복문을 돌면서 재시도하는 방식으로 구현된 락이다.

## 1.5 스레딩에 대한 스타일 가이드
- 내장 타입의 원자성에 의존하지 않는다.
- `queue` 모듈의 `Queue` 데이터 타입을 스레드 간 데이터를 전달하는 기본 방식으로 사용한다. 그렇지 않으면, `threading` 모듈의 락을 사용한다. 저수준 락 대신, `threading.Condition`을 사용할 수 있도록 조건 변수를 적절하게 사용하는 방법을 숙지한다.


```python
import threading

def consumer(cond):
    name = threading.currentThread().getName()
    print('{} 시작'.format(name))
    with cond:
        print('{} 대기'.format(name))
        cond.wait()
        print('{} 자원 소비'.format(name))

def producer(cond):
    name = threading.currentThread().getName()
    print('{} 시작'.format(name))
    with cond:
        print('{} 자원 생산 후 모든 소비자에게 알림'.format(name))
        cond.notifyAll()
        
if __name__ == '__main__':
    condition = threading.Condition()
    consumer1 = threading.Thread(name='소비자1', target=consumer, args=(condition,))
    consumer2 = threading.Thread(name='소비자2', target=consumer, args=(condition,))
    producer = threading.Thread(name='생산자', target=producer, args=(condition,))
    
    consumer1.start()
    consumer2.start()
    producer.start()
```

    소비자1 시작소비자2 시작
    소비자2 대기
    생산자 시작
    소비자1 대기
    
    생산자 자원 생산 후 모든 소비자에게 알림
    소비자1 자원 소비
    소비자2 자원 소비


# 2. 좋은 습관

## 2.1 가상 환경
- virtualenv
- virtualenvwrapper

## 2.2 디버깅
[**pdb**](http://pymotw.com/3/pdb)를 이용하면 디버깅을 할 수 있다

## 2.3 프로파일링
프로그램 속도가 느리거나 많은 메모리가 소비된다면, 다음과 같이 성능 항목을 검토한다.
- 읽기 전용 데이터는 리스트 대신 튜플을 사용한다.
- 반복문에서 **제너레이터**를 사용한다.
- 문자열 연결할 떄 `+` 연산자 대신 리스트에 문자열을 `append`한 후 마지막에 `join`한다. 

##### cProfile 모듈
호출 시간에 대한 세부 분석을 제공하며, bottleneck을 찾는 데 사용된다.


```python
import cProfile
import time


def sleep():
    time.sleep(5)


cProfile.run('sleep()')
```

             5 function calls in 5.000 seconds
    
       Ordered by: standard name
    
       ncalls  tottime  percall  cumtime  percall filename:lineno(function)
            1    0.000    0.000    5.000    5.000 <ipython-input-4-93a946138785>:5(sleep)
            1    0.000    0.000    5.000    5.000 <string>:1(<module>)
            1    0.000    0.000    5.000    5.000 {built-in method builtins.exec}
            1    5.000    5.000    5.000    5.000 {built-in method time.sleep}
            1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}


​    
​    

##### timeit 모듈
코드 일부분의 실행 시간을 확인하는 데 사용한다.

# 3. 단위 테스트
개별 함수 및 클래스의 메서드에 대한 테스트이다. **단위 테스트**를 위해 `doctest`와 `unittest` 모듈을 제공한다. 외부 라이브러리로 `pytest`모듈도 있다.

## 3.1 용어
- **test fixture** : 테스트 설정을 위한 코드
- **test case** : 테스트의 기본 단위
- **test suite** : `unittest.TestCase`의 하위 클래스에 의해 생성된 테스트 케이스 집합. 각 테스트 케이스 메서드 이름은 `test`로 시작한다.
- **test runner** : 하나 이상의 test suite를 실행하는 객체

## 3.2 doctest
모듈과 함수의 docstring 안에 테스트 코드를 작성할 때 사용한다. 테스트를 작성한 후, 다음 코드만 추가하면 된다.
```python
if __name__ == '__main__':
    import doctest
    doctest.testmod()
```

 `-v` 옵션으로 파이썬을 실행하는 방법이 있고, `unittest` 모듈과 함께 실행할 수도 있다.

 ## 3.3 pytest
 pytest는 사용법이 매우 쉽다. `test`로 시작하는 파일에서 `test`로 시작하는 함수를 작성하기만 하면 된다. `pdb`와 같이 실행할 수 있다.


```python

```
