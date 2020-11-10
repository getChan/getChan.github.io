---
title: "객체지향 프로그래밍과 설계(11)"
excerpt: "인터페이스"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-10T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 인터페이스는 순수 추상 클래스

순수 추상 클래스
- 구현은 빼고 동작만 모아 놓은 것
- 구조체 : 데이터만 모아 놓은 것
- 클래스 : 데이터와 동작을 모아 놓은 것

인터페이스는 특수한 클래스
- 상태 없음
- 동작의 구현 없음
- 동작의 시그니처만 있음

# 추상 클래스를 인터페이스로

```java
public interface ILoggable {
  void log(String message);
}

public final class ConsoleLogger implements ILoggable {
}
```
- `class`를 `interface`로 변경
- `extends`를 `implements`로 변경
- `abstract` 키워드가 필요 없음
  - 인터페이스는 그 자체가 추상적
- 메서드는 언제나 `public`
- **추상 클래스를 상속받는 것과 다르지 않음**

인터페이스의 메서드를 구현하지 않으면 컴파일 오류!
- ConsoleLogger를 abstract로 만들면 구현 안 해도 됨
  - 대신 ConsoleLogger 자식 클래스에서 구현해야 함
- 인터페이스 안 쓸 때
  - 상속받은 메서드를 구현할 때 메서드 이름에 오타내는 경우
  - 부모 클래스의 메서드 이름만 바꾸고 자식 클래스 손 안대는 경우
    - 아무 문제없이 컴파일 됨

# Java 어노테이션

```java
public class Cat extends Animal {
  @Override
  public void shuot() {
    // 컴파일 에러
  }
}
```

인터페이스가 아니어도 오타를 잡을 수 있다
- 자식 클래스에서 의도를 명백히 적어줄 수 있으면 됨
  - 부모 클래스의 메서드를 오버라이딩
  - 인터페이스의 메서드 시그니처를 구현
- 컴파일러가 의도에 맞는 메서드 시그니처를 못 찾으면 컴파일 오류

## 어노테이션
- 프로그램에 대한 metadata를 제공
  - 코드 실행에는 영향을 안 미침
- 용도
  - 컴파일러에게 정보를 제공
  - 컴파일 또는 배포 단계에서 어노테이션을 기반으로 처리를 할 수 있음
  - 런타임에도 어노테이션 기반 처리가 가능

# 다중 상속

```java
public interface ILoggable {
  void log(String message);
}

public interface ISavable {
  void save(String filename);
}

public final class ConsoleLogger implements ILoggable, ISavable {
  private ArrayList<String> logs = new ArrayList<String>();

  public void log(String message) {
    logs.add(message);
    System.out.println(message);
  }

  public void save(String filename) {
    // 파일에 로그를 저장한다.
  }
}
```

클래스에서 다중 상속이 불가능했던 이유는 **상태와 메서드의 중복** 때문이다. 
- 인터페이스는 두 부모 클래스의 실체가 없기에 중복되도 상관 없음
  - 메서드 시그니처가 중복
  - 상속받은 클래스가 한 메서드 구현만 제공하면 끝
  - **단, 반환형만 다르면 컴파일 오류**
    - 빈환형만 다른 경우는 올바른 함수 *오버로딩*이 아니기 때문

어떻게 상속해도 인터페이스의 구현은 하나뿐
- 메서드의 구현은 클래스에서
- 클래스의 다중 상속은 불가능
- 따라서 한 클래스 안에서 인터페이스의 구현은 단 하나

실무에서의 핵심 용도
1. 함수 포인터처럼 사용하는 인터페이스
2. 다중 상속을 흉내내는 방법

**핵심은 다형성**

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

