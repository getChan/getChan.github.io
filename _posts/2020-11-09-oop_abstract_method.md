---
title: "객체지향 프로그래밍과 설계(10)"
excerpt: "추상 메서드와 클래스"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-09T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

다형성은 멋지고 강력한 개념
- 다형성의 OO의 다른 특성인 상속에 기반
- 상속과 다형성은 OO의 또 다른 특성인 추상화에 기반
  - 여러 클래스에서 공통분모를 뽑아 부모 클래스를 만드는 과정
  - 자식마다 달리 작동하는 구현을 부모의 메서드 시그니처로 일반화하는 과정
- 수학의 추상화처럼 OO의 추상화도 좀 더 복잡한 문제 해결을 위한 것

# 모델링 실습
- 몬스터를 만들어서 서로 공격
- 몬스터 종류는 오우거, 유령, 트롤
- 몬스터 종류에 따라 피해치 계산법이 다름

```java
public class Monster {
  ...
  public void attack(Monster target) {
  }

  protected void inflictDamage(int amount) {
    this.hp = Math.max(0, this.hp - amount);
  }
}
```

`attack` 메서드가 비어 있는 이유
- 각 종류의 몬스터가 다른 방법으로 공격하기 때문

`inflictDamage()` 메서드는 `protected`!
- `public`이면 아무나 몬스터의 체력을 깎을 수 있음

## 말 안 듣는 자식 클래스

```java
public final class Troll extends Monster {
  public Troll(int hp, int attack, int defense) {
    super(hp, attack, defense);
  }
  
  public void attack(Monster target) {
    int damage = target.getHp() - (this.getAttack()) - target.getDefense() / 2);
  }
}
```
- `inflictDamage()`를 호출하지 않음...

### 다형성 범위를 조정?

```java
public final void attack(Monster target) {
  int damage = calculateDamage(target);
  target.hp = Math.max(0, target.hp - damage);
}

public int calculateDamage(Monster target) {
    return 0;
}
```
- `calculateDamage()`는 어짜피 자식들이 오버라이딩함

### 자식이 `calculateDamage()`를 구현하지 않는다면?
- 아무리 때려도 체력이 줄지 않음

## 현재 구조의 문제점
- `calculateDamage()` 메서드는 다형성을 위해서만 존재
- 자식이 제멋대로 구현을 안 하면 원하는 기능이 안 나옴

왜 이런 문제가 발생할까?
- 이미 0을 반환하는 구현이 Monster에 있기 때문
- 자식이 해당 메서드를 구현하도록 강제하고 싶다면
  - Monster에 있는 구현 자체를 지우면 됨

구현이 없는 메서드?
- 시그니처는 있음
- 함수 속 코드는 없음
- 동작이 일부라도 구현되지 않은 클래스는 실체가 완성되지 않은 클래스
  - **구체적(Concrete)**이지 않음
  - 이 클래스는 (어느 정도) **추상적(abstract)**이다 라고 할 수 있음

# 추상 메서드/클래스

막고 싶은 실수
1. Monster의 자식 클래스가 `calculateDamage()`를 구현 안 하는 것
2. Monster의 인스턴스를 만드는 것

```java
public abstract class Monster {
  public abstract int calculateDamage(Monster target);
}

public final class Troll extends Monster {
  ...
  public int calculateDamage(Monster target) {
    return this.getAttack() - target.getDefense() / 2;
  }
}
```

## 추상 클래스
- 인스턴스를 만들 수 없는 클래스
  - 구체 클래스 : 인스턴스 생성 가능
- 다른 클래스의 부모 클래스가 될 수 있음
- 반드시 추상 메서드가 들어 있을 필요는 없음

> 독자 생존이 불가능하면 추상 클래스로 변경할 것

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

