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

장점

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

단점

1. 상속을 하려면 public이나 protected 생성자가 필요하니 정적 팩터리 메서드만 제공하면 하위 클래스를 만들 수 없다.
2. 정적 팩터리 메서드는 프로그래머가 찾기 어렵다.
   - 생성자처럼 API에 명확히 드러나지 않는다.
   - 사용자는 정적 팩터리 메서드 방식 클래스를 인스턴스화할 방법을 알아내야 한다.

흔한 명명 방식

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

빌더 패턴

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

단점

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

public static 멤버가 `final` 필드인 방식

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

정적 팩토리 방식의 싱글턴

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

Enum 타입 방식의 싱글턴

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

대안

`AutoCloseable` 을 구현해주고, 클라이언트에서 인스턴스를 다 쓰고 나면 `close`메서드를 호출해준다.

- 일반적으로 `try-with-resources` 구문

그럼 언제 쓰는거냐

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

## 12. `toString`을 항상 재정의하라

toString을 잘 구현한 클래스는 사용하기 편하고, 디버깅하기 쉽다.

상위 클래스에서 적절하게 재정의한 경우, 유틸리티 클래스 등등 몇몇 상황에서는 재정의하지 않아도 된다.

toString은 객체가 가진 주요 정보 모두를 반환하는 게 좋다

toString이 반환한 값에 포함된 정보를 얻어올 수 있는 API를 제공하자



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

## 15. 클래스와 멤버의 접근 권한을 최소화하라

잘 설계된 컴포넌트는 모든 내부 구현을 완벽히 숨겨, 구현과 API를 깔끔히 분리한다.

기본 원칙

- 모든 클래스와 멤버의 접근성을 가능한 한 좁혀야 한다.

클래스

- 공개 API가 아닌 톱레벨 클래스는 package-private
- 패키지의 다른 클래스들이 접근하지 못하게 하려면 클래스 내에 private static으로 중첩

멤버

- 공개 API는 public
- 그 외의 모든 멤버는 private
- 동일 패키지의 다른 클래스가 접근해야 한다면 package-private
  - ex) 단위 테스트
- public 클래스의 protected 멤버는 공개 API이므로 주의하자

> Serializable을 구현한 클래스에서는 해당 필드들도 의도치 않게 공개 API가 될 수 있다.

**public 클래스의 인스턴스 필드는 되도록 public이 아니어야 한다.**

- **public 가변 필드를 갖는 클래스는 일반적으로 스레드 안전하지 않다.**

- 내부 구현을 바꾸고 싶어도 public 필드를 없애는 방식으로는 리팩토링이 불가능

- 예외 ) 클래스가 표현하는 추상 개념을 완성하는 데 필요한 상수라면 public static final

  - 이 객체는 반드시 기본 타입이나 불변 객체를 참조해야 한다.

  - 가변 객체를 참조하면 final이 아닌 필드에 적용되는 불이익이 그대로 적용된다.

    - 길이가 0이 아닌 배열은 모두 가변이다. **클래스에서 public static final 배열 필드를 두거나 이 필드를 반환하는 접근자 메서드를 제공해서는 안된다.**

  - 해결방법

    1. ```java
       private static final Thing[] PRIVATE_VALUES = {...}; //private으로 변경
       public static final List<Thing> VALUES = 
         	Collections.unmodifiableList(Arrays.asList(PRIVATE_VALUES)); // public 불변 리스트 추가
       ```

    2. ```java
       private static final Thing[] PRIVATE_VALUES = {...}; // private으로 변경
       public static final Thing[] values() {
         	return PRIVATE_VALUES.clone(); // 복사본을 반환 (방어적 복사)
       }
       ```

## 16. public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라

public 필드의 단점

- 캡슐화가 안됨
- API 수정 없이 내부 표현을 바꿀 수 없음
- 불변식을 보장할 수 없음
- 외부에서 필드에 접근할 때 부수 작업을 수행할 수 없음

패키지 바깥에서 접근할 수 있는 클래스라면 접근자를 제공하여 여러 이점을 얻게 된다.

package-private 또는 private 중첩 클래스라면 데이터 필드를 노출한다 해도 문제가 없다.

- 패키지 외부 코드를 손대지 않고도 내부 구현 변경이 가능
- private 중첩 클래스는 수정 범위를 중첩 클래스를 포함하는 외부 클래스로 제한

public 필드가 불변이라면?

- 불변식은 보장
- 나머지 단점은 그대로

## 17. 변경 가능성을 최소화하라

불변 클래스란 인스턴스의 내부 값을 수정할 수 없는 클래스다.

- 가변 클래스보다 설계, 구현, 사용이 쉽다
- 오류의 발생을 줄인다.
- **불변 객체는 단순하다**
- **불변 객체는 근본적으로 thread-safe** 하여 따로 동기화할 필요 없다.

불변을 만드는 규칙

- 객체의 상태를 변경하는 메서드(변경자)를 제공하지 않는다.
- 클래스를 확장할 수 없도록 한다.
  - 하위 클래스에서 객체의 상태를 변하게 만드는 것을 막아준다.
  - 클래스의 제한자를 final
  - 생성자를 private, 정적 팩토리 메서드를 public으로 제공 (사실상 final이며 더 유연하다.)
- 모든 필드를 final로 선언한다.
- 모든 필드를 private로 선언한다.
- 자신 외에는 내부의 가변 컴포넌트에 접근할 수 없도록 한다.
  - 가변 필드는 클라이언트가 제공한 객체 참조를 가리키게 해서는 안된다
  - 접근자 메서드가 가변 필드를 그대로 반환하면 안된다.
  - 생성자, 접근자, `readObejct` 메서드 모두에서 방어적 복사를 수행하라

불변 객체는 방어적 복사도 필요 없다.

- clone 메서드나 복사 생성자를 제공하지 않는 게 좋다

불변 객체는 내부 데이터를 공유할 수 있다.

- BigInteger 클래스의 negate 메서드는 크기가 같고 부호만 반대인 새로운 BigInteger를 생성한다
  - 크기 배열을 복사하지 않고 원본 인스턴스가 가르키는 내부 배열을 그대로 사용한다.

객체를 만들 때 다른 불변 객체들을 구성요소로 사용하면 이점이 많다.

- 불변식을 유지하기 쉽다.

불변 객체는 그 자체로 실패 원자성을 제공한다.

- 실패 원자성 : 메서드에서 예외가 발생해도 객체는 여전히 유효한 상태
- 불일치 상태에 빠질 가능성이 없다.

단점

- 값이 다르면 반드시 독립된 객체로 만들어야 한다.
  - 값의 가짓수가 많다면, 비용이 커진다.
  - 성능을 완화해줄 가변 동반 클래스를 제공하는 방법이 있다.(String, StringBuilder)

정리

> 클래스는 꼭 필요한 경우가 아니라면 불변이어야 한다
>
> 불변으로 만들 수 없는 클래스라도 변경할 수 있는 부분을 최소한으로 줄이자
>
> 합당한 이유가 없다면 모든 필드는 private final이어야 한다.
>
> 생성자는 불변식 설정이 모두 완료된, 초기화가 완벽히 끝난 상태의 객체를 생성해야 한다.

## 18. 상속보다는 컴포지션을 사용하라

다른 패키지의 구체 클래스를 상속하는 일은 위험하다.

상속은 캡슐화를 깨뜨린다.

- 상위 클래스의 구현에 따라 하위 클래스의 동작에 이상이 생길 수 있다.
- 오버라이딩하거나 하위 클래스에서 만든 메서드는 상위 클래스의 메서드가 요구하는 규약을 만족하지 못할 수 있다.

컴포지션을 사용해 해결하자

- 새 클래스를 만들고 private 필드로 기존 클래스의 인스턴스를 참조
- 기존 클래스의 내부 구현 방식에 영향을 받지 않음
- 재사용할 수 있는 forwarding 클래스가 있다면, 래퍼 클래스를 손쉽게 구현할 수 있다.

상속은 반드시 하위 클래스가 상위 클래스의 '진짜' 하위 타입인 상황에서만 쓰여야 한다.

- 하위 is a 상위
- 상위 클래스가 확장을 고려해 설계되지 않았다면 여전히 위험

## 19. 상속을 고려해 설계, 문서화하라. 그렇지 않으면 상속을 금지하라

하위 클래스를 어려움 없이 만들게 하려면

- 오버라이딩 할 수 있는 메서드들을 내부적으로 어떻게 이용하는지(자기사용) 문서로 남겨야 한다.
- 내부 동작 과정 중간에 끼어들 수 있는 hook을 선별하여 protected메서드 형태로 공개해야 할 수도 있다.
- 생성자는 직접 / 간접적으로 오버라이딩 가능 메서드를 호출해서는 안된다.
  - 하위 클래스에서 오버라이딩한 메서드가 상위 클래스의 생성자에서 호출되어 하위 클래스의 생성자보다 먼저 호출된다.

상속용 클래스를 테스트하는 방법은 직접 하위 클래스를 만들어보는 것이 '유일'

Cloneable과 Serializable 인터페이스를 구현한 클래스를 상속할 수 있게 설계하는 것은 일반적으로 좋지 않다.

