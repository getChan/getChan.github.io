---
title: "이펙티브 자바"
excerpt: "책 *이펙티브 자바*를 나름 정리했다."
categories:
  - cs
tags:
  - java
last_modified_at: 2020-12-21T08:06:00-05:00
---
> 본 포스팅의 모든 내용은 책 *<이펙티브 자바 3/E>, 조슈아 블로크 저 / 개앞맵시 역* 을 보고 일부만 정리한 것입니다.

# 객체 생성과 파괴

## 1. 생성자 대신 정적 팩터리 메서드를 고려하라

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

## 2. 생성자에 매개변수가 많다면 빌더를 고려하라

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

### 단점

- 코드가 장황하다
- 생성 비용이 크지는 않으나, 성능이 민감한 상황에서는 고려 대상

## 3. private 생성자나 Enum 타입으로 싱글턴임을 보증하라

싱글턴

- 인스턴스를 하나만 생성할 수 있는 클래스
- **클래스를 싱글턴으로 만들면 이를 사용하는 클라이언트를 테스트하기 어렵다.**
  - 싱글턴 인스턴스를 mock 구현으로 대체할 수 없기 때문

싱글턴 만드는 방식

- 생성자를 `private`로 감춘다
- 인스턴스에 접근하는 수단으로 `public static` 멤버를 만든다.

### public static 멤버가 `final` 필드인 방식

```java
public class Elvis {
  	public static final Elvis INSTANCE = new Elvis();
  	private Elvis () {}
  	
  	public void leaveTheBuilding() {}
}
```

- 장점 
  - 클래스가 싱글턴임이 API에 명확히 드러난다.
  - 간결하다

### 정적 팩토리 방식의 싱글턴

```java
public class Elvis {
  	private static final Elvis INSTANCE = new Elvis();
 		private Elvis() {}
  	
  	public Elvis getInstance() {
      	return INSTANCE;
    }
}
```

- API를 바꾸지 않고도 싱글턴이 아니게 변경할 수 있다.
- 정적 팩터리를 제네릭 싱글턴 팩터리로 만들 수 있다.
- 정적 팩터리의 메서드 참조를 공급자(supplier)로 사용할 수 있다.

### Enum 타입 방식의 싱글턴

```java
public enum Elvis {
  	INSTANCE;
  
  	public void leaveTheBuilding() {}
}
```

- 장점
  - 간결하다
  - 추가 구현 없이 직렬화가 가능하다.
- 단점
  - 만들려는 싱글턴이 Enum 외의 클래스를 상속해야 한다면 사용할 수 없다.

## 4. 인스턴스화를 막으려면 `private` 생성자를 사용하라

정적 메서드와 정적 필드만 있는 클래스가 필요할 때도 있다.

- 유틸리티만 모아놓은 클래스
- `Collections`처럼 특정 인터페이스를 구현하는 객체를 생성해주는 정적 메서드(혹은 팩터리)
- `final` 클래스와 관련한 메서드들을 모아놓을 때
  - final 클래스를 상속해서 하위 클래스에 메서드를 구현할 수 없기 때문

```java
public class UtilityClass {
  	private UtilityClass() {
      	throw new AssertionError();
    }
}
```

- 클래스 밖에서 생성자 호출이 불가능
- 상속이 불가능하다
  - 자식 클래스에서 부모 클래스의 생성자를 호출할 수 없기 때문

## 5. 자원을 직접 명시하지 말고 의존 객체 주입을 사용하라

- 사용하는 자원에 따라 동작이 달라지는 클래스에는 정적 유틸리티 클래스나 싱글턴 방식이 적합하지 않다.
  - 클래스가 여러 자원 인스턴스를 지원하고
  - 클라이언트가 원하는 자원을 사용해야 한다
- 인스턴스를 생성할 때 생성자에 필요한 자원(혹은 자원을 생성하는 팩터리)을 넘겨주는 방식(의존 객체 주입) 을 사용하면 유용하다.

## 6. 불필요한 객체 생성을 피하라

