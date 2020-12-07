---
title: "이펙티브 자바"
excerpt: "책 *이펙티브 자바*를 나름 정리했다."
categories:
  - cs
tags:
  - java
last_modified_at: 2020-12-04T08:06:00-05:00
---
> 본 포스팅의 모든 내용은 책 *<이펙티브 자바 3/E>, 조슈아 블로크 저 / 개앞맵시 역* 을 보고 일부만 정리한 것입니다.

# 객체 생성과 파괴

## 생성자 대신 정적 팩터리 메서드를 고려하라

- 클래스의 인스턴스를 반환하는 단순한 정적 메서드
- 일반적인 디자인 패턴의 factory method와 다르다.

### 장점
1. 이름을 가질 수 있다
   - 반환될 객체의 특성을 쉽게 묘사할 수 있다.
   - 한 클래스에 시그니처가 같은 생성자가 여러 개 필요하다면, 정적 팩터리 메서드로 바꾸고 각 차이를 잘 드러내는 이름을 짓자.
2. 호출될 때마다 인스턴스를 새로 생성하지 않아도 된다.
   - immutable class는 인스턴스를 미리 생성해 두거나 
   - 새로 생성한 인스턴스를 캐싱하여 재활용할 수 있다.
   - 인스턴스의 생성 여부를 통제할 수 있다.
     - 싱글턴 / 인스턴스화 불가로 만들 수 있다.
3. 반환 타입의 하위 타입 객체를 반환할 수 있다.
   - 반환할 객체의 클래스를 자유롭게 선택할 수 있다. 
4. 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.
   - 반환 타입의 하위 타입이기만 하면 어떤 클래스의 객체를 반환하든 상관없다.
5. 정적 팩토리 메서드를 작성하는 시점에는 반환할 객체의 클래스가 존재하지 않아도 된다.
   - 이를 이용해서 *서비스 제공자 프레임워크*를 만들 수 있다.
   - JDBC에서는 `Connection`이 서비스 인터페이스 역할
   - `DriverManager.registerDriver`가 제공자 등록 API
   - `DriverManager.getConnection`이 서비스 접근 API
   - `Driver`가 서비스 제공자 인터페이스 역할을 수행한다.

### 단점

1. 상속을 하려면 public이나 protected 생성자가 필요하니 정적 팩터리 메서드만 제공하면 하위 클래스를 만들 수 없다.
2. 정적 팩터리 메서드는 프로그래머가 찾기 어렵다.
   - 생성자처럼 API에 명확히 드러나지 않는다.
   - 사용자는 정적 팩터리 메서드 방식 클래스를 인스턴스화할 방법을 알아내야 한다.

### 흔한 명명 방식

```java
Date d = Date.from(instant);
Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);
BigInteger prime = Biginteger.valueOf(Integer.MAX_VALUE);
StackWalker luke = StackWalker.getinstance(options);
Object newArray = Array.newInstance(classObject, arrayLen);
FileStore fs = Files.getFileStore(path);
BufferedReader br = Files.newBufferedReader(path);
List<Complaint> litany = Collections.list(legacyLitany);
```

## 생성자에 매개변수가 많다면 빌더를 고려하라

정적 팩터리와 생성자 모두 선택적 매개변수가 많을 때 적절히 대응하기 어렵다.

- 클라이언트가 선택적 매개변수에 매번 디폴트 값을 넣어줘야 함

점층적 생성자 패턴

- 생성자를 여러개 오버로딩하는 방법
- 단점
  - 매개변수의 수가 많아지면 클라이언트 코드를 작성하거나 읽기 어렵다.
  - 클라이언트가 매개변수의 순서를 바꿔 넘겨줄 가능성 증가

자바빈즈 패턴

- 매개변수가 없는 생성자로 객체를 만든 후
- setter 메서드들을 호출해 원하는 매개변수의 값을 설정
- 단점
  - 객체 하나를 만들려면 메서드를 여러 개 호출해야 함
  - 생성자 호출 시점에 객체는 불완전한 상태
    - 클래스를 불변으로 만들 수 없다.
      - Thread-safe하게 하려면 프로그래머가 추가 작업을 해줘야 한다.

## 빌더 패턴

1. 필수 매개변수만으로 생성자(정적 팩토리)를 호출해 빌더 객체를 얻는다
2. 빌더 객체가 제공하는 메서드로 선택 매개변수를 설정
3. 매개변수가 없는 `build` 메서드를 호출해 객체를 얻는다.

보통 생성할 클래스 안에 정적 멤버 클래스로 만들어 둔다.

```java
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    private final int sodium;
    private final int carbonhydrate;

    private NutritionFacts(Builder builder) {
        this.servingSize = builder.servingSize;
        this.servings = builder.servings;
        this.calories = builder.calories;
        this.fat = builder.fat;
        this.sodium = builder.sodium;
        this.carbonhydrate = builder.carbonhydrate;
    }

    public static class Builder {
        // 필수 매개변수
        private final int servingSize;
        private final int servings;

        // 선택 매개변수 : 기본값으로 초기화한다.
        private int calories = 0;
        private int fat = 0;
        private int sodium = 0;
        private int carbonhydrate = 0;

        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings = servings;
        }

        public Builder withCalories(int val) {
            this.calories = val;
            return this;
        }

        public Builder withFat(int val) {
            this.fat = val;
            return this;
        }

        public Builder withSodium(int val) {
            this.sodium = val;
            return this;
        }

        public Builder withCarbonhydrate(int val) {
            this.carbonhydrate = val;
            return this;
        }

        public NutritionFacts build() {
            return new NutritionFacts(this);
        }
    }
}
```

```java
// 클라이언트 코드
NutritionFacts cocaCola = new NutritionFacts.Builder(240, 0)
  	.withCalories(100).withSodium(35)
  	.build();
```

매개변수의 유효성 검사

- 빌더의 생성자와 메서드에서 입력 매개변수를 검사
- `build` 메서드가 호출하는 생성자에서 불변식을 검사하자
  - `new NutritionFacts(this)`
  - 불변식 예 : 리스트의 길이는 -1이 될 수 없다. 불변과는 다른 개념
- 검사 중 잘못된 점을 발견하면 `IllegalArgumentException`예외를 던지거나, 유효한 대체 값을 설정해준다.

## 단점

- 코드가 장황하다
- 생성 비용이 크지는 않으나, 성능이 민감한 상황에서는 고려 대상


# Reference
[책 *이펙티브 자바*](http://www.yes24.com/Product/Goods/65551284)