- clone과 readObject 모두 직/간접적으로 오버라이딩 가능 메서드를 호출해서는 안된다.
  - readObject : 하위 클래스가 다 역직렬화되기 전에 오버라이딩한 메서드를 호출한다.
  - Clone : 생성자에서의 문제와 동일

**상속용으로 설계하지 않은 클래스는 상속을 금지하자**

- final 선언하거나, 생성자를 private제한 + 정적 팩토리 메서드를 제공하는 방법

## 20. 추상 클래스보다는 인터페이스를 우선하라

자바8부터 인터페이스도 디폴트 메서드 / static메서드를 구현할 수 있다.

자바는 단일 상속만 지원한다. 따라서 추상 클래스 방식은 제약이 있다.

기존 클래스에도 손쉽게 새로운 인터페이스를 구현해넣을 수 있다.

인터페이스는 mixin 정의에 적합하다

- 믹스인 : 클래스가 구현할 수 있는 타입. Comparable은 자신을 구현한 클래스의 인스턴스끼리는 순서를 정할 수 있다고 선언한다.

인터페이스는 계층구조가 없는 타입 프레임워크를 만들 수 있다.

- 계층을 구분하기 어려운 개념을 표현할 수 있다.

인터페이스의 메서드 중 구현 방법이 명백한 것이 있다면, 구현을 디폴트 메서드로 제공할 수 있다.

- `equals`, `hashCode` 같은 Object 메서드들은 디폴트 메서드로 제공하면 안된다.

추상 골격 구현 클래스를 제공하는 방법

- 인터페이스와 추상 클래스의 장점을 모두 취한다.
- 인터페이스로는 타입과 디폴트 메서드 정의, 골격 구현 클래스는 나머지 메서드들을 구현한다.
- 템플릿 메서드 패턴

- ```java
  static List<Integer> intArrayAsList(int[] a) {
    	Objects.requireNonNull(a);
    
    	return new AbtractList<Integer>() {
        	@Override public Integer get(int i) {
            	return a[i]; // 오토박싱
          }
        
        	@Override public Integer set(int i, Integer val) {
            	int oldVal = a[i];
            	a[i] = val; // 언박싱
            	return oldVal; // 오토박싱
          }
        
          @Ovveride public int size() {
            	return a.length;
          }
      }
  }
  ```

단순 구현

- 골격 구현의 변종
- 상속을 위해 인터페이스를 구현한 가장 단순한 구현(추상 클래스 X)
- ex) AbstactMap.SimpleEntry

## 21. 인터페이스는 구현하는 쪽을 생각해 설계하라

자바 8에서 핵심 컬렉션 인터페이스들에 다수의 디폴트 메서드가 추가되었다.

- 람다를 활용하기 위함

디폴트 메서드는 (컴파일 성공했더라도) 기존 구현체에 런타임 오류를 일으킬 수 있다.

인터페이슬을 설계할 때는 세심한 주의를 기울이자.

## 22. 인터페이스는 타입을 정의하는 용도로만 사용하라

클래스가 인터페이스를 구현한다는 것은 자신의 인스턴스로 무엇을 할 수 있는지를 클라이언트에게 알려주는 것이다.

- 인터페이스는 오직 이 용도로 사용해야 한다.

**상수 안티패턴 인터페이스는 인터페이스를 잘못 사용한 예다**

- 상수를 뜻하는 static final 필드로만 가득 찬 인터페이스
- 내부 구현(상수)를 클래스의 API로 노출하는 행위
- 대안
  - 특정 클래스나 인터페이스 자체에 추가
  - Enum
  - 유틸리티 클래스(인스턴스화 불가능)에 담아 제공

## 23. 태그 달린 클래스보다는 클래스 계층구조를 활용하라

두 가지 이상의 의미를 표현하고, 현재 표현값을 태그로 알려주는 클래스

단점

- 쓸데없는 코드가 많아진다. Swich문 등등
- 메모리 사용량이 많아진다
- 필드를 final로 선언하려면 해당 의미에 불필요한 필드도 초기화해야 한다.
- 오류를 내기 쉽다. 

클래스 계층구조를 적용하자

## 24. 멤버 클래스는 되도록 static으로 만들자

내포 클래스(nested class) : 다른 클래스 내에 정의된 클래스

- 자신을 감싼 바깥 클래스에서만 쓰여야 한다.

종류

- 정적 멤버 클래스
- 비정적 멤버 클래스
- 익명 클래스
- 지역 클래스

정적 멤버 클래스

- 바깥 클래스의 private 멤버에 접근 가능
- 다른 정적 멤버와 동일한 접근 규칙
- 바깥 클래스와 함께 쓰이는 public 도우미 클래스로 쓰임

비정적 멤버 클래스

- 바깥 클래스의 인스턴스와 암묵적으로 연결
  - `바깥클래스명.this` 를 이용해 바깥 인스턴스의 참조를 가져올 수 있다.
- 어댑터를 정의할 때 자주 쓰인다
  - 클래스의 인스턴스를 감싸 다른 클래스의 인스턴스처럼 보이게 하는 뷰로 사용

**멤버 클래스에서 바깥 인스턴스에 접근할 일이 없다면 반드시 정적 멤버 클래스로**

- 바깥 인스턴스로의 외부 참조를 갖게 된다.
- 가비지 컬렉션이 되지 않아 메모리 누수 발생 가능

익명 클래스

- 바깥 클래스의 멤버가 아니다
- 쓰이는 시점에 선언과 동시에 인스턴스가 생성된다
- 대부분 람다로 대체됨

지역 클래스

- 익명 클래스로 사용하기에 적합한 타입의 클래스나 인터페이스가 없다면 사용한다.

## 25. 톱레벨 클래스는 한 파일에 하나만

파일 하나에 여러 클래스를 선언하면

- 한 클래스를 여러 가지로 정의 가능해서, 어떤 것을 사용할지 알 수 없다(먼저 컴파일되는 소스를 사용)

# 제네릭

## 26. 로 타입은 사용하지 마라

클래스와 인터페이스 선언에 타입 매개변수가 쓰이면, 제네릭 클래스 혹은 제네릭 인터페이스 라 한다 둘을 통틀어 제네릭 타입이라 한다.

로 타입이란 제네릭 타입에서 타입 매개변수를 사용하지 않은 것

- 런타입에 에러가 날 가능성이 높다
- 제네릭의 안전성과 표현력을 모두 잃게 된다.

`List` vs `List<Object>`

- `List<Object>`는 모든 타입을 허용한다는 의미를 컴파일러에게 명확히 전달한다.

실제 타입 매개변수가 무엇인지 신경쓰고 싶지 않다면?

- 비한정적 와일드카드 타입 `<?>`
- 와일드카드 타입 `Collection<?>`에는 null외에는 어떤 원소도 넣을 수 없다.
  - 불변식 유지

예외

- class 리터럴에는 로 타입을 써야 한다

  - ex) `List.class`, `String[].class` 은 되고 `List<String>.class`, `List<?>.class`는 불가능하다

- `instanceof` 연산자를 사용할 때는 로 타입을 쓴다

  - 런타임에는 제네릭 타입 정보가 지워지기 때문
  - 비한정적 와일드카드 타입과 로 타입은 `instanceof` 연산자에 똑같이 동작한다.

  ```java
  if (o instanceof Set) {
    	Set<?> s = (Set<?>) o;
  	  ...
  }
  ```

## 27. 비검사 경고를 제거하라

비검사 경고는 런타임에 `ClassCastException` 을 일으킬 수 있는 잠재정 가능성을 뜻하니 최대한 제거하자

방법이 없다면?

- `@SuppressWarnings("unchecked")` 애너테이션으로 숨긴다
- 가능한 최대한 좁은 범위에서
- 경고를 숨긴 근거를 주석으로 남기자

## 28. 배열보다는 리스트를 사용하라

1. 배열은 공변이다 : `하위타입[]` 는 `상위타입[]` 의 하위 타입이 된다

   ```java
   // 런타임에 실패
   Obejct[] objectArray = new Long[1];
   objectArray[0] = "타입이 다르다"; // ArrayStoreException
   ```

2. `List<하위타입>` 과 `List<상위타입>` 는 서로 하위/상위 타입이 아니다.

   ```java
   // 컴파일타임에 실패
   List<Object> ol = new ArrayList<Long>(); // 호환되지 않는 타입. 컴파일 에러
   ol.add("타입이 다르다");
   ```

배열은 런타임에는 타입 안전하지만 컴파일타임에는 그렇지 않다.

제네릭은 런타임에는 타입 안전하지 않으나(타입 소거), 컴파일타임에는 타입 안전하다

따라서 둘을 섞어 쓰긴 힘들다. 런타임에 예외를 발생시키지 않는 리스트를 사용하자

## 29. 이왕이면 제네릭 타입으로 만들자

제네릭 타입으로 만틀면

- 클라이언트에서 형변환할 필요가 없다
  - 더 안전하고 쓰기 편하다

## 30. 이왕이면 제네릭 메서드로 만들자

제네릭 메서드를 사용하면

- 클라이언트에서 입력 매개변수와 반환값을 형변환할 필요가 없다.

타입 매개변수 목록은 메서드의 제한자와 반환 타입 사이에 온다

