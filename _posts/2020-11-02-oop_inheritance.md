---
title: "객체지향 프로그래밍과 설계(6) - 상속"
excerpt: "상속"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-02T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 상속
- OOP의 핵심
- **다형성의 기반**
- 이미 존재하는 클래스를 기반으로 새 클래스를 만드는 방법

```java
public class Student extends Person {
  private Major mahor;
  
  public Student(){
  }
  ...
}
```

# 생성자 호출 순서
부모 클래스 먼저 초기화한다. 그 다음 자식 클래스 초기화

1. 메모리에 객체 생성
2. 부모 생성자 호출
3. 자식 생성자 호출

부모 클래스에 생성자가 여러개라면 어떤 생성자를 호출?
- 자식 생성자에서 특정 부모 생성자를 정해주지 않으면, 컴파일러는 부모 클래스의 매개변수 없는 생성자를 호출한다.
- 부모 클래스에 매개변수 없는 생성자가 없다면?
  - 컴파일 에러
  - `super` 키워드로 부모 생성자를 지정해줘야 한다.

```java
public class Student extends Person {
  public Student(String firtstName, String lastName){
    super(firstName, lastName)
  }
}
```

`super` 키워드는 부모의 생성자 뿐만 아니라 부모의 멤버 변수나 메서드를 호출할 때도 사용 가능하다.(`this`와 유사)

# 부모 멤버에 접근하기
접근 제어자 `protected`를 적용하면 자식 클래스에서 부모 멤버에 접근 가능하다.

```java
public class Person {
  protected String email;
  ...
}

public class Teacher extends Person {
  ...
  public setEmail(String email) {
    super.email = email; // super 대신 this도 가능!
  }
}
```

상위 클래스일수록 일반적, 추상적이고 하위 클래스일수록 특정적, 구체적이다.

# is-a, has-a
is-a 관계
- 상속 관계
- 수학에서 부분집합 관계
- A is a B : A는 자식, B는 부모 클래스

## 상속 vs 컴포지션
- 둘 다 재사용성을 위한 방법
- 상속으로 해결할수 있는 문제를 컴포지션으로도 가능
  - 그 반대도 가능
  - 순전히 기술적 관점
- has-a 관계 : 컴포지션
- is-a 관계 : 상속

## is-a 관계

### 부모 타입에 자식 타입 객체 대입 가능?

```java
Student student = new Student("chan", "gung");
Person person = student; // compile OK

Person[] people = new Person[2];
Person[1] = student // OK
```

### 자식 타입에 부모 타입 객체 대입 가능?

```java
Person person = new Person("chan", "gung");
Student student = person; // compile Error!
```

### 실제 자식 객체의 타입이라면 자식 타입에 부모 타입 객체 대입 가능?

```java
Student student = new Student("chan", "gung");
Person person = student;

Student actuallyStudent = person; // compile Error!
```

### 자식을 부모에 대입한 뒤 부모에서 자식의 메서드 호출 가능?

```java
Student student = new Student("chan", "gung");
Person person = student;

person.getMajorOrNull(); // Compile Error!
```

- 컴파일러는 현재 데이터형 기준으로 판단하기 때문
- **실제로는 `Person person = student;`는 type casting**
  - 암시적 캐스팅

### 반대 캐스팅은 반드시 **명시적으로!**

- 자식 <- 부모 할당은 명시적 캐스팅으로만 가능

```java
Student student = new Student("chan", "gung");
Person person = student;

Student actuallyStudent = (Student) person;
```

1. 부모를 자식으로 캐스팅 후 호출
2. 컴파일 잘 됨

### 상관없는 클래스로 캐스팅하면?

```java
Teacher teacher = new Teacher("chan", "gung");

Student student = (Student) teacher; // Compile Error!
```

Person은 Student일 수도 있으니 컴파일러가 허용
- Teacher가 Student일 리 없으니 허용 안 함
- **형제 클래스 간 캐스팅은 불가능**

### 컴파일러가 못 잡아내는 경우

```java
Person person = new Student("chan", "gung");
Teacher teacher = (Teacher) person;
```

- 런타임 에러 발생
  - `ClassCastException`

# `instanceof` 연산자

위의 코드에서 런타임 에러를 막기 위해

1. Person 객체가 실제로는 Teacher인지 확인
2. 실제로 Teacher인 경우에만 Teacher로 캐스팅

RTTI라고 함
- 반드시 특정 클래스의 인스턴스만을 확인하는 것이 아님
- 부모 클래스에도 true를 반환

```java
Person person = new PartTimeTeacher("chan", "deng");

if (person instanceof PartTimeTeacher) {
  System.out.println("iampartteacher");
}

if (person instanceof Teacher) {
  System.out.println("iamteacher");
}
```

# 클래스 정보

## `getClass()`

`<변수명>.getClass()`
- 런타임에 객체의 클래스 정보를 얻어올 수 있음
- 반환된 객체(`class`)에는 여러 유용한 메서드가 들어 있음
  - `getClass().getName()`
    - 클래스명을 반환하는 메서드
    - 클래스명은 패키지 이름까지 포함
    - 로그 메서지 출력할 때 많이 사용한다

## RTTI
- 매니지드 언어들은 보통 지원
- 성능 또는 메모리가 중요한 경우에는 별로인 기능

# Object 클래스
- `getClass()` 메서드를 구현한 적이 없는데 어디서 구현?
- Java의 **모든 클래스**는 Object라는 클래스를 상속
- String의 `equals()` 메서드도 여기서 온 것


# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

