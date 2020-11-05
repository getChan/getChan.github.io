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



# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