```java
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
  	Set<E> result = new HashSet<>(s1);
  	result.addAll(s2);
  	return result;
}
```

자기 자신이 들어간 표현식을 사용하여 타입 매개변수의 허용 범위를 한정할 수 있다.

```java
public static <E extends Comparable<E>> E max(Collection<E> c);
// 모든 타입 E는 자신과 비교할 수 있다. == 상호 비교 가능하다
```

## 31. 한정적 와일드카드를 사용해 API 유연성을 높이자

매개변수화 타입은 불공변이다.

- `List<T1>` 과` List<T2>` 의 T1, T2는 서로 하위 타입, 상위 타입이 아니다.

```java
public void pushAll(Iterable<? extends E> src) { // producer : src
  	for (E e : src)
      	push(e);
}

public void popAll(Collection<? super E> dst) { // consumer : dst
  	while (!isEmpty())
      	dst.add(pop());
}
```

유연성을 높이려면 원소의 생산자나 소비자용 입력 매개변수에 와일드카드 타입을 사용하자

입력 매개변수가 생산자, 소비자 역할을 동시에 한다면 와일드카드 타입을 사용하지 말자

> PECS : producer-extends, consumer-super

클래스 사용자가 와일드카드 타입을 신경써야 한다면 API에 문제가 있을 가능성이 크다

Comparable / Comparator는 언제나 소비자

- 일반적으로 `Comparable<E>` 보다는 `Comparable<? super E>` 를 사용하는 것이 낫다.

## 32. 제네릭과 가변인수를 함께 쓸 떄는 신중하자

가변인수 메서드를 호출하면 가변인수를 담기 위한 배열이 자동으로 만들어진다.

가변인수는 배열을 노출하여 추상화가 완벽하지 못하다.

- 가변인수 매개변수에 제네릭이나 매개변수화 타입이 포함되면 컴파일 경고가 발생
  - 힙 오염 : 매개변수화 타입의 변수가 타입이 다른 객체를 참조

```java
static void dangerous(List<String>... stringLists) {
  	List<Integer> intList = List.of(42);
  	Objects[] objects = stringLists;
  	objects[0] = intList; // 힙 오염
  	String s = stringLists[0].get(0); // ClassCastException, 타입 안정성이 깨진다.
}
```

제네릭 varargs 배열 매개변수에 값을 저장하는 것은 안전하지 않다.

제네릭이나 매개변수화 타입의 가변인수를 받는 메서드는 유용해서 컴파일 경고만 낸다.

- `@SafeVarargs` 애너테이션은 메서드 작성자가 그 메서드가 타입 안전함을 보장하는 장치다
- 메서드가 안전한지 점검
  - 가변인수 배열에 아무것도 저장하지 않는다
  - 그 배열을 신뢰할 수 없는 코드에 노출하지 않는다.
    - 가변인수 배열에 다른 메서드가 접근하도록 허용하면 안전하지 않다.

## 33. 타입 안전 이종 컨테이너를 고려하자

type safe heterogeneous container pattern

- 컨테이너 대신 키를 매개변수화한 다음, 컨테이너에 값을 넣거나 뺄 때 매개변수화한 키를 함께 제공

```java
public class Favorites {
  	private Map<Class<?>, Object> favorites = new HashMap<>();
  	
  	public <T> void putFavorite(Class<T> type, T instance) {
      	favorites.put(Object.requireNonNull(type), instance);
    }
  
  	public <T> getFavorite(Class<T> type) {
      	return type.cast(favorite.get(type));
    }
}
```

- `class` 리터럴의 타입은 `Class` 가 아닌 `Class<T>` 다.

일반적인 제네릭 형태에서는 한 컨테이너가 다룰 수 있는 타입 매개변수의 수가 고정되어 있다.

- 컨테이너 자체가 아닌 키를 타입 매개변수로 바꾸면 이런 제약이 없는 컨테이너를 만들 수 있다.

# Enum과 Annotation

## 34. `int` 상수 대신 열거 타입을 사용하라

자바의 열거 타입은 완전한 형태의 클래스

- 상수 하나당 자신의 인스턴스를 하나씩 만들어 public static final 필드로 공개한다
- 생성자를 제공하지 않으므로 사실상 final
- 싱글턴을 일반화한 형태로 볼 수 있다.
- 임의의 필드나 메서드를 추가할 수 있다

열거 타입 상수 각각을 특정 데이터와 연결지으려면 생성자에서 데이터를 받아 인스턴스 필드에 저장하면 된다.

하나의 메서드가 상수별로 다르게 동작해야 할 때

- switch문 대신 상수별 메서드 구현을 사용하자

```java
public enum Operation {
  	PLUS("+") {
      	public double apply(double x, double y) { return x + y; }
    }
  	MINUS("-") {
      	public double apply(double x, double y) { return x - y; }
    }
  
 		private final String symbol;
  
  	Operation(String symbol) {
      	this.symbol = symbol;
    }
  
  	public abstract double apply(double x, double y);
}
```



필요한 원소를 컴파일타임에 다 알 수 있는 상수 집합이라면 항상 열거 타입을 사용하자

열거 타입에 정의된 상수 개수가 영원히 고정 불변일 필요는 없다.

- 나중에 상수가 추가되도 바이너리 수준에서 호환된다.

## 35. `ordinal` 메서드 대신 인스턴스 필드를 사용하라

`ordinal()` 메서드는 해당 상수가 열거 타입에서 몇 번째 위치인지를 반환한다.

- ordinal을 상수와 연관된 정수값으로 사용하면 유지보수가 힘들어진다.

열거 타입 상수에 연결된 값은 ordinal 메서드로 얻지 말고, 인스턴스 필드에 저장하자.

## 36. 비트 필드 대신 EnumSet을 사용하라

이전에는 열거 값들이 집합으로 사용될 경우 비트 필드로 상수를 사용해왔다.

```java
public class Text {
  	public static final int STYLE_BOLD = 1 << 0;
  	public static final int STYLE_ITALIC = 1 << 1;
	  public static final int STYLE_UNDERLINE = 1 << 2;
  	
  	public void applyStyles(int styles) { ... }
  	// 매개변수 styles는 0개 이상의 STYLE_ 상수를 비트별 OR한 값
}
```

- 해석하기 어렵다
- 비트 필드에 존재하는 모든 원소를 순회하기 까다롭다
- 최대 몇 비트가 필요한지를 미리 예측하여 적절한 타입(int, long)을 선택해야 한다.

EnumSet

- Set 인터페이스를 구현
- type - safe
- 다른 Set 구현체와도 함꼐 사용 가능
- 내부적으로 비트 벡터로 구현됨

```java
public class Text {
  	public enum style { BOLD, ITALIC, UNDERLINE }
  	
  	public void applyStyles(Set<Style> styles) { ... }
}
text.applyStyles(EnumSet.of(Style.BOLD, Style.ITALIC));
```

## 37. `ordinal` 인덱싱 대신 `EnumMap`을 사용하라

EnumMap

- 열거 타입을 키로 사용하도록 설계한 빠른 Map 구현체
- 배열 인덱스를 계산하는 과정에서 오류가 날 가능성이 없다
- 안전한 형변환
- 내부적으로 배열을 사용해 우수한 성능

```java
Map<Plant.LifeCycle, Set<Plant>> plantsByLifeCycle = new EnumMap<>(Plant.LifeCycle.class);

for (Plant.LifeCycle lc : Plant.LifeCycle.values())
  	plantsByLifeCycle.put(lc, new HashSet<>());

for (Plant p : garden)
  	plantsByLifeCycle.get(p.lifeCycle).add(p);
```

## 38. 확장할 수 있는 열거 타입이 필요하면 인터페이스를 사용하라

일반적으로 열거 타입을 확장하는 것은 좋지 않다.

그럼에도 해야 하는 상황이라면 인터페이스를 정의하고 열거 타입이 인터페이스를 구현하게 하면 된다.

```java
public interface Operation {
  	double apply(double x, double y);
}

public enum BasicOperation implements Operation {
  	PLUS("+") {
      	public double apply(double x, double y) { return x + y; }
    }
  	MINUS("-") {
      	public double apply(double x, double y) { return x - y; }
    }
}

// 확장 가능 열거 타입
public enum ExtendedOperation implements Operation {
  	EXP("^") {
      	public double apply(double x, double y) {
	          return Math.pow(x, y);
        }
    }
}
```

열거 타입끼리 구현을 상속할 수는 없다.

## 39. 명명 패턴보다 애너테이션을 사용하라

애너테이션으로 할 수 있는 일을 명명 패턴으로 처리할 이유는 없다.

## 40. `@Override` 애너테이션을 일관되게 사용하라

여러 가지 악명 높은 버그들을 예방해준다.

오버라이딩의 의도를 명확히 해서 컴파일 타임에 에러를 잡아준다.

## 41. 정의하려는 것이 타입이라면 마커 인터페이스를 사용하라

마커 인터페이스 : 아무 메서드도 없고, 자신을 구현하는 클래스가 특정 속성을 가짐을 표시해주는 인터페이스

- Serializable : 구현한 클래스의 인스턴스는 `ObjectOutputStream`을 통해 write할 수 있다.

