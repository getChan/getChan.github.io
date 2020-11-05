---
title: "객체지향 프로그래밍과 설계(7)"
excerpt: "상속을 이용한 개체 모델링"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-05T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 아날로그 벽시계 모델링

## 상태와 메서드

상태
- 시
- 분
- 초
- 시침
- 분침
- 초침

동작
- 현재 시간은?
- 현재 시계 바늘의 위치는?
- 시간을 바꾼다
- 벽에 건다

### 중복되는 상태는 지우자!
- 시/분/초침 각도는 시/분/초 상태로 도출 가능하다. 따라서 중복 제거

```java
public class Clock {
    private byte hours = 12;
    private byte minutes = 0;
    private byte seconds = 0;

    public byte getHours() {
        return this.hours;
    }

    public void setHours(byte hours) {
        this.hours = hours;
    }

    public byte getMinutes() {
        return this.minutes;
    }

    public void setMinutes(byte minutes) {
        this.minutes = minutes;
    }

    public byte getSeconds() {
        return this.seconds;
    }

    public void setSeconds(byte seconds) {
        this.seconds = seconds;
    }

    public void setTime(byte hours, byte minutes, byte seconds) {
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
    }
}
```

## setter의 문제

- 올바른 시/분/초 범위를 벗어난 값이 들어올 수 있음

## 무책임한 해결법

```java
public void setHours(byte hours) {
    if (hours <= 0 || hours > 12) {
        throw new IllegalArgumentException("hours must be [1, 12]");
    }
    
    this.hours = hours;
}
```

- 예외를 던지고 메서드 실행을 중단시킴

## 예외 없이 시간 바꾸기
- 입력값이 최솟값, 최댓값을 넘지 못하게 제한한다. (clamp)

```java
public void setHours(byte hours) {
    this.hours = clamp(hours, (byte) 1, (byte) 12);
}

public static byte clamp(byte number, byte min, byte max) {
    return (byte) Math.min(max, Math.max(min, number));
}
```

- 최솟값을 넘으면 최댓값, 최솟값을 넘으면 최솟값으로 wrapping한다.
  - 최댓값과 최솟값을 연결

```java
public void setHours(byte hours) {
    int value = hours -1;

    while (value < 0) {
        value += 12;
    }

    this.hours = (byte) (value % 12 + 1);
}

public void setMinutes(byte minutes) {
    while (minutes < 0) {
        minutes += 60;
    }

    this.minutes = (byte) (minutes % 60);
}
```

## 받아올림하는 시간 바꾸기

```java
public void setMinutes(byte minutes) {
    int wrapCount = 0;

    while (minutes < 0) {
        --wrapCount;
        minutes += 60;
    }

    wrapCount += minutes / 60;

    this.minutes = (byte) (minutes % 60);

    if (wrapCount != 0) {
        setHours((byte)(this.hours + wrapCount));
    }
}
```

기존 코드와의 차이점
- 이전 setter들은 다른 멤버변수를 사용하지 않음
- 수정된 setter는 다른 멤버 변수에 의존
- 따라서 `setTime()`내의 메서드 호출 순서가 중요해짐
  - 반드시 `setHour()` -> `setMinutes()` -> `setSeconds()`
- 이러한 문제를 **시간적 결합**이라 함
  
## 시간적 결합을 해결한 시간 바꾸기
- 모든 setter 제거
- `addSeconds()` 메서드로 대체

```java
public void addSeconds(short seconds) {
    final int HALF_DAY_IN_SECONDS = 60 * 60 * 12;

    int value = this.seconds + seconds;
    while (value < 0) {
        value += HALF_DAY_IN_SECONDS;
    }

    this.seconds = (byte) (value % 60);

    value = value / 60;
    value += this.minutes;

    this.minutes = (byte) (value % 60);

    value = value / 60;
    value += this.hours - 1;
    this.hours = (byte) (value % 12 + 1);
}
```

## 모든 상태를 초 단위로 저장하도록 변경

