---
title: "객체지향 프로그래밍과 설계(4) - 객체 모델링"
excerpt: "객체 모델링"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-10-29T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

객체지향 설계에서의 난관
- 정답이 없음
- 사람처럼 생각하자는 것이 OOP
- '사람다움'은 **주관적**
- 한 번에 제대로 설계하기 어려움
- 여러 번 다시 고치기가 쉽다.

# 클래스 다이어그램 
- 시스템에 있는 클래스들을 보여주는 다이어그램
  - 클래스 안에 들어있는 상태, 동작, 접근 제어자
  - 클래스 간의 관계(상속, 컴포지션 등)
- 시스템의 정적인 구조를 보여주기에 적합
- UML의 일부

# 분무기 모델링

## 분무기 상태
1. 클래스명 정하기 : `WaterSpray`
2. 가장 중요한 상태 : 현재 남아있는 물의 양
   - 처음 분무기가 생성될 때는 `0`
   - `int remainingWaterInMl` (단위는 ml)
3. 생성자
4. 남은 물의 양을 확인하는 `getter`
5. 물을 채우려는 `setter`
   - '물을 200ml까지 채워야지'
   - '물을 100ml 추가해야지'?
     - `addWater()` 메서드가 적합
      ```java
      public void addWater(int amountInMl) {
        this.remainingWaterInMl += amountInMl
      }
      ```

## 분무기 동작
1. 메서드 이름은?
   ```java
   public void spray() {
     this.remainingWaterInMl -= Math.min(this.remainingWaterInMl, 5);
   }
   ```
2. `void spray()` vs `int spray()`
   - 분무한 양을 반환하지 않더라도 확인 가능
   - 직접 반환하게 만들 수 있음
     - 메서드 시그니처만으로 뭘 반환하는지 알기 힘듦
     - 메서드가 하는 일이 너무 많다고 볼 수 있음(주관적)

## 분무기 용량 추가
현재 분무기에는 최대 용량이 없음

### 모든 분무기의 용량이 같은 경우
코드를 수정하더라도 UML은 변하지 않음

클래스 다이어그램의 범위
- 클래스가 가지고 있는 상태
  - 상수는 멤버 변수에 속하지 않음
- 클래스의 실행할 수 있는 동작의 목록
- 클래스 간의 관계

### 분무기마다 용량이 달라질 수 있는 경우
공장에서 찍어 나오면 용량이 바뀌지 않음
- 생성자에서 초기화되고 변경 불가능한 멤버 변수
- setter가 없어야 함

클래스 다이어그램이 변경됨. 용량 상태 추가

> 상태를 추가하면 새로운 메서드가 필요한 경우도 생긴다. 필요할 때마다 필요한 상태만 추가하는 게 좋은 이유.

## 수도꼭지가 필요하지 않을까요?
정말 수도꼭지 클래스가 필요한가?
- 물은 어디서 오는데?
- 실세계를 그대로 모델링하려다 저지르는 실수

**정말 필요한 것만 만들자!**

# 화분 모델링
- 클래스 이름 `FlowerPot`
- 상태 : 살았니? 죽었니?
  - `private boolean alive = true`
  - 생성자가 하는 일은 없음
  - setter 없어야 함
- 상태 : 필요한 최소 물의 양
  - `int minDailyWaterInMl`
  - setter 추가 안함
- 동작 : 화분에 물 주기
  - `void addWater(int amountInMl)`

하루에 여러 번 뿌릴 수 있게 다시 모델링
- 하루에 받은 총 분무량을 기억
- 하루가 끝났음을 알림

# OO적 상호작용
현재까지의 설계는 절차적 사고방식

호출자에서 이런 일을 함
1. 분무기에서 물을 분사
2. 몇 ml 분사되었는지 확인
3. 그 뒤에 화분에 물을 추가

즉, waterSpray나 FlowerPot을 그냥 **데이터 저장소**로만 사용함