마커 인터페이스 vs 마커 애너테이션

- 마커 인터페이스는 이를 구현한 클래스의 인스턴스들을 구분하는 타입으로 쓸 수 있으나, 마커 애너테이션은 그렇지 않다.
- 마커 인터페이스는 적용 대상을 더 정밀하게 지정할 수 있다.
  - 특정 클래스 또는 인터페이스의 하위 타입에만 적용할 수 있다. ex) Set 인터페이스
- 마커 애너테이션은 거대한 애너테이션 시스템의 지원을 받을 수 있다.
  - 애너테이션을 적극 활용하는 프레임웤에서는 애너테이션이 일관성을 지니는 데 유리하다

클래스와 인터페이스 외의 프로그램 요소(모듈, 패키지, 필드, 지역변수 등)에 마킹해야 할 때 애너테이션을 쓸 수 밖에 없다.

"마킹이 된 객체를 매개변수로 받는 메서드를 작성할 일이 있다" 면 마커 인터페이스

# 람다와 스트림

## 42. 익명 클래스보다는 람다를 사용하라

함수형 인터페이스의 구현에서는 익명 클래스보다 람다가 간결하다.

메서드나 클래스와 달리 람다는 이름이 없고 문서화도 못 한다.

- 코드 자체로 동작이 명확히 설명되지 않거나 코드 줄 수가 많아지면 람다를 쓰지 말아야 한다.

람다는 함수형 인터페이스에서만 쓰인다.

- 추상 클래스, 추상 메서드가 여러개인 인터페이스에서는 익명 클래스를 써야 한다.

람다는 자신을 참조할 수 없다

- 람다에서 `this` 는 바깥 인스턴스를 가리킨다. 
- 익명 클래스의 `this` 는 익명 클래스 자신의 인스턴스
- 함수 객체가 자신을 참조해야 한다면 익명 클래스를 써야 한다.

람다를 직렬화하는 일은 극히 삼가자

- 익명 클래스와 같이 직렬화 형태가 구현별(ex. Jvm)로 다를 수 있다.
- 직렬화해야 하는 함수 객체가 있다면
  - private static nested class의 인스턴스를 사용하자.

## 43. 람다보다는 메서드 참조를 고려하라

메서드 참조가 람다보다 짧고 명확하다면 메서드 참조를 쓰고, 그렇지 않을 때만 람다를 사용하라

| 메서드 참조 유형    | 예                       | 같은 기능을 하는 람다                                      |
| ------------------- | ------------------------ | ---------------------------------------------------------- |
| 정적                | `Integer::parseInt`      | `str -> Integer.parseInt(str)`                             |
| 한정적 (인스턴스)   | `Instant.now()::isAfter` | `Instant then = Instant.now()`<br />`t -> then.isAfter(t)` |
| 비한정적 (인스턴스) | `String::toLowerCase`    | `str -> str.toLowerCase()`                                 |
| 클래스 생성자       | `TreeMap<K, V>::new`     | `() -> new TreeMap<K, V>()`                                |
| 배열 생성자         | `int[]::new`             | `len -> new int[len]`                                      |

## 44. 표준 함수형 인터페이스를 사용하라

필요한 용도에 맞는 게 있다면, 직접 구현하지 말고 표준 함수형 인터페이스를 활용하라

- 유용한 디폴트 메서드를 제공하므로 다른 코드와의 상호운용성이 좋아진다.

| 인터페이스          | 함수 시그니처         | 예                    |
| ------------------- | --------------------- | --------------------- |
| `UnaryOperator<T>`  | `T apply(T t)`        | `String::toLowerCase` |
| `BinaryOperator<T>` | `T apply(T t1, T t2)` | `BigInteger::add`     |
| `Predicate<T>`      | `boolean test(T t)`   | `Collection::isEmpty` |
| `Function<T, R>`    | `R apply(T t)`        | `Arrays::asList`      |
| `Supplier<T>`       | `T get()`             | `Instant::now`        |
| `Consumer<T>`       | `void accept(T t)`    | `System.out::println` |

이외에도 기본 타입을 매개변수로 제공하거나 반환하는 변형 인터페이스, 인수를 2개씩 받는 인터페이스 등이 있다.

- 기본 타입을 매개변수로 받는 인터페이스에 박싱된 타입을 넣지 말자. 

함수형 인터페이스의 직접 구현을 고려하는 상황

1. 자주 쓰이며, 이름 자체가 용도를 명확히 설명해준다.
2. 반드시 따라야 하는 규약이 있다
3. 유용한 디폴트 메서드를 제공할 수 있다.

직접 만든 함수형 인터페이스에는 항상 `@FunctionalInterface` 애너테이션을 사용하라

- 람다용을 설계된 것임을 명시한다
- 추상 메서드를 하나만 갖고 있어야 컴파일되게 해준다

## 45. 스트림은 주의해서 사용하라

지연 평가

- 종단 연산에 쓰이지 않는 데이터 원소는 계산에 쓰이지 않는다. 

스트림을 남용하면 프로그램이 읽거나 유지보수하기 어려워진다.

기존 코드는 스트림을 사용하도록 리팩토링하되, 새 코드가 더 나아 보일 때만 반영하자

## 46. 스트림에서는 부작용 없는 함수를 사용하라

스트림의 핵심은 계산을 일련의 변환으로 재구성하는 것

- 각 변환 단계는 가능한 이전 단계의 결과를 받아 처리하는 순수 함수여야 한다
  - 순수 함수 : 오직 입력만이 결과에 영향을 주는 함수

`forEach` 연산은 스트림 계산 결과를 보고할 때만 사용하고 계산하는 데는 쓰지 말자

- 종단 연산 중 기능이 가장 적고 병렬화할 수도 없다.

대신 스트림을 올바르게 사용하려면 Collector를 잘 알야둬야 한다.

- `toList`, `toSet`, `toMap`, `groupingBy`, `joining` 등

## 47. 반환 타입으로는 스트림보다 컬렉션이 낫다

메서드의 반환 타입으로 기본적으로는 컬렉션 인터페이스를 쓴다,

- for-each문에서만 쓰이거나 반환된 원소 시퀀스가 일부 Collection 메서드를 구현할 수 없을 때는 Iterable 인터페이스를 쓴다.

스트림을 반환하면 클라이언트는 for-each문으로 반복할 수 없다.

공개 API를 작성할 때는 스트림 파이프라인을 사용하는 살마과 반복문에서 쓰려는 사람 모두를 배려해야 한다.

원소 시퀀스를 반환하는 공개 API의 반환 타입에는 Collection이나 그 하위 타입을 쓰는 게 일반적으로 최선이다.

- Collection 인터페앗는 Iterable의 하위 타입이고, `stream` 메서드도 제공한다.
- **하지만, 단지 컬렉션을 반환한다는 이유로 덩치 큰 시퀀스를 메모리에 올려서는 안된다.**

컬렉션을 반환하는 게 불가능하면 스트림과 Iterable 중 더 자연스러운 것을 반환하라

## 48. 스트림 병렬화는 주의해서 적용하라

동시성 프로그래밍을 할 떄는 안전성(safety)과 응답 가능(liveness) 상태를 유지해야 한다.

**데이터 소스가 `Stream.iterate`거나 중간 연산으로 `limit`을 쓰면 파이브라인 병렬화로는 성능 개선을 기대할 수 없다.**

대체로 스트림의 소스가 ArrayList, HashMap, HashSet, ConcurrentHashMap의 인스턴스거나 배열, int 범위, long의 범위일 떄 병렬화의 효과가 가장 좋다.

- 데이터를 원하는 크기로 정확하고 손쉽게 나눌 수 있다.
- 참조 지역성이 뛰어나 효율이 좋다.

스트림을 잘못 병렬화하면 (응답 불가를 포함) 성능이 나빠질 뿐만 아니라 결과 자체가 잘못되거나 예상 못한 동작이 발생할 수 있다.

스트림 안의 원소 수와 원소당 수행되는 코드 줄 수의 곱이 최소 수십만은 되어야 성능 향상을 맛볼 수 있다.

# 메서드

## 49. 매개변수가 유효한지 검사하라

메서드와 생성자 대부분은 입력 매개변수의 값이 특정 조건을 만족하기를 바란다

- ex) 인덱스 값은 음수이면 안 되며, 객체 참조는 null이 아니어야 한다
- 이러한 제약은 메서드 몸체가 시작되기 전에 검사해야 한다.

public, protected 메서드는 매개변수 값이 잘못됐을 때 던지는 예외를 문서화해야 한다.

- `@throws` 자바독 태그

java.util.Objects.requireNonNull 메서드는 유연하고 사용하기 편해서 null 검사를 수동으로 하지 않아도 된다.

```java
this.strategy = Objects.requireNonNull(strategy, "strategy must be not null")
```

public이 아닌 메서드라면 `assert` 를 사용해 매개변수 유효성을 검증할 수 있다.

```java
private static void sort(long a[], int offset, int length) {
  	assert a != null;
  	assert offset >= 0 && offset <= a.length;
	  ...
}
```

- 실패하면 `AssertionError` 를 던진다
- 런타임에 아무런 효과도, 성능 저하도 없다.