똑같은 기능의 객체를 생성하지 말고 객체를 재사용하자

- 불변 객체는 언제든 재사용할 수 있다.
- 안 좋은 예 : `String s = new String("bikini")`
- 좋은 예 : `String s = "bikini"`

생성자 대신 정적 팩터리 메서드를 사용해 불필요한 객체 생성을 피할 수 있다.

- `Boolean(String)` : 생성자는 매번 새로운 객체를 생성
- `Boolean.valueOf(String)` : 재사용 가능한 객체 반환

생성 비용이 비싼 객체를 반복 생성하지 말고 캐싱하여 재사용하자

- 정규표현식 사용 시 `Pattern` 을 생성해두고 재사용하면 성능을 높일 수 있다.

오토박싱은 기본 타입과 대응하는 래퍼 타입의 구분을 쉽게 해 주나, 완전히 없애주지는 않는다.

```java
private static long sum() {
  	Long sum = 0L; // long 아닌 Long 때문에 상당히 느려진다.
  	for (long i = 0; i <= Integer.MAX_VALUE; i++)
      	sum += i;
  	return sum;
}
```

- 불필요한 `Long` 인스턴스가 약 231개 생성된다.
- **박싱된 기본 타입보다는 기본 타입을 사용하고, 의도하지 않은 오토박싱이 들어가지 않도록 주의!**

객체 생성이 아주 무거운 것(ex. db connection)이 아니라면 객체 pool은 굳이 만들지 말자. 요즘 가비지 컬렉터는 상당히 빠르다.

**방어적 복사가 필요한 상황에서는 객체를 재사용하면 안된다!!!**(아이템 50)

## 7. 다 쓴 참조 객체를 해제하라

다 쓴 참조를 null 처리하면 메모리 누수를 막을 수 있다.

- null처리한 참조를 접근하려 하면 즉시 `NPE` 를 던지며 종료된다. (오류를 조기에 발견)

객체 참조를 null 처리하는 일은 예외적인 경우어야 한다.

- 가장 좋은 방법은 참조를 담은 변수를 유효 범위 밖으로 밀어내는 것. (아이템 57)

Stack과 같이 자기 메모리를 직접 관리하는 클래스는 항상 메모리 누수를 주의해야 한다.

- stack은 객체 자체가 아니라 객체 참조를 담는 elements 배열로 저장소 풀을 만들어 원소를 관리한다.
- 비활성 영역은 null처리를 해주자.

캐시도 메모리 누수를 일으키는 주범이다.

- 객체 참조를 캐시에 넣고 나서 객체를 다 쓴 뒤에도 캐시에서 삭제하지 않는 경우

listener 나 callback을 등록만 하고 해제해주지 않으면 메모리 누수가 된다.

## 8. `finalizer` 와 `cleaner` 사용을 피하라

자바는 두 가지 객체 소멸자를 제공한다.

1. `finalizer` : 예측할 수 없고, 상황에 따라 위험할 수 있어 일반적으로 불필요, *어떤 스레드가 수행할 지 모름*
2. `cleaner` : finalizer보다는 덜 위험하지만, 예측 불가능하고 느리고 일반적으로 불필요하다, *수행할 스레드를 제어할 수 있다.*

finalizer와 cleaner는 즉시 수행된다는 보장이 없다. 즉, **제때 실행되어야 하는 작업은 절대 할 수 없다.**

- ex) 파일 닫거나 열기, 동시에 열수 있는 파일 개수는 한계가 있다.

수행 여부도 보장하지 않는다. **상태를 영구적으로 수정하는 작업에서는 절대 사용하면 안된다.**

- ex) db와 같은 공유 자원의 lock을 해제하지 않고 종료될 수 있다.

### 대안

`AutoCloseable` 을 구현해주고, 클라이언트에서 인스턴스를 다 쓰고 나면 `close`메서드를 호출해준다.

- 일반적으로 `try-with-resources` 구문

### 그럼 언제 쓰는거냐

