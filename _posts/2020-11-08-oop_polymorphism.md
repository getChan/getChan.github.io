---
title: "객체지향 프로그래밍과 설계(9)"
excerpt: "다형성"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-08T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 다형성

- 어떤 형태가 다양한 형태로 변할 수 있는 성질
- 같은 지시를 내렸는데 다른 종류의 객체가 동작을 달리하는 것
- 어떤 함수 구현이 실행될지는 런타임에 결정됨
  - late binding
- 일반적인 함수 호출은 early binding
  - 컴파일 타임에 결정됨
- 다형성의 혜택을 받으려면 상속 관계가 필요
  - 부모 객체에서 함수 시그니처를 선언
  - 자식 객체에서 함수를 다르게 구현(overriding)


# 무늬 vs 실체
```java
public class Animal {
    public void shout() {
        System.out.println("나 동물이다~");
    }
}

public class Bird extends Animal {
    public void shout() {
        System.out.println("삐약");
    }
}

public class Cat extends Animal {
    public void shout() {
        System.out.println("야옹");
    }
}
```

```java
Animal animal = new Cat();
animal.shout(); // 뭘 호출?
```
- 변수 자료형이 아닌 실제 개체 자료형의 `shout()`를 호출한다.

**어떤 객체가 다양한 형태로 변할 수 있는 능력**
- 어떤 객체 : 부모 클래스형의 변수, 참조 중인 객체
- 다양한 형태 : 실제 객체에 구현된 메서드

# 코드로 본 다형성의 의미
1. 겉보기에는 같은 형으로 보이는 객체들
2. 그 객체들에 동일한 명령을 내림
3. **그러나 객체의 실제 형에 따라 알아서 다른 행동을  함**  

## 겉보기에는 같은 형
- 상속 관계를 의미
- 부모형으로 자식 객체를 참조할 떄에 한함
- 상속 관계가 없는 객체들도 포함 안됨
- 상속은 다형성에 필요한 선수 조건

## 객체들에 내리는 동일한 명령

```java
public class Cat extends Animal {
    public void shout() {
        System.out.println("야옹");
    }
    public void purr() {
        System.out.println("그르르");
    }
}

Animal animal = new Cat();

animal.shout(); // OK
animal.purr(); // 컴파일 에러
((Cat) animal).purr(); // OK
```

- **부모 클래스에서 메서드의 시그니처를 정해줘야 함**
- 자식 클래스에서 그 메서드의 구현을 덮어씀
  - 오버라이딩
- 자식 클래스에서 메서드 재정의를 하지 않으면 부모의 메서드를 그대로 사용

# 오버라이딩은 선택사항

부모의 동작을 유지하면서 오버라이딩할 수 있다.

```java
public class Sloth extends Animal {
    public void shout() {
        System.out.println("냅둬~");
        
        super.shout();
    }
}
```

- 생성자 내 `super()`와 다르게 반드시 첫번째 줄에서 호출할 필요 없다.

# 다형성의 장점
- 각 자료형의 코드가 클래스 안에 들어가니 캡슐화 증가
- 유지보수성 또한 높아짐
- 새로운 클래스를 추가할 때 클래스 코드만 추가하면 됨
- 클라이언트가 작성할 코드가 줄어듦

# 늦은 바인딩 vs 이른 바인딩

## 늦은 바인딩

```java
public void keepShouting(Animal animal, int count) {
    for (int i = 0; i < count; ++i){
       animal.shout();
    }
}
```

- 실제로 호출되는 메서드 구현이 프로그램 **실행 중**에 결정된다는 의미
- 동적 바인딩이라고도 함
- 가상 메서드라고도 함
  - 자식 클래스에서 동작을 오버라이딩할 수 있는 메서드
  - **다형적인 메서드**

## 이른 바인딩

- 정적 바인딩이라고도 함
- C의 함수호출 방식
- 어떤 함수 구현을 호출해야 할지가 빌드 중에 결정됨
- C에서 가능한 이유는 다형성을 지원하지 않기 때문이다!