> 메서드는 최대한 범용적으로 설계해야 한다. 메서드가 건네받은 값으로 제대로 된 일을 할 수 있다면 매개변수 제약은 적을수록 좋다.



## 50. 적시에 방어적 복사본을 만들라

클라이언트가 여러분의 불변식을 깨뜨리려 한다 가정하고 방어적으로 프로그래밍해야 한다

`Date` 와 같은 가변 타입 멤버를 가지면 클래스의 불변식을 깨뜨릴 수 있다.

- 생성자에서 받은 가변 매개변수 각각을 방어적으로 복사해야 한다
- 가변 필드의 접근자는 방어적 복사본을 반환해야 한다.

매개변수의 유효성을 검사하기 전에 방어적 복사본을 만들고, 이 복사본으로 유효성을 검사한다

- 멀티스레딩 환경이라면 원본 객체의 유효성 검사 후 복사본을 만드는 찰나의 순간 다른 스레드가 원본 객체를 수정할 수 있기 떄문

```java
public Period(Date start, Date end) {
  	this.start = new Date(start.getTime());
  	this.end = new Date(end.getTime());
  
  	if (this.start.compareTo(this.end) > 0)
      	throw new IllegalArgumentException();
}

public Date start() {
  	return new Date(this.start.getTime());
}
```

매개변수가 제3자에 의해 확장될 수 있는 타입이라면 방어적 복사본을 만들 때 `clone` 을 사용해서는 안된다.

- 하위 클래스에서 정의한 메서드일수도 있다

복사 비용이 너무 크거나 클라이언트가 그 요소를 잘못 수정할 일이 없음을 신뢰한다면 방어적 복사를 수행하는 대신 해당 구성요소를 수정했을 때의 책임이 클라이언트에 있음을 명시하자.

## 51. 메서드 시그니처를 신중히 설계하라

1. 메서드 이름을 신중히 짓자

   이해할 수 있고, 같은 패키지에 속한 다른 이름들과 일관되게

2. 헬퍼 메서드를 너무 많이 만들지 말자

3. 매개변수 목록은 짧게 하자

   같은 타입의 매개변수 여러개가 연달아 나오는 경우가 특히 해롭다

   매개변수 줄이는 방법

   1. 여러 메서드로 쪼갠다.
   2. 매개변수 여러 개를 묶어주는 헬퍼 클래스를 만든다
   3. 빌더 패턴을 메서드 호출에 응용한다. 매개변수를 하나로 추상화한 객체를 정의해 빌더 패턴으로 구현한다.

매개변수의 타입으로는 클래스보다는 인터페이스가 낫다.

- 인터페이스의 하위 타입 매개변수를 넘길 수 있다.

`boolean`보다는 원소 2개짜리 열거 타입이 낫다

- 메서드 이름상 boolean이 의미가 더 명확할 때는 예외

- 코드를 읽고 쓰기 쉽다. 나중에 선택지를 추가하기 쉽다.

- ```java
  public enum TemperatureScale { FAHRENHEIT, CELSUIUS }
  ```

## 52. 오버로딩은 신중히 사용하라

오버로딩 메서드 중 어느 메서드를 호출할지는 컴파일타임에 정해진다.

반면, 오버라이딩한 메서드는 동적으로 선택된다.

```java
public class CollectionClassifier {
  	public static String classify(Set<?> s) {
      	return "집합";
    }
  	
  	public static String classify(Collection<?> c) {
      	return "그 외";
    }
  
  	public static void main(String[] args) {
      	Collection<?>[] collections = { new Hashset<String>(), new ArrayList<String>() };
      
      	for (Collection<?> c : collections)
          	System.out.println(classify(c)); // "그 외  그 외" 컴파일타임에 메서드 결정
    }
}

class Wine {
  	String name() { return "와인"; }
}

class SparklingWine extends Wine {
  @Override String name() { return "스파클링와인"; }
}

public class Overriding {
  	public static void main(String[] args) {
      	List<Wine> wineList = List.of(new Wine(), new SparklingWine());
      
      	for (Wine wine : wineList) {
          	System.out.println(wine.name()); // "와인 스파클링와인" 가장 하위에서 정의한 메서드 호출
        }
    }
}
```

오버로딩이 혼동을 일으키는 상황을 피해야 한다.

- 안전하고 보수적인 방법 : 매개변수 수가 같은 오버로딩은 하지 말자
- 가변인수(varargs)를 사용하는 메서드는 절대 하면 안됨
- 오버로딩 대신 메서드 이름을 다르게 지어주자.

매개변수 수가 같은 오버로딩을 해야만 하는 경우. ex) 생성자

- 헷갈릴 만한 매개변수는 형변환하여 정확한 오버로딩 메서드가 선택되도록 해야 한다.
- 이것도 불가능하다면, 같은 객체를 입력받는 오버로딩 메서드들이 모두 동일하게 동작하도록 만들어야 한다.

## 53. 가변인수는 신중히 사용하라

필수 매개변수는 가변인수 앞에 두자

```java
static int min(int firstArg, int... remainingArgs) { // 하나 이상의 매개변수를 받아야 함
  	int min = firstArg;
  	for (int arg : remainingArgs)
      	if (arg < min)
          	min = arg;
    return min;
}
```

성능에 민감한 상황이라면 가변인수가 걸림돌이 될 수 있다.

- 가변인수 메서드는 호출될 때마다 배열을 새로 하나 할당하고 초기화한다

## 54. `null`이 아닌, 빈 컬렉션이나 배열을 반환하라

`null`을 반환하는 API는 사용하기 어렵고 오류 처리 코드도 늘어난다.

```java
private final List<Cheese> cheesesinStock = ...;

// 올바른 방법
public List<Cheese> getCheeses() {
  	return new ArrayList<>(cheesesInStock);
}

// 빈 배열을 매번 새로 할당하지 않는 방법
public List<Cheese> getCheeses() {
  	return cheesesInStock.isEmpty() ? Collections.emptyList() // 빈 불변 컬렉션 반환
     	 	: new ArrayList<>(cheesesInStock);
}
```

배열을 반환할 때도 마찬가지.

## 55. Optional 반환은 신중히 하자

옵셔널은 원소를 최대 1개 가질 수 있는 불변 컬렉션이다.

보통은 T를 반환해야 하지만 특정 조건에서는 아무것도 반환하지 않아야 할 때 T 대신 `Optional<T>` 를 반환하도록 선언한다

- 예외를 던지는 메서드보다 유연하고 사용하기 쉬우며, null을 반환하는 메서드보다 오류 가능성이 적다

**옵셔널을 반환하는 메서드에서는 절대 `null` 을 반환하지 말자**

**옵셔널은 검사 예외와 취지가 비슷하다.**

- 반환값이 없을 수도 있음을 API 사용자에게 명확히 알려준다.
- 클라이언트는 값을 받지 못했을 때 취할 행동을 선택해야 한다.

컬렉션, 스트림, 배열, 옵셔널 같은 컨테이너 타입은 옵셔널로 감싸지 말자

- 빈 컨테이너를 반환하자. 옵셔널 처리 코드를 넣지 않아도 된다.

반환 타입을 `Optional<T>`로 해야 하는 경우

- **결과가 없을 수 있으며, 클라이언트가 이 상황을 특별하게 처리해야 할 때**

박싱된 기본 타입을 담은 옵셔널을 반환하지 말자

- 무거워서 성능이 낮아진다. int, long, double 전용 옵셔널이 존재한다. `OptionalInt`...

옵셔널을 컬렉션의 키, 값, 원소나 배열의 원소로 사용하는 게 적절한 상황은 거의 없다.

## 56. 공개된 API 요소에는 항상 문서화 주석을 작성하라

API를 올바로 문서화하려면 공개된 모든 클래스, 인터페이스, 메서드, 필드 선언에 문서화 주석을 달아야 한다.

메서드용 문서화 주석에는 해당 메서드와 클라이언트 사이의 규약을 명료하게 기술해야 한다.

# 일반적인 프로그래밍 원칙

## 57. 지역변수의 범위를 최소화하라

지역변수의 스코프를 줄이면 코드 가독성과 유지보수성이 높아지고 오류 가능성은 낮아진다.

- 범위를 줄이는 가장 강력한 기법은 '가장 처음 쓰일 때 선언하기' 다.
- 거의 모든 지역변수는 선언과 동시에 초기화해야 한다.
  - try-catch 문은 예외.

반복변수의 값을 반복문 종료 후에도 써야 하는 상황이 아니라면 while보다 for문을 쓰는 편이 낫다.

```java
for (Iterator<Element> i = c.iterator(); i.hasNext();) {
  	Element e = i.next();
  	...
} // 블록 밖에서 반복자 변수에 접근 불가
```

가능한 메서드를 작게 유지하고 한 가지 기능에 집중하면 지역변수 범위를 최소화할 수 있다.

## 58. 전통적인 `for`문 보다는 `for-each` 문을 사용하라

반복자와 인덱스 변수를 사용하지 않으니 코드가 깔끔해지고 오류가 날 일도 없다.

하나의 관용구로 컬렉션과 배열(+`Iterable` 인터페이스 구현체) 모두 처리할 수 있다.

for-each문을 사용할 수 없는 상황

