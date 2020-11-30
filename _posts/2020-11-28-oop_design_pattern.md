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

# 래퍼 패턴
- **어떤 클래스의 메서드 시그니처가 맘에 안 들 때 다른 걸로 바꾸는 방법**
- 단, 그 클래스의 메서드 시그니처를 직접 변경하지 않음
  - 그 클래스의 소스코드가 없을 수도 있음
  - 그 클래스에 의존하는 다른 코드가 있을 수도 있음
- 대신 새로운 클래스를 만들어 기존 클래스를 감싼다.

## 메서드 시그니처를 바꾸려는 이유
1. 추후 외부 라이브러리를 바꿀 때 클라이언트 코드를 변경하지 않기 위해
2. 그냥 사용 중인 메서드가 코딩 표준에 맞지 않아서
3. 기존 클래스에 없는 기능을 추가하기 위해
4. 확장된 용도 : 내부 객체를 클라이언트에게 노출시키지 않기 위해
   - DTO (Data Transfer Object) 만들기

## 그래픽 API 예제
```java
clearScreen(float, float, float, float) // OpenGL
clear(int, int, int, int) // DirectX
```
- 둘 다 화면을 어떤 색상으로 지우는 메서드
- 다른 점
  1. 메서드 이름
  2. r, g, b, a 매개변수의 형과 유효한 범위

```java
public final class Graphics {
    private OpenGL gl;
    ...
    public void clear(float r, float g, float b, float a) {
        this.gl.clearScreen(a, r, g, b);
    }
}
```

클라이언트는 래퍼 클래스만 사용
```java
Graphics graphics;
this.graphics.clear(0.f, 0.f, 0.f, 1.f);
this.graphics.clear(1.f, 0.f, 0.f, 1.f);
// 어떤 graphic을 사용하는지 알 필요 없음
```

`Graphics` 메서드들이 directX를 사용하도록 변경
```java
public final class Graphics {
    private DirectX dx;
    ...
    public void clear(float r, float g, float b, float a) {
        this.dx.clear((int) (r * 255), (int) (g * 255), (int) (b * 255), (int) (a * 255));
    }
}
```

## DTO
- DB에 저장된 데이터를 읽어 웹페이지에 보여주는 시스템
- `PersonEntity`를 웹 브라우저에 반환하면?
  - 필요 이상의 데이터를 반환
  - 민감정보도 포함되어 있음

**데이터 전송에만 사용하는 객체를 DTO라 함**
- `PersonEntity`를 `PersonDto`로 변환하는 메서드만 만들면 됨

```java
public final class PersonEntity {
    public UUID id;
    public Stirng fullName;
    public String email;
    public String passwordHash;
    public Date createdDateTime;

    public PersonDto toDto() {
        return new PersonDto(this.fullName, this.email, this.createdDateTime);
    }
}
```

엄밀하게는 래퍼 패턴은 아님
- 궁극적인 목표는 비슷
- DTO는 타 클래스의 데이터를 내 필요에 맞게 바꾸는 것

# 프록시 패턴
> 프록시 서버란 실제 웹사이트와 사용자 사이에 위치하는 중간 서버
> 
> 인터넷상의 캐시 메모리처럼 작동함
> - 사용자는 프록시 서버를 통해 원하는 문서를 읽으려 함
> - 프록시 서버에 이미 그 문서가 저장되어 있다면 그걸 반환
> - 없다면 실제 웹서버에서 문서를 읽어와 프록시 서버에 저장

목적
- 클래스 안에서 어떤 상태를 유지하는 게 여의치 않은 경우
  - 데이터가 너무 커서 미리 읽어 두면 메모리 부족
  - 객체 생성 시 데이터를 로딩하면 시간이 꽤 걸림
  - 객체는 만들었으나 그 속의 데이터를 사용하지 않을 수도 있음
- 이럴 경우 붋필요한 데이터 로딩을 방지
  - 객체 생성 시에는 데이터 로딩에 필요한 정보만(ex. 파일 위치) 기억해 둠
  - 클라이언트가 실제로 데이터를 요청할 때 메모리에 로딩

## 예시 : 이미지 데이터

이미지는 용량이 크고, 저장장치에서 읽어와야 한다.

```java
public final class Image {
    private ImageData image;
    
    public Image(String filePath) {
        this.image = ImageLoader.getInstance().load(filePath);
        // 프록시 패턴 사용 X, 즉시 로딩
    }

    public void draw(Canvas canvas, float x, float y) {
        canvas.draw(this.image, x, y);
    }
}
```

문제점
- 생성자에서 무조건 이미지를 읽어 옴
- 메모리를 많이 사용
- 이미지를 읽어오는 데 시간도 걸림
- 모든 image에 대해 draw()가 호출되지 않을 수도 있음

프록시 패턴을 적용
```java
public final class Image {
    private String filePath;
    private ImageData image;
    
    public Image(String filePath) {
        this.filePath = filePath;
    }

    public void draw(Canvas canvas, float x, float y) {
        if (this.image == null) {
            this.image = ImageLoader.getInstance().load(this.filePath);
            // 지연 로딩
        }
        canvas.draw(this.image, x, y);
        // 이미 메모리에 로딩해 놓았으면 그대로 갖다 쓴다.
    }
}
```


# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)