## 함수 포인터

C에서 동적 바인딩을 하게끔 하는 기능. Java의 동적 바인딩 또한 C의 함수 포인터로 동작한다. 

- C에 없는 기능은 하드웨어에 없다.
- 즉. 컴파일러와 JVM이 함수 포인터 같은 걸 대신 전달해주는 것

## 성능 비교

둘 중 CPU 최적화가 더 잘 될 가능성이 높은 것은?
- **이른 바인딩**
  - 컴파일러가 실제로 어떤 함수를 호출해야 하는지 앎
  - 따라서 컴파일 중에 충분한 시간을 들여 최적화를 할 수 있음

# 오버라이딩 막기

```java
public class Athlete {
  public final int getHeight() {
    return this.height;
  }

  public final double getWeight() {
    return this.weight;
  }
}

public class BasketballPlayer extends Athlete {
  public int getHeight() { // 컴파일 에러!
    return super.getHeight() + 5 ;
  }
}
```

## `final` : 수정 못 해! 그대로 써!
- 메서드 앞에 `final`을 붙이면 자식에서 오버라이딩 불가
  - C의 함수 호출과 동일하게 동작
  - 이른 바인딩 가능

## `final` 키워드 의미
1. 변수 앞에 붙는다
2. 메서드 앞에 붙는다
3. 클래스 앞에 붙는다
   - 더 이상 상속하지 못함
   - 자식 클래스 존재 불가
   - 따라서, 오버라이딩 불가능

## `final`은 기본적으로 붙인다
- 변수, 메서드, 클래스 가능하면 모두 `final`을 붙이는 게 좋다.
- 나중에 상속 및 변경해야 하는 상황이 오면 `final`을 빼도 됨
- 예외
  - 상속 및 변경을 할 개연성이 높은 클래스 및 메서드
  - 소스코드 없이 외부에 제공하는 라이브러리

# `Object` 클래스
- Java 클래스는 모두 `Object`로부터 상속받음
- 따라서 `Object`에 있는 메서드들은 어떤 클래스에서도 오버라이딩 가능

## `toString()` 메서드
- 사람이 읽기 편하게 해당 객체를 문자열로 표현
- 기본 구현
  - `getClass().getName() + '@' + Integer.toHexString(hashCode())`
- 공식 문서에서는 모든 클래스에서 이 메서드를 오버라이딩하라 권장

## `equals` 메서드
- 문자열의 동치 비교할 때 이미 본 메서드
- 기본 구현
  - `this == obj`
  - 단순한 주소 비교
  - 실제 객체 속의 데이터를 일일이 비교하지 않음
- 클래스마다 같다는 의미가 다를 수 있음
  - 클래스 속 데이터를 비교해야 한다면 오버라이딩 필요
  - `String` 클래스도 오버라이딩했음
  - 이 때, hashCode()도 **반드시 같이** 오버라이딩해야 함

## `hashCode()` 메서드
- 객체를 대표하는 해시값을 32비트 정수로 반환
  - 동치인 두 객체는 해시값이 같음
  - 동치가 아닌 두 객체도 해시값이 같을 수 있음(해시 충돌)
- 기본 구현
  - `객체의 주소를 반환`

### 목적
- Java가 자체 제공하는 HashMap 클래스에서 사용하려고
  - key로 사용하는 객체의 해시값이 필요
- 덕분에 얻은 이득
  - 빠른 비교용으로 사용 가능(클래스가 제대로 구현했을 경우에만)
  - 단, 두 객체가 같지 않음만 빠르게 판단 가능

### 오버라이딩 예

```java
public int hashCode() {
    return this.firstName.hashCode() ^ (this.lastName.hashCode() << 16);
}
```

- 이미 문자열에 해시 코드 있으니 가져다 xor
- 단순히 xor만 하면 `firstName`과 `lastName`의 위치만 바꿔도 같은 값
- 따라서 16비트만큼 왼쪽으로 비트 이동(shift)


# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