- 파괴적 필터링 : 컬렉션을 순회하면서 선택된 원소를 제거해야 할 떄
- 변형 : 리스트나 배열을 순회하면서 그 원소의 값 일부 혹은 전체를 교체해야 할 때
- 병렬 반복 : 여러 컬렉션을 병렬로 순회해야 한다면 각 반복자와 인덱스 변수를 사용해 엄격하고 명시적으로 해야 한다.

이외 상황에서는 for-each 문을 사용하자

## 59. 라이브러리를 익히고 사용하라

이점

1. 코드를 작성한 전문가의 지식과 여러분보다 앞서 사용한 다른 프로그래머들의 경험을 활용할 수 있다.
2. 비즈니스 로직에 좀 더 집중할 수 있다
3. 따로 노력하지 않아도 성능이 지속해서 개선된다.
4. 기능이 계속해서 많아진다
5. 작성한 코드가 많은 사람들에게 낯익은 코드가 된다.

## 60. 정확한 답이 필요하다면 `float` 와 `double` 은 피하라

금융 관련 계산에는 `BigDecimal`, `int` 또는 `long` 을 사용해야 한다

BigDecimal은 정확하지만, 기본 타입보다 사용하기 불편하고 훨씬 느리다.

## 61. 박싱된 기본 타입보다는 기본 타입을 사용하라

1. 기본 타입은 값만 가지고 있으나, 박싱된 타입은 값 + 식별성(identity)란 속성을 갖는다.

   값이 같아도 다르다고 식별될 수 있다

2. 기본 타입의 값은 언제나 유효, 박싱된 타입은 null을 가질 수 있다.

3. 기본 타입이 박싱된 타입보다 시간과 메모리 효율적이다.

박싱된 타입에 `==` 연산자를 사용하면 참조를 비교하므로 의도와는 다른 오류가 생긴다.

기본 타입과 박싱된 타입을 혼용한 연산에서는 자동 언박싱된다

- 그리고 `null`참조를 언박싱하면 NPE가 발생한다.

기본 타입을 박싱하는 작업은 필요 없는 객체를 생성할 수 있다.

박싱된 타입을 쓰는 경우

- 컬렉션의 원소, 키, 값
  - 타입 매개변수로 쓰일 때
- 리플렉션을 통해 메서드를 호출할 때

## 62. 다른 타입이 적절하다면 문자열 사용을 피하라

문자열은 다른 값 타입을 대신하기에 적합하지 않다.

문자열은 열거 타입을 대신하기에 적합하지 않다.

- 상수를 열거할 떄는 문자열보다는 열거 타입이 월등히 낫다

문자열은 혼합 타입을 대신하기에 적합하지 않다

- 여러 요소가 혼합된 데이터를 문자열로 표현하는 것은 좋지 않다

문자열은 권한을 표현하기에 적합하지 않다

- 권한을 표현하는 클래스를 정의하자

## 62. 문자열 연결은 느리니 주의하라

문자열 연결 연산자로 문자열 n개를 잇는 시간은 $n^2$ 시간에 비례한다

- 문자열은 불변, 연결할 문자열을 모두 복사해야 한다

 성능을 포기하지 않으려면 StringBuilder를 사용하자

## 64. 객체는 인터페이스를 사용해 참조하라

적합한 인터페이스만 있다면 매개변수뿐 아니라 반환값, 변수, 필드를 전부 인터페이스 타입으로 선언하라

- 구현 클래스는 생성자를 사용할 때만 사용하자
- 인터페이스를 타입으로 사용하면 프로그램이 유연해진다

적합한 인터페이스가 없는 경우 : 클래스로 참조해야 한다

- String과 같은 값 클래스
- 클래스 기반으로 작성된 프레임워크 : 구체 클래스보다는 기반 클래스(추상 클래스)를 참조하자
- 인터페이스에는 없는 메서드가 추가된 구체 클래스

적합한 인터페이스가 없다면 클래스의 계층구조 중 필요한 기능을 만족하는 가장 덜 구체적인(상위의) 클래스를 타입으로 사용하자

## 65. 리플렉션보다는 인터페이스를 사용하라

리플렉션(`java.lang.reflect`)를 이용하면 임의의 클래스에 접근할 수 있다.

- 클래스의  생성자, 메서드, 필드, 멤버 이름, 필드 타입, 메서드 시그니처 등을 가져올 수 있다.
- 실제 생성자, 메서드, 필드를 조작할 수도 있다.
- 컴파일 시에 존재하지 않은 클래스도 이용할 수 있다.

단점

- 컴파일타임 타입 검사가 주는 이점을 하나도 누릴 수 없다. (+ 예외 검사)
- 리플렉션을 이용하면 코드가 지저분하고 장황해진다
- 성능이 떨어진다

리플렉션은 아주 제한된 형태로만 사용해야 그 단점을 피하고 이점만 취할 수 있다.

- 컴파일타임에 이용할 수 없는 클래스를 사용해야만 한다면
- 리플렉션은 인스턴스 생성에만 쓰고, 생성된 인스턴스는 인터페이스나 상위 클래스로 참조해 사용하자
- 드물게, 런타임에 존재하지 않을 수 있는 다른 클래스 등과의 의존성을 관리할 때 쓰인다

## 66. 네이티브 메서드는 신중히 사용하라

자바 네이티브 인터페이는 자바 프로그램이 네이티브 메서드를 호출하는 기술.

- 네이티브 메서드 : C나 C++ 같은 네이티브 프로그래밍 언어로 작성한 메서드

성능을 개선할 목적으로 네이티브 메서드를 사용하는 것은 거의 권장하지 않는다.

- 네이티브 메서드는 안전하지 않고, 이식성도 낮고, 디버깅도 어렵다. 가비지 컬렉터가 메모리 회수하지 못한다.

## 67. 최적화는 신중히 하라

성능 때문에 견고한 구조를 희생하지 말자. **빠른 프로그램보다는 좋은 프로그램을 작성하라**

성능을 제한하는 설계를 피하라.

- public 클래스를 가변으로 반들면 불필요한 방어적 복사가 늘어난다
- 인터페이스 대신 굳이 구현 클래스를 사용하면 나중에 더 빠른 구현체가 나오더라도 이용하지 못한다

보통 잘 설계된 API가 성능도 좋다. 성능을 위해 API를 왜곡하는 건 좋지 않은 생각

각 최적화 시도 전후로 성능을 측정하라.

- 느릴 거라 짐작한 부분이 별다른 영향을 주지 않을 수 있다.

프로파일러를 사용하면 성능이 문제가 되는 부분을 쉽게 찾을 수 있다.

## 68. 일반적으로 통용되는 명명 규칙을 따르라

JLS 6.1에 명세되어 있는 명명 규칙을 따르자.

# 예외

## 69. 예외는 진짜 예외 상황에서만 사용하라

예외는 오직 예외 상황에서만 써야 한다. 절대 일상적인 제어 흐름용으로 쓰여선 안된다.

잘 설계된 API라면 클라이언트가 정상적인 제어 흐름에서 예외를 사용할 일이 없게 해야 한다

- 상태 의존적 메서드를 제공하는 클래스는 상태 검사 메서드도 함께 제공해야 한다
  - Iterator의 `next`와 `hasNext`
- 상태 검사 메서드 대신 빈 옵셔널 혹은 `null` 같은 특수 값을 반환하는 방법도 있다.

상태 검사 메서드, 옵셔널, 특정 값 중 뭘 써야 할까

1. 외부 동기화 없이 여러 스레드가 동시 접근하거나 외부 요인으로 상태가 변할 수 있다면
   - 옵셔널이나 특정 값
   - 상태 검사 메서드 호출 뒤 상태 의존 메서드 호출 한 사이 상태가 변할 수 있기 때문
2. 성능이 중요한 상황에서 상태 검사 메서드가 상태 의존적 메서드의 작업 일부를 중복 수행한다면
   - 옵셔널이나 특정 값
3. 다른 경우
   - 상태 검사 메서드 방식이 낫다
     - 가독성이 좋고, 잘못 사용했을 때 발견하기 쉽다.

## 70. 복구할 수 있는 상황에는 검사 예외, 프로그래밍 오류에는 런타임 예외를

호출하는 쪽에서 복구하리라 여겨지는 상황이라면 검사 예외를 사용하라

비검사 throwable은 크게 런타임 에러와 에러다.

- 프로그램에서 잡을 필요가 없거나 통상적으로 잡지 말아야 한다.

프로그래밍 오류를 나타낼 때는 런타임 예외를 사용하자

- 런타임 예외의 대부분은 전제조건 위배
  - API 명세에 기록된 제약을 지키지 못했다는 뜻
- 프로그래밍 오류인지가 명확히 구분되지 않을 때는 복구 가능하다면 검사 예외, 그렇지 않다면 런타임 예외를 사용하자

에러는 보통 JVM이 자원 부족 등 더 이상 수행을 계속할 수 없는 상황을 나타낼 때 사용한다

- `Error` 클래스를 상속해 하위 클래스를 만들지 말자

구현하는 비검사 throwable은 모두 `RuntimeException`의 하위 클래스여야 한다.

Exception, RuntimeException, Error 를 상속하지 않는 throwable은 절대 사용하지 말자

