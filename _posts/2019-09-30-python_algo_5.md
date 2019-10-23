---
title:  "파이썬 자료구조와 알고리즘(5)-객체지향 설계"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - algorithm
tags:
  - study
  - book
  - python
  - oop
last_modified_at: 2019-09-30T08:06:00-05:00
---



기대하는 속성만 가진 객체를 만들어야 한다. 데이터를 패키지화하고, 메서드를 제한해야 한다. 이것이 **객체지향 프로그래밍**이다. 

## 1. 클래스와 객체
**클래스**는 사전에 정의된 특별한 데이터와 메서드의 집합이다. 그대로 생성된 실체를 **객체** 라 한다. 객체가 소프트웨어에 실체화될 때 **인스턴스**라 한다. 

### 1.1 클래스 인스턴스 생성
함수 표기법을 사용하여 초기 상태의 객체를 생성하는 것. 여러 이름을 같은 객체에 **binding(aliasing)**할 수 있다. 

`Hello()`를 **생성자**라고 한다. 생성자를 호출하면 `Hello.__new__()`라는 특수 메서드가 호출되어 객체가 할당되고 그다음 `Hello.__init__()` 메서드가 객체를 초기화한다.

##### attribute
객체는 data와 method로 이루어지는 attribute가 있다. 속성은 `.` 뒤에 나오는 모든 이름이다. 모듈 내 모든 이름의 참조는 속성 참조이다

`모듈명.함수명`과 같은 표현식에서 `모듈명`은 모듈 객체이고, `함수명`은 객체의 속성 중 하나다. 속성은 read-only일 수 있고 writable일 수 있다. writable attribute는 `del`문으로 삭제할 수 있다.

##### namespace
이름을 객체로 mapping하는 것이다. 대부분 딕셔너리로 구현되어 있다.

#### scope
네임스페이스에 직접 접근할 수 있는 textual region이다. 스코프는 정적으로 결정되지만, 동적으로 사용된다. 즉 한 모듈에 정의된 함수의 전역 스코프는 해당 모듈의 네임스페이스다.

## 2. 객체지향 프로그래밍의 원리
### 2.1 specialization
**특수화**는 슈퍼클래스의 모든 속성을 **상속**하여 새 클래스를 만드는 절차다. 모든 메서드는 서브 클래스에서 재정의될 수 있다.(파이썬에서 모든 메서드는 virtual이다.) 

구글 스타일 가이드에서는 클래스가 상속받지 않으면 최상위 클래스인 `object`를 명시적으로 표기하는 것을 권장한다.

### 2.2 polymorphism
**다형성**(동적 메서드 바인딩)은 메서드가 서브 클래스 내에서 재정의될 수 있다는 원리다. 슈퍼 클래스의 메서드를 호출해야 한다면, 내장된 `super()` 메서도를 사용하여 호출할 수 있다.

### 2.3 composition과 aggregation
**합성**은 한 클래스에서 다른 클래스의 인스턴스 변수를 포함하는 것을 말하며, 클래스 간의 관계를 나타낸다. 의존성이 강하다. 예를 들어 집 클래스는 방 클래스를 갖는다. 집이 있으면 방이 있다.

**집합화**는 연관 관계가 있지만 독립적이다. 학생 클래스는 미술, 음악 등의 과목 클래스를 갖는다. 과목을 수강하지 않을 수 있다.

### 2.4 클래스 예제


```python
import math


class Point(object):
    def __init__(self, x=0, y=0):
        self.x = x  # 데이터 속성(attribute)
        self.y = y

    def distance_from_origin(self):  # 메서드 속성
        return math.hypot(self.x, self.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __repr__(self):
        return "point ({0.x!r}, {0.y!r})".format(self)

    def __str__(self):
        return "({0.x!r}, {0.y!r})".format(self)


class Circle(Point):
    def __init__(self, radius, x=0, y=0):
        super().__init__(x, y)  # 생성 및 초기화
        self.radius = radius

    def edge_distance_from_origin(self):
        return abs(self.distance_from_origin() - self.radius)

    def area(self):
        return math.pi*(self.radius**2)

    def circumference(self):
        return 2*math.pi*self.radius

    def __eq__(self, other):
        return self.radius == other.radius and super().__eq__(other)

    def __repr__(self):
        return "circle ({0.radius!r}, {0.x!r})".format(self)

    def __str__(self):
        return repr(self)
```