1. 자원의 소유자가 close 를 호출하지 않는 것에 대한 대비
   - FileInputStream, FileOutputStream, ThreadPoolExcutor 등은 안전을 위한 finalizer를 제공
2. native peer와 연결된 객체(??)

## 9. `try-finally` 보다 `try-with-resources` 를 사용하자

자원이 둘 이상이면 try-finally 문은 지저분하다

```java
static void copy(String src, String dst) throws IOException {
  	InputStream in = new FileInputStream(src);
  	try {
      	OutputStream out = new FileOutputStream(dst);
      	try {
          	byte[] buf = new byte[BUFFER_SIZE];
          	int n;
          	while ((n = in.read(buf)) >= 0)
              	out.write(buf, 0, n);
        } finally {
	          out.close();
        }
    } finally {
      	in.close();
    }
}
```

try-with-resources 를 사용하려면 `AutoCloseable` 인터페이스를 구현해야 한다.

```java
static void copy(String src, String dst) throws IOException {
  	try (InputStream in = new FileInputStream(src);
         OutputStream out = new FileOutputStream(dst)) {
      	byte[] buf = new byte[BUFFER_SIZE];
	      int n;
      	while ((n = in.read(buf)) >= 0)
          	out.write(buf, 0, n);
    }
}
```

때때로 예외 하나만 보존되고 여러 개의 다른 예외가 숨겨질 수도 있다. 숨겨진 예외들도 버려지지 않고 stacktrace에 *(suppressed)*를 달고 출력된다.

# 모든 객체의 공통 메서드

>  Object는 객체를 만들 수 있는 구체 클래스지만 기본적으로는 상속해서 사용하도록 설계되었다. final 이 아닌 메서드는 모두 오버라이딩을 염두에 두고 설계된 것이라 오버라이딩시 지켜야 하는 규약히 명확히 정의되어 있다.

## 10. `equals` 는 일반 규약을 지켜 재정의하라

equals 메서드는 오버라이딩하지 않으면 오직 자기 자신과만 같다. 다음 상황에서는 오버라이딩하지 않는 것이 최선

- 각 인스턴스가 본질적으로 고유한 경우 : 값이 아닌 동작하는 개체를 표현하는 클래스 ex) Thread
- 인스턴스의 '논리적 동치성'을 검사할 일이 없는 경우
- 상위 클래스에서 재정의한 `equals`가 하위 클래스에도 들어맞는 경우
- 클래스가 private이거나 package-private이고 equals 메서드를 호출할 일이 없는 경우
- 값이 같은 인스턴스가 둘 이상 만들어지지 않음을 보장하는 클래스(싱글턴, Enum)

오버라이딩해야할 경우

- 객체 식별이 아닌 '논리적 동치성'을 확인해야 하는데, 상위 클래스의 equals가 논리적 동치성을 비교하도록 오버라이딩되지 않을 때
  - 주로 값을 표현하는 클래스

**`equals` 규약을 어기면 그 객체를 사용하는 다른 객체들이 어떻게 반응할지 알 수 없다.**

양질의 `equals` 메서드 구현 방법

1. `==` 연산자를 사용해 입력이 자기 자신의 참조인지 확인한다.
   - 성능 최적화용, 비교 작업이 복잡한 상황에 유용하다.
2. `instanceof` 연산자로 입력이 올바른 타입인지 확인한다.
3. 입력을 올바른 타입으로 형변환한다.
   - 2번에서 타입 검사를 했으므로 100% 성공한다.
4. 입력 객체와 자기 자신의 대응되는 '핵심' 필드들이 모두 일치하는지 하나씩 검사한다.

## 11. **`equals` 를 오버라이딩할 떈 `hashCode`도 반드시 오버라이딩하자**

hashCode를 재정의하지 않으면 해당 클래스의 인스턴스를 HashMap이나 HashSet 같은 컬렉션의 원소로 사용할 때 문제를 일으킨다.

- 논리적으로 같은 객체는 같은 해시코드를 반환해야 한다.