```java
public class Clock {
    private int seconds;

    public byte getHours() {
        int hours = this.seconds / 60 / 60;

        return hours == 0 ? 12 : (byte) hours;
    }

    public byte getMinutes() {
        return (byte) (this.seconds / 60 % 60);
    }

    public byte getSeconds() {
        return (byte) (this.seconds % 60);
    }

    public void addSeconds(short seconds) {
        final int HALF_DAY_IN_SECONDS = 60 * 60 * 12;

        int value = this.seconds + seconds;
        while (value < 0) {
            value += HALF_DAY_IN_SECONDS;
        }

        this.seconds = value % HALF_DAY_IN_SECONDS;
    }
}
```

> **+** 클래스 내부의 상태는 항상 유효한 상태를 유지해야 한다. `setter`에서 유효하지 않은 상태인지 검사한 뒤 항상 유효한 상태로만 만들어야 한다.

# 디지털 벽시계 모델링

- 아날로그 시계와 공통되는 부분은 부모 클래스로
- 차이점은 부모 클래스를 상속받은 새 클래스로

## 차이점
1. 오전/오후 구분 및 출력
2. 시간 맞추는 방식
3. 7세그먼트 디스플레이를 이용한 시간 출력

## 오전/오후 구분하기

```java
public class DigitalClock extends Clock {
    public boolean isBeforeMidday() {
        return (super.seconds / (DAY_IN_SECONDS / 2) == 0);
    }
}
```

## 디지털 벽시계 시간 맞추기

시/분/초를 따로 설정한다
1. 시/분/초 별로 1씩 증가
2. 숫자를 직접 입력

## 7세그먼트 디스플레이

각 선분의 on/off 여부를 저장하는 방법
1. 불리언 요소를 7개 가진 배열
2. 비트 플래그
   - `enum`과 `EnumSet` 이용
3. `SevenSegmentDisplay` 클래스
   - 불리언 배열 / 비트 플래그 모두 가능

```java
public class DigitalClock extends Clock {
    public boolean isBeforeMidday() {
        return (super.seconds / (DAY_IN_SECONDS / 2) == 0);
    }

    public SevenSegmentDisplay[] getHourDisplay() {
        return convertToTwoDigitDisplay(getHours());
    }

    private SevenSegmentDisplay[] convertToTwoDigitDisplay(byte number) {
        SevenSegmentDisplay[] displays = new SevenSegmentDisplay[2];

        for (int i = 1; i >= 0; --i) {
            byte digit = (byte) (number % 10);
            displays[i] = new SevenSegmentDisplay(digit);
            number /= 10;
        }
        return displays;
    }
}
```

> 상속 모델링을 할 때는 자식 클래스를 먼저 설계한 뒤 자식 클래스들을 공통점을 토대로 부모 클래스를 설계하도록 하자.

# 다중 상속

손목시계를 모델링한다고 하면, 어떤 클래스를 상속받아야 할까?
- 손목시계가 디지털이라면? 아날로그라면?
  - 벽시계, 손목시계마다 따로따로 클래스를 생성?
    - **중복 발생**

자바는 다중상속을 지원하지 않는다.
- 잘못 사용하면 매우 복잡해짐
  - 최상위 부모를 여러번 상속..

자바에서는 상속만으로 이러한 문제를 해결하기 까다롭다.

## 다중 상속이 생기는 이유

**전혀 다른 양상의 특징을 상속받으려 함**
- 최상위 부모 : 시간을 기록하는 기능
- 아날로그 vs 디지털 : 현재 시간을 '어떻게' 표현하는가
- 벽시계 vs 손목시계 : 시계를 '어디에' 장착하는가

## 해결 방법
1. `wear()`와 `mount()`를 추상화
   - 둘 다 어딘가에 **붙이는** 개념
   - `attach()` 메서드로 합치자
2. 인터페이스
   - 곧 배운다.

# 깊은 상속의 어려움

- 1단계 상속
  - 여러 클래스로부터 공통 부분을 뽑아내 일반화/추상화
- 2단계 상속
  - 이미 일반화시킨 것에서 다시 공통 부분을 뽑아내 일반화/추상화
- n단계 상속
  - 2단계 반복

**상속 단계가 증가할수록 추상화 능력이 더 필요**
- 인간에게 익숙한 방법이 아님
- 추상화가 깊어지면 실체를 찾기 어려워 실수할 가능성 증가

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

