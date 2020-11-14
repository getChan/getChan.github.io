---
title: "객체지향 프로그래밍과 설계(12)"
excerpt: "인터페이스 vs 구현"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-14T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 의존성

소프트웨어 모듈 A가 제대로 작동하려면 다른 모듈 B가 필요한 경우
- OO에서는 모듈 == 클래스

A는 B에 의존한다
- B가 없으면 A는 작동하지 못함
- A가 없어도 B는 생존 가능

의존성이 있어야 좋은 설계
- 각 클래스의 목적이 뚜렷하다는 의미
- 캡슐화가 잘 되어있다
- 클래스를 재사용할 수 있다

# 결합도 coupling

- 두 소프트웨어 모듈 간에 상호 의존성 정도
  - 클래스 A가 B에 의존
  - 클래스 B도 A에 의존
  - A, B 둘 다 독자 생존이 불가능

> A가 B에 의존하는 상황에서 B를 변경할 때 프로그램이 잘 작동하는가?

1. A의 내부를 변경 안 해도 제대로 동작
   - A가 B에 의존하나 그 정도가 높지 않음
   - 결합도가 낮음
2. A의 내부를 변경해야만 제대로 동작
   - A가 B에 의존하는 정도가 높음
   - 결합도가 높음

> B코드 변경 시, A코드도 변경해야 하면 결합도가 높은 것

# 의존성 주입

A클래스 안에서 B클래스 객체를 생성하지 않는다!

```java
public final class Robot {
  private int hp;
  private Head head;

  public Robot(int initialHp, Head head) {
    this.hp = initialHp;
    this.head = head;
  }
}

Head head = new Head();
Robot robot = new Robot(300, head);
```
- 예제는 '생성자 주입'
- 'setter 주입' 이라는 다른 방식도 있음
- 



# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