## 3. 디자인 패턴
**디자인 패턴**은 잘 설계된 구조의 형식적 정의를 소프트웨어 엔지니어링으로 옮긴 것이다. 

### 3.1 decorator pattern
`@`표기를 사용해 함수 또는 메서드의 변환을 우아하게 지정한다. 함수의 객체와 함수를 변경하는 다른 객체의 wrapping을 허용한다.


```python
class C(object):
    @my_decorator
    def method(self):
        # 메서드 내용
        pass
######################### 다음 코드와 같다

class C(object):
    def method(self):
        # 메서드 내용
    method = my_decorator(method)
```

일반적으로 사용하는 데커레이터는 `@classmethod`와 `@staticmethod`가 있다. 각각 메서드를 클래스 메서드와 정적 메서드로 변환한다.

`@classmethod`는 첫번째 인수로 `cls`를 사용하고, 클래스 내 변수 접근에 사용한다.

`@staticmethod`는 첫번째 인수에 `self` 혹은 `cls`가 없다.


```python
class A(object):
    _hello = True

    def foo(self, x):
        print("foo({0}, {1}) 실행".format(self, x))

    @classmethod
    def class_foo(cls, x):
        print("class_foo({0}, {1}) 실행: {2}".format(cls, x, cls._hello))

    @staticmethod
    def static_foo(x):
        print("static_foo({0}) 실행".format(x))


if __name__ == "__main__":
    a = A()
    a.foo(1)
    a.class_foo(2)
    A.class_foo(2)
    a.static_foo(3)
    A.static_foo(3)
```

    foo(<__main__.A object at 0x000001FC09A28240>, 1) 실행
    class_foo(<class '__main__.A'>, 2) 실행: True
    class_foo(<class '__main__.A'>, 2) 실행: True
    static_foo(3) 실행
    static_foo(3) 실행


### 3.2 observer pattern
**옵서버** 패턴은 특정 값을 유지하는 핵심 객체를 갖고, 직렬화된 객체의 복사본을 생성하는 일부 옵서버가 있는 경우 유용하다. 즉 한 객체의 상태가 변경되면, 해당 객체에 종속된 모든 객체에 자동으로 갱신하는 방식이다.

`@property`로 구현할 수 있다.


```python
class C(object):
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, new_name):
        self._name = '{} >> {}'.format(self._name, new_name)
```


```python
c = C('진')
c._name
c.name
```




    '진'




```python
c.name='아스틴'
c.name
```




    '진 >> 아스틴'




```python
# 집합을 이용한 옵서버 패턴
class Subscriber(object):
    def __init__(self, name):
        self.name = name

    def update(self, message):
        print("{0}, {1}".format(self.name, message))


class Publisher(object):
    def __init__(self):
        self.subscribers = set()

    def register(self, who):
        self.subscribers.add(who)

    def unregister(self, who):
        self.subscribers.discard(who)

    def dispatch(self, message):
        for subscriber in self.subscribers:
            subscriber.update(message)


if __name__ == "__main__":
    pub = Publisher()

    astin = Subscriber("아스틴")
    james = Subscriber("제임스")
    jeff = Subscriber("제프")

    pub.register(astin)
    pub.register(james)
    pub.register(jeff)

    pub.dispatch("점심시간입니다.")
    pub.unregister(jeff)
    pub.dispatch("퇴근시간입니다.")
```

    아스틴, 점심시간입니다.
    제프, 점심시간입니다.
    제임스, 점심시간입니다.
    아스틴, 퇴근시간입니다.
    제임스, 퇴근시간입니다.