Equals()가 두 객체를 다르다고 판단했더라도, 두 객체의 hashcode가 서로 다른 값을 반환할 필요는 없다.

- 다른 값을 반환하면 성능이 좋아진다. *해시 충돌이 적어지기 때문인 듯(추측)*
- **해시 충돌 시 equals로 값 비교하는 듯(추측)*

## 13. `Clone` 재정의는 주의해서 진행하라

Clonable 인터페이스는 Object의 protected 메서드인 clone의 동작 방식을 오버라이딩한다.

Cloneable을 구현한 클래스는 clone메서드를 public으로 제공하며, 사용자는 복제가 제대로 될 거라 기대한다.

- 이 기대를 만족시키면 해당 클래스와 상위 클래스들은 생성자를 호출하지 않고도 객체를 생성 -> 허술하다.

clone 메서드는 사실상 생성자와 같은 효과를 낸다. 즉, **`clone`은 원본 객체에 아무런 해를 끼치지 않는 동시에 복제된 객체의 불변식을 보장해야 한다.**

Cloneable 아키텍처는 '가변 객체를 참조하는 필드는 final로 선언하라'는 일반 용법과 충돌한다.

...

복사 생성자와 복사 팩터리라는 더 나은 객체 복사 방식을 제공할 수 있다.

```java
public Yum(Yum yum) {...}; // 자기 자신과 같은 클래스의 인스턴스를 인수로 받는 생성자
public static Yum newInstance(Yum yum) {...}; // 복사 생성자를 모방한 정적 팩터리
```

정리

- 새로운 인터페이스를 만들 때는 절대 Clonealbe을 확장해서는 안된다
- 새로운 클래스도 이를 구현해서는 안된다
- Final 클래스라면 Cloneable을 구현해도 위험이 크지 않지만
  - 성능 최적화 과정에서 검토한 후 별다른 문제가 없을 때만 드물게 허용해야 한다.
- 기본 원칙 "복제 기능은 생성자와 팩터리를 이용하는 게 최고"
- 단, 베열만은 clone 메서드 방식이 가장 깔끔한, 이 규칙의 합당한 예외

## 14. Comparable을 구현할지 고려하라

Comparable 인터페이스는 `compareTo` 라는 유일한 메서드를 가진다. `compareTo`는 object의 메서드가 아니다.

- Comparable을 구현하면 이 인터페이스를 활용하는 많은 알고리즘과 컬렉션을 사용할 수 있다.
- 알파벳, 숫자, 연대와 같이 순서가 명확한 값 클래스를 작성한다면 반드시 구현하자
- Comparable을 구현하지 않은 필드나 표준이 아닌 순서로 비교해야 한다면 Comparator를 대신 사용한다.

```java
public final class CaseInsensetiveString implements Comparable<CaseInsensitiveString> {
  	public int compareTo(CaseInsensitiveString cis) {
      	return String.CASE_INSENSITIVE_ORDER.compare(s. cis.s);
    }
}
```

기본 타입 필드가 여럿일 때의 비교자

```java
public int compareTo(PhoneNumber pn) {
  	int result = Short.compare(areaCode, pn.areaCode);
  	if (result == 0) {
      	result = Short.compare(prefix, pn.prefix);
      	if (result == 0) {
          	result = Short.compare(linenum, pn.lineNum);
        }
    }
		return result;
}
```

비교자 생성 메서드를 활용한 비교자

```java
static Comparator<Object> hashCodeOrder =
  	Comparator.comparingInt(o -> o.hashCode());
```

- compareTo 메서드에서 필드의 값을 비교할 때 `<`나 `>` 연산자는 쓰지 말아야 한다
  - 대신 박싱된 기본 타입 클래스가 제공하는 정적 compare 메서드나
  - Comparator 인터페이스가 제공하는 비교자 생성 메서드를 사용하자.

# 클래스와 인터페이스


# Reference
[책 *이펙티브 자바*](http://www.yes24.com/Product/Goods/65551284)