## '분무기를 화분에 대고 뿌린다.'
```java
public class WaterSpray {
  ...
  public void sprayTo(FlowerPot pot) {
    int amountToSpray = Math.min(this.remainingWaterInMl, 5);
    pot.addWater(amountToSpray);

    this.remainingWaterInMl -= amountToSpray;
  }
}
```

## '분무기를 줄 테니 알아서 뿌리세요'
```java
public class FlowerPot {
  ...
  public void addWater(WaterSpray spray) {
    int water = spray.getRemainingWater();
    spray.spray();
    water -= spray.getRemainingWater();

    dailyWaterReceved += water;
  }
  ...
}
```

두 방법 중 정답은 없다. 
- 1번이 더 자연스러우나 2번이 더 객체지향적이다.
  - 분무기만 화분에 물을 줄 수 있다!

실세계의 물체는 수동적인 존재.
- OO 세계의 물체는 자기 주관을 가진 주체
- 사고방식의 변화가 필요

# 부품으로 분리해보기
현재까지는 재활용성이 떨어짐
- 컵으로 물을 줄 수는 없을까?

분무기의 머리와 몸통은 함께 사용해야 하는가?

## 간단히 상태에 따라 분리
- 한 곳에 있는 성태를 머리와 몸통으로 나눔
  - 머리 : SprayHead
  - 몸통 : SprayBottle

- 관련 메서드도 각 클래스로 옮김

이렇게 하면 여러 종류의 머리와 몸통을 조합 가능

머리와 몸통을 독자적인 객체로 인정
- WaterSpray와의 관계는 집합(aggregation)

## `spray()` 메서드는 몸통을 알아야만 한다

- SprayBottle에 `reduceWater()` 메서드 추가
- SprayHead을 `sprayFrom()` 메서드로 변경
  - `head.sprayFrom(body);`

# 유연성 높은 설계가 최고가 아니다!

재사용성이 있어서 좋은 경우

- 자주 사용하는 수식들을 함수로 만듦

너무 쪼개져서 읽기 힘든 경우

- 플레이어의 행동 혹은 외부의 환경에 따라 모든 UI관련 파일을 열어봐야 함
  - 사람의 사고방식을 무시하지 말자!!

코드 유연성

|      | 성능                      | 가독성                    | 재사용성                  |
| ---- | ------------------------- | ------------------------- | ------------------------- |
| 높음 | :small_red_triangle_down: | :small_red_triangle_down: | :small_red_triangle:      |
| 낮음 | :small_red_triangle:      | :small_red_triangle:      | :small_red_triangle_down: |

> 필요에 따라 유연성을 유연하게 조정할 것

# OOP 공부 가이드라인

1. 프로그래머의 기본자세를 확실히 잡을 것

   1. **읽기 명확한 코드 만들기**
   2. **실수를 저지르기 어려운 코드 만들기**
   3. **문제를 해결하는 코드 만들기**
   4. **문제가 생기면 디버깅 하기**

2. 필요에 따라 점점 유연성을 키우는 법을 배워 나가기

   필요 없으면 하지 않는 게 좋아요.

# 다시 사용성 높이기

이전의 문제

- 머리와 물통을 따로 만들어야 함
- 분무기에서 곧바로 분무를 못 함.

## 미리 규격을 정해두자

- 티셔츠 크기와 같은 개념. 국가마다 다를 수 있다!

- 두 열거형을 인자로 받음

  - `SprayHeadSpeed`
  - `BottleSize`

  ```java
  public enum SprayHeadSpeed {
      SLOW,
      MEDIUM,
      FAST
  }
  public enum BottleSize {
      SMALL,
      MEDIUM,
      LARGE
  }
  ```

  - 다른 생성자는 그대로 둬도 됨. 재사용성 유지

## 분무기를 직접 사용하기

SprayBottle에 갔던 메서드들을 다시 WaterSpray로 복귀. 대부분은 head 혹은 body로 **호출 릴레이**

```java
...
    public int getRemainingWater() {
    	return this.body.getRemainingWater();
	}
	
	public void addWater(int milliliter) {
        this.body.addWater(milliliter);
    }
...
```

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