```python
## 딕셔너리 이용한 옵서버 패턴
## 다양한 구독자의 형태를 표현할 수 있다.
class SubscriberOne(object):
    def __init__(self, name):
        self.name = name

    def update(self, message):
        print("{0}, {1}".format(self.name, message))


class SubscriberTwo(object):
    def __init__(self, name):
        self.name = name

    def receive(self, message):
        print("{0}, {1}".format(self.name, message))


class Publisher(object):
    def __init__(self):
        self.subscribers = dict()

    def register(self, who, callback=None):
        if callback is None:
            callback = getattr(who, 'update')
        self.subscribers[who] = callback

    def unregister(self, who):
        del self.subscribers[who]

    def dispatch(self, message):
        for subscriber, callback in self.subscribers.items():
            callback(message)


if __name__ == "__main__":
    pub = Publisher()

    astin = SubscriberOne("아스틴")
    james = SubscriberTwo("제임스")
    jeff = SubscriberOne("제프")

    pub.register(astin, astin.update)
    pub.register(james, james.receive)
    pub.register(jeff)

    pub.dispatch("점심시간입니다.")
    pub.unregister(jeff)
    pub.dispatch("퇴근시간입니다.")
```

    아스틴, 점심시간입니다.
    제임스, 점심시간입니다.
    제프, 점심시간입니다.
    아스틴, 퇴근시간입니다.
    제임스, 퇴근시간입니다.



```python
## 이벤트 기반의 옵서버 패턴
class Subscriber(object):
    def __init__(self, name):
        self.name = name

    def update(self, message):
        print("{0}, {1}".format(self.name, message))


class Publisher(object):
    def __init__(self, events):
        self.subscribers = {event: dict() for event in events}

    def get_subscribers(self, event):
        return self.subscribers[event]

    def register(self, event, who, callback=None):
        if callback is None:
            callback = getattr(who, "update")
        self.get_subscribers(event)[who] = callback

    def unregister(self, event, who):
        del self.get_subscribers(event)[who]

    def dispatch(self, event, message):
        for subscriber, callback in self.get_subscribers(event).items():
            callback(message)


if __name__ == "__main__":
    pub = Publisher(["점심", "퇴근"])

    astin = Subscriber("아스틴")
    james = Subscriber("제임스")
    jeff = Subscriber("제프")

    pub.register("점심", astin)
    pub.register("퇴근", astin)
    pub.register("퇴근", james)
    pub.register("점심", jeff)

    pub.dispatch("점심", "점심시간입니다.")
    pub.dispatch("퇴근", "저녁시간 입니다.")
```

    아스틴, 점심시간입니다.
    제프, 점심시간입니다.
    아스틴, 저녁시간 입니다.
    제임스, 저녁시간 입니다.


### 3.3 Singleton Pattern
>애플리케이션이 시작될 때 어떤 클래스가 최초 한번만 메모리를 할당하고(Static) 그 메모리에 인스턴스를 만들어 사용하는 디자인패턴.
>
>생성자가 여러 차례 호출되더라도 실제로 생성되는 객체는 하나고 최초 생성 이후에 호출된 생성자는 최초에 생성한 객체를 반환한다.
>
>출처: [기본기를 쌓는 정아마추어 코딩블로그](https://jeong-pro.tistory.com/86 )

파이썬은 `private` 접근 제한자가 없기 때문에, `__new__()` 클래스 메서드를 가지고 하나의 인스턴스만 생성되도록 구현해야 한다.


```python
class SinEx(object):
    _sing = None
    
    def __new__(self, *args, **kwargs):
        if not self._sing: # 싱글턴 없으면
            # 상위 클래스의 `__new__()` 호출해서 인스턴스 생성
            self._sing = super(SinEx, self).__new__(self, *args, **kwargs)
        return self._sing
```


```python
x = SinEx()
x
```




    <__main__.SinEx at 0x1fc09ad8b38>




```python
y = SinEx()
x == y
```




    True




```python
y
```




    <__main__.SinEx at 0x1fc09ad8b38>


