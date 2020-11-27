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
- 생성자에서 오류 상황 감지 시 null 반환 가능
- 다형적으로 객체 생성 가능
  - 가상 생성자 패턴이라고도 함


# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

