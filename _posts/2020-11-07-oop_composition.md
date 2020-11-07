---
title: "객체지향 프로그래밍과 설계(8)"
excerpt: "상속 vs 컴포지션"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-07T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

OO 모델링 실력 높이는 법
- **많은 코딩 경험만이 해답**
- 다른 사람의 코드를 많이 사용해 보자
- 코드 리뷰를 주고받아보자

# 상속 vs 컴포지션

- 둘 다 **재사용성이 목적**
- 가능/불가능의 측면에서는 대부분의 경우 둘 다 사용 가능
- 둘 중 하나를 고를 때는 **원칙**이 필요

# 메모리 차이

상속의 경우
- 객체 생성 시, 메모리가 **하나의 덩어리**
  ```java
  Box box = new Box(10, 20, 30);
  ```
- 상속 관계인 경우
  - 여전히 하나의 덩어리
  - 부모 객체 메모리 내부에서 멤버들을 참조

컴포지션
- 객체 생성 시 메모리가 **여러 덩어리**
  ```java
  Rectangle rectangle = new Rectangle(10, 20);
  Box box = new Box(rectangle, 30);
  ```

**이와 같은 메모리의 차이가 실행 성능에 영향을 미침**

상속 모델로 만든 객체
- 객체가 **한 번에** 캐시 메모리에 들어갈 가능성이 높음
- 메모리 할당과 해제가 `한 번`씩

컴포지션 모델로 만든 객체
- 객체 내 **부품 수 만큼** 캐시 메모리로 로딩할 가능성이 높음
- 메모리 할당과 해제가 `한 번 + 부품 수` 만큼씩

> 메모리 최적화가 필요한 특수 경우에는 컴포지션보다 상속을 사용하는것이 좋다.

# 용도 차이

상속을 사용하는 경우
- 다른 타입의 객체들을 한꺼번에 처리하고 싶을 때 (다형성)

# 관리의 효율 차이

## 상속이 유용한 경우

`Person - Teacher` 관계에서 Person의 메서드를 Teacher에서 사용하려 할 때

상속의 경우
- 부모의 메서드를 Teacher에서 또 만들 필요 없음
- 즉, 자식 객체 상에서 부모의 메서드 호출 가능

컴포지션의 경우
- Teacher에서 동일한 시그니처의 메서드를 선언해야 한다.
- 시그니처의 중복이 생길 수 있다.

## 컴포지션이 유용한 경우

깊은 상속 관계
- 상위 클래스를 바꾸면 하위 클래스도 모두 바뀜
- 자식 클래스에서 문제가 없는지 모두 확인해야 함
- 컴포지션도 유사한 문제가 있으나, 조립성을 강조하였기 때문에 상속보다는 덜하다
- **인터페이스나 다형성이 이 문제를 완화**

# 일반적인 경우

- 같은 코드에 다른 의견을 주면 코드 리뷰를 받는 사람이 헷갈려함
- 따라서 **has-a와 is-a 관계에 충실하자!**

# 엔티티 컴포넌트 시스템
- **코드 변경 없이 자유롭게 객체를 만들 수 있도록 하는** 목적
- 여러 컴포넌트를 조합하여 게임의 NPC나 플레이어를 만들어냄

```java
public class GameObject {
    private String name;
    private ArrayList<Component> components = new ArrayList<Component>();

    public GameObject(String name) {
        this.name = name;
    }

    public void addComponent(Component component) {
        components.add(component);
    }

    public void update() {
        for (Component component : this.components) {
            component.update();
        }
    }
}

GameObject player = new Gameobject("player");
player.addComponent(new EntityComponent());
player.addComponent(new PhysicsComponent());
player.addComponent(new ControllableComponent());

player.update();
```


# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

