---
title: "객체지향 프로그래밍과 설계(16)"
excerpt: "SOLID 설계 정신"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-28T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 팩토리 메서드

- 사용할 클래스를 정확히 몰라도 객체 생성을 가능하게 해 주는 패턴
- 정적 메서드 `createOrNull()`을 통해서만 생성 가능

```java
public final class Cup {
    private int sizeMl;

    private Cup(int sizeMl) {
        this.sizeMl = sizeMl;
    }

    public static Cup createOrNull(CupSize size) {
        switch (size) {
            case SMALL :
                return new Cup(355);
            case MEDIUM:
                return new Cup(473);
            case LARGE:
                return new Cup(651);
            default:
                assert (false) : "Unhandled CupSize" + size;
                return null;
        }
    }
}

enum CupSize {
    SMALL, MEDIUM, LARGE
}
```

생성자 대신 정적 메서드를 사용하는 것의 장점
- `null`을 반환 가능
- 생성자는 생성이 불가능한 경우 예외를 던질 수 밖에 없음
  - 반환형이 없기 때문

## 다형적인 팩토리 메서드

> 나라별로 다른 사이즈의 컵을 생성하려면?

1. `createOrNull()`의 매개변수에 나라도 넣어준다
2. `createOrNull()`을 다형적으로 만든다.
   - `static` 메서드를 다형적으로 만들 수 없음
   - 따라서 **자식 클래스를 만들어야 함**

```java
public final class Cup {
    private int sizeMl;

    Cup(int sizeMl) {
        this.sizeMl = sizeMl;
    }

    public int getSize() {
        return this.sizeMl;
    }
}

public abstract class Menu {
    public abstract Cup createCupOrNull(CupSize size);
}

public final class AmericanMenu extends Menu {
    @Override
    public Cup createCupOrNull(CupSize size) {
        switch (size) {
            case SMALL :
                return new Cup(473);
            case MEDIUM:
                return new Cup(621);
            case LARGE:
                return new Cup(887);
            default:
                assert (false) : "Unhandled CupSize" + size;
                return null;
        }
    }
}

public final class KoreanMenu extends Menu {
    @Override
    public Cup createCupOrNull(CupSize size) {
        switch (size) {
            case SMALL :
                return new Cup(355);
            case MEDIUM:
                return new Cup(473);
            case LARGE:
                return new Cup(651);
            default:
                assert (false) : "Unhandled CupSize" + size;
                return null;
        }
    }
}
```
```java
Menu menu = new KoreanMenu();
Cup cup = menu.createCupOrNull(CupSize.LARGE);

System.out.println(cup.getSize()); // 651

Menu menu = new AmericanMenu();
Cup cup = menu.createCupOrNull(CupSize.LARGE);

System.out.println(cup.getSize()); // 887
```

> 각 나라마다 사용하는 컵 종류가 다르다면?

```java
public abstract class Cup {
    private int sizeMl;

    protected Cup(int sizeMl) {
        this.sizeMl = sizeMl;
    }

    public int getSize() {
        return this.sizeMl;
    }
}

public final class GlassCup extends Cup { // 한국에서 쓰는 컵
    GlassCup(int sizeMl) {
        super(sizeMl);
    }
}

public final class PaperCup extends Cup { // 미국에서 쓰는 컵
    private Lid lid;

    GlassCup(int sizeMl, Lid lid) {
        super(sizeMl);
        this.lid = lid
    }
}

public final class AmericanMenu extends Menu {
    @Override
    public Cup createCupOrNull(CupSize size) {
        Lid lid = new Lid(size);

        switch (size) {
            case SMALL :
                return new PaperCup(473);
            case MEDIUM:
                return new PaperCup(621);
            case LARGE:
                return new PaperCup(887);
            default:
                assert (false) : "Unhandled CupSize" + size;
                return null;
        }
    }
}

public final class KoreanMenu extends Menu {
    @Override
    public Cup createCupOrNull(CupSize size) {
        switch (size) {
            case SMALL :
                return new GlassCup(355);
            case MEDIUM:
                return new GlassCup(473);
            case LARGE:
                return new GlassCup(651);
            default:
                assert (false) : "Unhandled CupSize" + size;
                return null;
        }
    }
}
```

