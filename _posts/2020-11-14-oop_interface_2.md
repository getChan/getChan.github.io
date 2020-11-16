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
  - 생성자 주입 생략 가능
  - setter 추가로 인해 개체의 유효상태 해칠 수 있음 *(캡슐 옆구리 터진다!)*

## 의존성 주입의 장단점
- 장점
  - 결합도를 낮춤
  - 나중에 Head의 생성자가 바뀌어도 Robot을 바꿀 필요가 없음
  - Head가 바뀌면 이 클래스만 따로 컴파일해서 배포 가능
- 단점
  - 편의성 줄어듬
    - 로봇 생성하면 머리도 딸려 옴
  - 프로그래머의 원해 의도를 잘 보여주는 클래스
    - 분리/합체 로봇 아닌데도 클래스가 의도와 다르게 구현됨

# 상속에서의 결합도

```java
public final class Robot {
  private int hp;
  private Head head;

  public Robot(int initialHp, Head head){
    this.hp = initialHp;
    this.head = head;
  }
}

SimpleHead head = new SimpleHead();
Robot robot = new Robot(300, head);

SmartHead head = new SmartHead();
Robot robot = new Robot(300, head);
```

의존성을 Head로 옮겼다.
- 일반적 / 추상적인 클래스는 자식들을 다 포용하는 개념
- 자식 클래스를 교체해도 그 객체를 사용하는 코드를 바꿀 일이 적음
- 추살 클래스 / 인터페이스도 마찬가지

# 디커플링의 장단점
장점
- 디커플링은 유연성 / 재사용성을 높음
- 미래의 변화에 대비되어 있다.

단점

## 직관적이지 못하다
```java
public final class Robot {
  private int hp;
  private Head head;
  // 이 로봇은 SmartHead인가? SimpleHead인가?

  public Robot(int initialHp, Head head){
    this.hp = initialHp;
    this.head = head;
  }
}
```

- 해결책 1 : 호출자를 찾는다
  - `new Robot`을 찾아 어떤 헤드를 주입하는지 찾아본다.
    - 여러 프로그램은 같은 Head 클래스를 공유하는 환경에서
    - 프로그램 A는 SimpleHead만 사용, 프로그램 B는 SmartHead만 사용한다면? 불가능
- 해결책 2 : 한 프로그램에서만 검색한다.
  - 소스코드에 `new SimpleHead()`나 `new SmartHead()`가 없는 경우가 있음
- 해결책 3 : 실행 중에 확인한다
  - 로봇 생성이 프로그램 실행 2시간 뒤라면???

## 내부를 알아야 좋은 경우도 있다

```java
import java.util.Collection;

public final class DataSource {
  public void mergeTo(Collection<Data> dataset){
    // 소스로부터 모든 데이터를 얻어와 중복 없이 dataset에 넣는다.
  }
}
```
- dataset의 실제 클래스에 따라 차이가 발생
  - Set<> : `add()`만 호출하면 끝
  - ArrayList<> : `contains()`로 중복 검사, 중복 아닌 경우 `add()`
  - 정렬된 ArrayList<> : 이진 검색으로 빠른 중복 검사, 중복 아닌 경우 `add()`

# 인터페이스의 주 용도
- 함수 포인터처럼 사용 가능 (다형성)
- 다중 상속을 흉내낼수 있음 (다형성)
- 변화에 대비해 결합도를 낮추는 것 (단, 다형성이 필요할 때)
- 즉, '다형성 없는 인터페이스는 없다'

> 협업 시 가장 중요한 목표는 실수 예방
> - 소프트웨어 개발은 협업 환경
> - 모두가 직관적으로 이해할 수 있는 방법은 실수를 줄임
>   - 주관성이 그나마 적음
>   - 많은 사람들이 직관적으로 이해할 수 있는 것이 캡슐화
> - 다형성, 포인터, 재귀 함수 등이 이보다 이해하기 어려운 이유
>   - 한 단계 건너뛰어 생각해야 함. 직관성이 줄어듦. 추상적
> - 기본적으로 추상화를 안 하는 게 실수가 적다

# 요즘 실무에서의 예
- 회사 자체 개발팀 소유
- 프로그래머 수만 100+명
- 총 10개의 제품 팀
- 다른 팀 하나는 코어 팀
  - 10개의 제품 팀이 사용하는 핵심 라이브러리를 만듦
  - 라이브러리는 회사 내부에서만 사용

라이브러리를 고칠 때마다 클래스 혹은 인터페이스의 public 메서드 시그니처가 바뀜

요즘은 버전 업 속도가 빨라짐

요즘은 일반적으로 여러 버전을 지원
- 새로운 기능이나 breaking 변화는 새 버전에만 추가
- 버전별 지원 기간을 명시
- 업데이트 후 오작동을 고치는 건 클라이언트 몫

> 일정 기간 동안만 제대로 작동하면 되고 그 뒤에는 깔끔하게 새로운 기능을 사용하도록 마이그레이션을 유도하자! 

# 실용적인 인터페이스 사용법
- 기본적으로 클래스를 사용
- 다음의 경우에만 인터페이스를 사용
  - 함수 포인터
  - 다형성 있는 다중 상속이 필요한 경우
  - 변화에 대비할 필요가 있다면 커플링을 줄이려 사용할 것
    - 내 클래스에 의존하는 코드들을 쉽게 바꿀 수 없는 경우

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)