- 예외보다 나은 점이 없고, 클라이언트를 헷갈리게 한다

검사 예외라면 복구에 필요한 정보를 알려주는 메서드도 제공하자

- 오류 메세지를 파싱하는 것은 좋지 않다.

## 71. 필요 없는 검사 예외 사용은 피하라

검사 예외를 과하게 사용하면

- API 사용자에게 부담을 준다
- 검사 예외를 던지는 메서드는 스트림 안에서 사용할 수 없다.

API를 제대로 사용해도 발생할 수 있는 경우, 프로그래머가 의미있는 조치를 할 수 있는 경우 검사 예외를 사용하자

검사 예외를 회피하는 방법

- 결과 타입을 담은 옵셔널을 반환
- 검사 예외를 던지는 메서드를 2개로 쪼개 비검사 에외로 변경 `hasNext()` `next()`

## 72. 표준 예외를 사용하라

표준 예외를 재사용하면

-  API가 다른 사람이 익히고 사용하기 쉬워진다.
- 예외 클래스가 적을수록 메모리 사용량, 클래스 적재 시간이 줄어든다

`IlegalArgumentException` : 인수로 부적절한 값을 넘겼을 때. (반복 횟수를 지정하는 매개변수에 음수값)

`IllegalStateException` : 대상 객체의 상태가 메서드 수행할 수 없을 때, (정상 초기화되지 않은 객체의 사용)

`NullPointerException` : null을 허용하지 않는 메서드에 null을 건낼 떄

`IndexOutOfBoundsException` : 시퀀스의 허용범위를 넘는 값을 건낼 때

`ConcurrentModificationException` : 단일 스레드에서 사용하려 설계한 객체를 여러 스레드가 동시 수정하려 할 떄

Exception, RuntimeException, Throwable, Error 는 직접 재사용하지 말자

- 여러 성격의 예외를 포괄하는 클래스, 안정적으로 테스트할 수 없다.

## 73. 추상화 수준에 맞는 예외를 던져라

상위 계층에서는 저수준 예외를 잡아 자신의 추상화 수준에 맞는 예외로 바꿔 던져야 한다

- 예외 번역

가능하다면 저수준 메서드가 반드시 성공하도록 하여 아래 계층에서는 예외가 발생하지 않도록 하는 것이 최선

예외를 피할 수 없다면, 상위 계층에서 예외를 처리하여 호출자에까지 전파하지 않게 한다. + 로깅

## 74. 메서드가 던지는 모든 예외를 문서화하라

검사 예외는 항상 따로따로 선언하고, 각 예외가 발생하는 상황을 자바독의 `@throws` 태그를 사용하여 정확히 문서화하자

메서드가 던질 수 있는 에외를 각각 `@throws` 태그로 문서화하되, 비검사 예외는 메서드 선언의 `throws` 목록에 넣지 말자

- 메서드 사용자가 비검사 예외를 구분할 수 있다.

한 클래스에 정의된 여러 메서드가 같은 이유로 같은 예외를 던진다면 그 예외를 (각 메서드가 아닌) 클래스 설명에 추가하는 방법도 있다.

## 75. 예외의 상세 메시지에 실패 관련 정보를 담으라

stacktrace는 예외 객체의 `toString` 메서드를 호출해 얻는 문자열이다.

- 예외의 `toString` 메서드에 실패 원인에 관한 정보를 가능한 많이 담아야 한다.

실패 순간을 포착하려면 발생한 예외에 관여된 모든 매개변수와 필드의 값을 실패 메시지에 담아야 한다

예외는 실패와 관련한 정보를 얻을 수 있는 접근자 메서드를 적절히 제공하는 것이 좋다.

## 76. 가능한 한 실패 원자적으로 만들라

호출된 메서드가 실패하더라도 해당 객체는 메서드 호출 전 상태를 유지해야 한다

- 예외가 발생해도 객체는 정상적으로 사용할 수 있는 상태

방법

1. 작업 수행에 앞서 매개변수의 유효성을 검사한다
2. 실패할 가능성이 있는 모든 코드를 객체의 상태를 바꾸는 코드보다 앞에 배치한다
3. 객체의 임시 복사본에서 작업을 수행한 다음, 성공적으로 완료되면 원래 객체와 교체한다.
4. 작업 도중 발생하는 실패를 가로채는 복구 코드를 작성하여 작업 전 상태로 되돌린다

## 77. 예외를 무시하지 마라

`catch` 블록을 비워두면 예외가 존재할 이유가 없어진다

예외를 무시하기로 했다면 `catch` 블록 안에 그렇게 결정한 이유를 주석으로 남기고, 예외 변수의 이름도 `ignored`로 바꾸자

```java
try {
} catch (TimeOutException | ExecutionException ignored) {
  	// 기본값을 사용한다
}
```

# 동시성

## 78. 공유중인 가변 데이터는 동기화해 사용하라

동기화는 일관성이 깨진 상태를 볼 수 없게 하고, 동기화된 메서드나 블록에 들어간 스레드가 같은 락에서 수행된 모든 이전 수행의 최종 결과를 보게 해 준다.

동기화는 배타적 실행 뿐 아니라 스레드 사이의 안정적인 통신에 꼭 필요하다

```java
public class StopThread {
  	private static boolean stopRequested;
  
  	public static void main(String[] args) {
      	Thread backgroundThread = new Thread(() -> {
          int i = 0;
          while (!stopRequested) // 특정 가상머신이 최적화 수행하면 무한히 실행됨. 스레드간 통신 불가능
            	i++;
        })
        backgroundThread.start();
      	
      	TimeUnit.SECONDS.sleep(1);
      	stopRequested = true;
    }
}
```

쓰기와 읽기 모두가 동기화되지 않으면 동작을 보장하지 않는다.

```java
// 적절히 동기화
private static synchronized void requestStop() {
  	stopRequested = true;
}
private static synchronized boolean stopRequested() {
  	return stopRequested;
}
public static void main(String[] args) {
  Thread backgroundThread = new Thread(() -> {
    int i = 0;
    while (!stopRequested())
      i++;
  })
    backgroundThread.start();

  TimeUnit.SECONDS.sleep(1);
	requestStop();
}
```

`volatile` 한정자는 배타적 수행과는 상관 없으나, 항상 가장 최근에 기록된 값을 읽게 됨을 보장한다.

- 배타적 실행을 보장하는 것은 아니다 !! 스레드간 통신만 지원하는 것

`AtomicLong`은 락 없이도 스레드 안전한 메서드를 지원한다

- 배타적 실행(원자성)도 보장하고, 스레드간 통신도 보장한다.
- ex) `getAndIncrement()`

동시성 문제를 피하는 가장 좋은 방법은 가변 데이터를 공유하지 않는 것이다.

- 웬만하면 가변 데이터는 단일 스레드에서만 쓰도록 하자

## 79. 과도한 동기화는 피하라

과도한 동기화는 성능을 떨어뜨리고, 교착상태에 빠뜨리고, 예측할 수 없는 동작을 낳기도 한다

동시성 문제(응답 불가, 안전 실패)를 피하려면 동기화 메서드나 동기화 블록 안에서는 제어를 절대 클라이언트에게 양도하면 안된다.

- 오버라이딩 가능한 메서드는 호출하면 안된다
- 클라이언트가 넘겨준 함수 객체를 호출하면 안된다.

`CopyOnWriteArrayList` : 내부를 변경하는 작업은 항상 꺠끘한 복사본을 만들어 수행하도록 구현됨

기본 규칙 : 동기화 영역에서는 가능한 한 일을 적게 하라

- 락을 얻고, 공유 데이터를 검사하고, 필요하면 수정하고, 락을 해제한다
- 오래 걸리는 작업이라면, 동기화 영역 밖으로 옮기는 방법을 찾아보자

가변 클래스를 작성하려면

1. 동기화를 하지 말고, 해당 클래스를 동시에 사용해야 하는 클래스가 외부에서 알아서 동기화하게 하자 `StringBuilder`

2. 동기화를 내부에서 수행해 스레드 안전한 클래스로 만들자. `StringBuffer`

   동시성을 월등히 개선할 수 있을 때만

## 80. 스레드보다는 실행자, 태스크, 스트림을 애용하라

실행자(Excutor)를 사용하면 작업 큐를 간단하게 생성하고 스레드 풀을 생성해 여러 병렬처리를 쉽게 할 수 있도록 해준다.

스레드를 직접 다루면 `Thread`가 작업 단위와 수행 매커니즘 역할을 모두 수행하게 된다.

Task는 작업 단위를 나타내는 핵심 추상 개념이다.

-  Runnable / Callable(값을 반환, 예외를 던질 수 있음) 로 구분된다.

태스크 수행을 Excutor에 맡기면 원하는 태스크 수행 정책을 선택하고 변경할 수 있다.

`ForkJoinTask`의 인스턴스는 하위 태스크로 나뉠 수 있고

- `ForkJoinPool`을 구성하는 스레드들이 태스크를 처리하며
- 일을 먼저 끝내 스레드는 다른 스레드의 남은 태스크를 가져와 처리한다
- ParallelStream은 fork-join 풀을 이용해 만들어졌다.