## 장점
- 클라이언트는 본인에게 익숙한 인자를 통해 객체 생성 가능
  - 커피 사이즈는 톨 사이즈로 주세요! -> 355ml
- 생성자에서 오류 상황 감지 시 null 반환 가능
- 다형적으로 객체 생성 가능
  - 가상 생성자 패턴이라고도 함

# 빌더
- 객체의 생성과정을 그 객체의 클래스로부터 분리하는 방법
- 객체의 부분부분을 만들어 나가다 준비되면 그제서 객체를 생성
  - ex) 벽돌을 하나씩 쌓아 담장을 만든다.
- 다형성이 없는 빌더는 이미 `StringBuilder`에서 봄

## StringBuilder
복잡한 문서는 String으로 만들기 힘들다.
- 문자열 붙이기를 계속하는 법 : 성능 문제가 있음
- `String.foramt()` : 서식 문자열이 매우 복잡해짐

StringBuilder가 알아서 문자열을 합쳐줌
- 오버로딩된 `append()`덕분에 String외에 다른 것도 추가하기 쉬움
- 내부에서 알아서 효율적으로 문자열을 합쳐줌

## 플루언트 인터페이스

```java
builder.append(heading);
builder.append(newLine);
builder.append(heading);
```
- 아직 2% 부족
- 작성자의 의도 : 제목을 넣고 줄을 바꾸고 싶음
- 코드에서 의도가 명확히 보이지 않음
  - 서로 다른 3개를 추가하는 느낌
  - 실제 글을 읽듯 읽히지 않는다.

- 빌더 패턴을 구현 시 플루언트 인터페이스도 지원

```java
builder.append(heading)
        .append(newLine)
        .append(newLine);
```
- `append()` 메서드가 자기 자신을 반환한다.


## 빌더 패턴의 잘못 사용한 예

```java
public class Employee {
    private String firstName;
    private String lastName;
    private int id;
    private int yearStarted;
    private int age;

    public Employee(String firstName, String lastName, int id, int yearStarted, int age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
        this.yearStarted = yearStarted;
        this.age = age;
    }
}
```
- 매개변수의 순서를 잘못 넣어줄 가능성이 있음

```java
Employee robert = new EmployeBuilder(1) // 생성자 매개변수는 한 개
    .withAge(31)
    .withStartingYear(2020) // 누락 시 유효하지 않은 객체
    .withName("Robert", "Lee")
    .build();
```
- 메서드 이름이 명확하니 잘못된 값을 전달할 확률이 적음
- 호출자가 적절한 메서드를 호출하지 않으면
  - 객체가 생성될 때 유효한 상태여야 한다는 원칙에 어긋남

## 자바에서 해결 가능한 방법 : 매개변수 클래스

```java
public class Employee {
    private String firstName;
    private String lastName;
    private int id;
    private int yearStarted;
    private int age;

    public Employee(CreateEmployeeParams params) {
        this.firstName = params.firstName;
        this.lastName = params.lastName;
        this.id = params.id;
        this.yearStarted = params.yearStarted;
        this.age = params.age;
    }
}
```
```java
CreaateEmployeeParams params = new CreaateEmployeeParams();

params.firstName = "chan";
...

Employee employee = new Employee(parmas);
```

- `Employee` 생성자 매개변수를 구조체처럼 만들어 전달
- 생성자에 인자 순서를 잘못 넣는 경우를 해결
- 여전히 실수로 매개변수를 안 넣는 등의 문제는 존재

> 코멘트 중 의문점. 나중에 답변 달리는지 찾아볼 것
> 
> **최종 `builder()` 메서드에서 객체 상태가 온전한지 체크해주면 되는 것 아닌가?**

## 다형적인 빌더 패턴

```java
CsvReader reader = new CsvReader(csvText);
HtmlTaableBuilder builder = new HtmlTableBuilder();

reader.writeTo(builder);

HtmlDocument html = builder.toHtmlDocument();
```
```java
CsvReader reader = new CsvReader(csvText);
MarkdownTaableBuilder builder = new MarkdownTableBuilder();

reader.writeTo(builder);

String markdown = builder.toMarkdownText();
```

- 다형적인 함수 호출이 아님
- 실제 빌더 객체의 레퍼런스를 들고 있기에 가능하다.

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)