> Producer-Consumer 구조의 크롤러 구현시
>
> - Producer에서는 큐에 넣을 작업을 Task로 만들고
> - Consumer와 CrawlDelay는 ScheduledThreadPoolExcutor를 이용해 구현하면 되지 않을까

## 81. `wait`과 `notify`보다는 동시성 유틸리티를 애용하라

`wait` 과 `notify`는 올바르게 사용하기가 아주 까다로우니 고수준 동시성 유틸리티를 사용하자

동시성 컬렉션은 List와 같은 표준 컬렉션 인터페이스에 동시성을 구현한 고성능 컬렉션이다

- 동시성 컬렉션에서 동시성을 무력화하는 것은 불가능하며, 외부에서 락을 추가로 사용하면 속도가 느려진다.

`Collections.synchronizedMap` 보다는 `ConcurrentHashMap`을 사용하는 게 훨씬 좋다.

**BlockingQueue는 Produver-Consumer 큐(작업 큐)로 쓰기에 적합하다. **

- 대부분의 Excutor 구현체에서 사용한다.

시간 간격을 잴 때는 항상 `System.currentTimeMillis`가 아닌 `System.nanoTime`을 사용하자

`wait` 메서드를 사용할 때는 반드시 wait loop 관용구를 사용하라. 반복문 밖에서는 절대로 호출하지 말자

- 루프는 wait 호출 전후로 조건을 검사하는 역할을 한다.

```java
synchronized (obj) {
  	while(조건이 충족되지 않으면)
      	obj.wait(); // 락을 놓고, 깨어나면 다시 잡는다.
  	// 조건이 충족되면 동작을 수행
}
```

일반적으로 `notify`보다는 `notifyAll`을 사용해야 한다.

## 82. 스레드 안전성 수준을 문서화하라

메서드 선언에 `synchronized` 한정자를 선언할지는 구현 이슈일 뿐 API에 속하지 않는다.

- 해당 메서드가 thread-safe 라고 믿기 어렵다

멀티스레드 환경에서도 API를 안전하게 사용하려면 클래스가 지원하는 스레드 안전성 수준을 정확히 명시해야 한다.

1. 불변(immutable) : 클래스의 인스턴스는 상수와 같아서 외부 동기화도 필요 없다.
2. 무조건적 스레드 안전(unconditionally thread-safe) : 클래스의 인스턴스는 수정될 수 있으나, 별도의 외부 동기화 없이 동시 사용해도 안전하다
   - `synchronized` 메서드가 아닌 비공개 락 객체를 사용하자.
     - `private final Object lock = new Object` / `synchronized(lock)`
3. 조건부 스레드 안전(conditionally thread-safe) : 무조건적 스레드 안전과 같으나, 일부 메서드는 동시에 사용하려면 외부 동기화가 필요하다.
4. 스레드 안전하지 않음(not thread-safe) : 클래스 인스턴스는 수정될 수 있다. 동시 사용하려면 메서드 호출을 클라이언트가 동기화해야 한다.
5. 스레드 적대적(thread-hostile) : 모든 메서드 호출을 외부 동기화하더라도 멀티스레드 환경에서 안전하지 않다.

## 83. 지연 초기화는 신중히 사용하라

지연 초기화(lazy initialization) : 필드의 초기화 시점을 그 값이 처음 필요할 때까지 늦추는 기법

대부분의 상황에서 일반적인 초기화가 지연 초기화보다 낫다

지연 초기화하는 필드를 둘 이상의 스레드가 공유하면 반드시 동기화해야 한다

- 초기화 순환성을 깨뜨릴 것 같으면 `synchronized` 접근자를 사용하자

  ```java
  private FieldType field;
  
  private synchronized FieldType getField() {
    	if (field == null) {
        	field = computeFieldValue();
      }
    	return field;
  }
  ```

- 성능 때문에 정적 필드를 지연 초기화해야 한다면 lazy initialization holder class 관용구를 사용하자

  ```java
  private static class FieldHolder { // 클래스는 클래스가 처음 쓰일 떄 초기화된다.
    	static final FieldType field = computeFieldValue();
  }
  
  private static FieldType getField() { return FieldHolder.field; }
  ```

- 성능 때문에 인스턴스 필드를 지연 초기화해야 한다면 double-check 관용구를 사용하라

  - 초기화된 필드에 접근할 때의 동기화 비용을 없애 준다.

  ```java
  private volatile FieldType field; // 최신 상태 보장
  
  private FieldType getField() {
    	FieldType result = field;
    	if (result != null) {
        	return result;
      }
    	synchronized(this) {}
          if (field == null) {
              field = computeFieldValue();
          }
          return field;
  		}
  }
  ```

## 84. 프로그램의 동작을 스레드 스케줄러에 기대지 말라

정확성이나 성능이 스레드 스케줄러에 따라 달라지는 프로그램이라면 다른 플랫폼에 이식하기 어렵다.

스레드는 당장 처리해야 할 작업이 없다면 실행돼서는 안된다.

- 스레드 풀 크기를 적절히 설정하고 작업은 짧게 유지하자

스레드는 절대 바쁜 대기 상태가 되면 안된다. 

- 스레드 스케줄러의 변덕에 취약하고, 프로세서에 큰 부담을 준다.

특정 스레드가 다른 스레드들과 비교해 CPU 시간을 충분히 얻지 못해서 간신히 돌어가는 프로그램을 보더라도 **`Thread.yield`를 써서 문제를 고쳐보려는 유혹을 떨쳐내자**

- 테스트할 수단도 없고, 이식성도 낮다.

# 직렬화

## 85. 자바 직렬화의 대안을 찾으라

직렬화 위험을 회피하는 가장 좋은 방법은 아무것도 역직렬화하지 않는 것이다.

- 새로운 시스템에서 자바 직렬화를 써야 할 이유는 전혀 없다.
- JSON 같은 크로스 플랫폼 데이터 표현을 사용하자

레거시 때문에 직렬화를 배제할 수 없다면

- 신뢰할 수 없는 데이터는 절대 역직렬화하지 말자
  - `java.io.ObjectInputFilter` 의 화이트리스트 방식을 사용하자

## 86. `Serializable`을 구현할지는 신중히 결정하라

`Serializable`을 구현하면 릴리스한 뒤에는 수정하기 어렵다.

- private와 package-private 인스턴스 필드들또한 API로 공개된다.

버그와 보안 구멍이 생길 위험이 높아진다.

- 객체는 생성자를 사용해 만드는 게 기본이다.

해당 클래스의 신버전을 릴리스할 때 테스트할 것이 늘어난다.

상속용으로 설계된 클래스는 대부분 `Serializable`을 구현하면 안 되며, 인터페이스도 대부분 `Serializable` 을 확장해서는 안된다.

내포 클래스는 직렬화를 구현하지 말아야 한다

## 87. 커스텀 직렬화 형태를 고려해보라

우선 고민해보고 괜찮다고 판단될 때만 기본 직렬화 형태를 사용하라

객체의 물리적 표현과 논리적 내용이 같다면 기본 직렬화 형태라도 무방하다

- 차이가 난다면?
  1. 공개 API 가 형재의 내부 표현 방식에 영구히 묶인다.
  2. 너무 많은 공간을 차지할 수 있다.
  3. 시간이 너무 많이 걸릴 수 있다.
  4. 스택 오버플로를 일으킬 수 있다.

기본 직렬화 형태가 적합하더라도, 불변식 보장과 보안을 위해 `readObject` 메서드를 제공해야 할 때가 많다.

객체의 논리적 상태와 무관한 필드라고 확신할 때만 `transient` 한정자를 생략해야 한다

- `transient` :  직렬화에서 제외한다.

객체의 전체 상태를 읽는 메서드에 적용해야 하는 동기화 매커니즘을 직렬화에도 적용해야 한다

어떤 직렬화 형태를 택하든 직렬화 가능 클래스 모두에 직렬 버전 UID를 명시적으로 부여하자

## 88. `readObject` 메서드는 방어적으로 작성하라

`readObject` 메서드는 실질적으로 또 다른 public 생성자

객체를 역직렬화할때는 클라이언트가 소유해서는 안 되는 객체 참조를 갖는 필드를 모두 반드시 방어적으로 복사해야 한다

## 89. 인스턴스 수를 통제해야 한다면 `readResolve` 보다는 열거 타입을 사용하라

직렬화와 인스턴스 통제가 모두 필요한 상황이라면

- `readResolve` 기능을 이용하면 `readObject` 가 만들어낸 인스턴스를 다른 것으로 대체할 수 있다.
- 해당 클래스의 모든 참조 타입 인스턴스 필드를 `transitent`로 선언한다

## 90. 직렬화된 인스턴스 대신 직렬화 프록시 사용을 검토하라

```java
class Period {
  	private static class SerializationProxy implements Serializable {
      	private final Date start;
      	private final Date end;
      
      	SerializationProxy(Period p) {
          	this.start = p.start;
          	this.end = p.end;
        }
      
      	private static final long serialVersionUID = 231231135131351L;
    }
  	private Object writeReplace() {
      	return new SerializationProxy(this);
    }
}
```

중요한 불변식을 안정적으로 직렬화해주는 쉬운 방법