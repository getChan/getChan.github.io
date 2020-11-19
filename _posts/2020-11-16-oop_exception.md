---
title: "객체지향 프로그래밍과 설계(13)"
excerpt: "예외 (Exception)"
categories:
  - cs
tags:
  - oop
  - java
last_modified_at: 2020-11-16T08:06:00-05:00
---
> [POCU](https://pocu.academy/ko/Courses/COMP2500)의 개체지향 프로그래밍 및 설계 강의를 듣고 정리한 내용입니다.

# 기본 문법

```java
try {
  // 시도할 코드들
} catch (<예외 클래스1> <변수명>) {
  // 예외 발생할 경우 해당 예외를 처리할 코드
} catch (<예외 클래스2> <변수명>) {
  // 예외 발생할 경우 해당 예외를 처리할 코드
} finally {
  // 예외 발생 여부와 관계없이 항상 실행되는 코드
  // 생략 가능
}
```
- 특정하기 어렵거나 모든 예외를 잡고 싶다면 `Exception` 클래스 사용
- 부모 예외 클래스가 자식보다 먼저 나오면 안 됨
- 잘못된 예
  ```java
  try {
    ...
  } catch (Exception e) {
    ...
  } catch (FileNotFoundException e) {
    // 절대 실행될 일 없음
  } finally {
    ...
  }
  ```

`printStackTrace()`
- 발생한 예외의 호출 스택을 보여줌

`getMessage()`
- 예외가 왜 발생했는지 설명
- 메세지가 없으면 `null` 반환

# `finally` 사용 예시

```java
static void WriteByte(String relativePath, byte b) {
  Path path = Paths.get(getClassPath(), relativePath);

  FileOutputStream out = null;

  try {
    out = new FileOutputStream(new File(path.toString()), true);
    out.write(b);
    out.close();
  } catch (IOException e) {
    e.printStackTrace();
    return;
  }
}
```
- **GC가 파일을 대신 닫아준다. 그러나**
  - `FileOutputStream` 객체를 해제
    - GC가 호출하는 `finalize()`가 `close()` 메서드를 호출
  - 그러나 그 시점이 언제인지 알 수 없음
  - GC가 실행되기 전에 OS 리소스의 한계에 다다를 수 있음
  - java 9부터 `finalize()` 사용을 피하라 함

```java
static void WriteByte(String relativePath, byte b) {
  Path path = Paths.get(getClassPath(), relativePath);

  FileOutputStream out = null;

  try {
    out = new FileOutputStream(new File(path.toString()), true);
    out.write(b);
    out.close();
  } catch (IOException e) {
    e.printStackTrace();
    return;
  } finally {
    if (out != null) {
      try {
        out.close();
      } catch (Exception e){
      }
    }
  }
}
```

## 예외 발생 시 진행 순서
1. try 불록의 실행이 중단됨
2. catch 블록 중에 발생한 예외를 처리할 수 있는 블록이 있는지 찾음.
   - 위에서부터 하나씩 평가
3. 예외를 처리할 수 있는 catch 블록이 없다면
   - finally 블록 실행 후 한 단계 높은 try 블록으로 전달
4. 예외를 처리할 수 있는 catch 블록이 있다면
   - 해당 catch 블록 안의 코드들이 실행
   - finally 블록을 실행
   - try 블록 이후의 코드들이 실행됨

# 예외 다시 던지기 (rethrow)
```java
public void WriteFile(String relativePath) {
  FileOutputStream out = null;
  try {
    Path path = Paths.get(getClassPath(), relativePath);

    out = new FileOutputStream(new File(path.toString()), true);
    out.write(oxF);
  } catch (NullPointerException e){
    System.err.println("found null pointer!");
    throw e;
  }
}
```
- rethrow는 좋은 습관이 아님
- **해야 한다면 호출 스택을 유지하면서 던질 것!**

# 커스텀 예외 만들기

```java
public final class UserNotFoundException extends RuntimeException {
  public UserNotFoundException() {
    super();
  }

  public UserNotFoundException(String message) {
    super(message);
  }

  public UserNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
```
`RuntimeException`의 생성자

- 자식 클래스들의 생성자에서 반드시 `super()`를 호출해야 함
- 호출 안 할 경우 message, cause가 저장되지 않음
- message는 `getMessage()`로 확인 가능
- cause는 `getCause()`로 확인 가능

# Java의 예외

## 예외 처리(catch)를 하지 않으면?

`main()` 메서드에서까지 아무런 처리를 안 해주면 JVM이 오류 메시지를 보여주고 프로그램을 중단시킴
- OS나 기계에는 아무 영향 없음

### 근래의 하드웨어 / OS
- 여러 프로그램이 동시에 실행됨
- 따라서 각 프로그램마다 별도의 메모리 공간(가상 메모리)를 제공

1. CPU에서 0으로 나누려 함
2. CPU의 ALU는 0으로 나누는 연산이 불가능
3. CPU등에서 문제가 있다는 인터럽트나 시그널 등을 보내줌
   - 처리 안 해주면 프로그램이 크래시 날 수 있음
4. OS가 상황을 캐치한 뒤, 프로그램을 종료하고 가상 메모리를 해제
   - 외부 리소스에 영향을 미치지 않음

> JVM이 보장해주던 안전성을 OS가 책임져준다

### 예외 처리가 힘든 이유

함수가 더이상 블랙박스가 아니게 됨
- 어느 함수에서 어떤 예외를 던지는지 찾기 힘듬
- 알려면 모든 함수의 속을 다 보며 확인해야 함
- 여러 단계에 걸쳐 함수 호출 수 확인해야 함수는 수천개..

> 캡슐화가 어렵다!

## Java의 두 가지 예외

### checked 예외
- 컴파일러가 예외 처리를 제대로 하는지 확인해 줌
- 어느 메서드가 어떤 예외를 던지는지 명확히 알 수 있음
- 예외가 발생하는 코드에서 이 둘 중 하나를 안 하면 컴파일 오류
  - 발생한 예외를 그 메서드 안에서 처리 (`catch` 블록)
  - 처리를 안 할 경우 그 사실을 메서드 시그니처 옆에 표기
    - 이 메서드의 호출자가 다시 이 둘중에 하나를 해야 함
- `Exception`을 상속받는 예외들(`RuntimeException` 제외)

```java
public User findUser(String username) throws UserNotFoundException {
  ...

  throw new UserNotFoundException(username);
}
```
- 다음 메서드의 시그니처 옆에 반드시 추가해야 함
  - checked 예외를 던지는 메서드
  - 다른 메서드에서 발생한 checked 예외를 처리하지 않는 메서드
- 추가 안 하면 컴파일 오류!

main 메서드에서도 catch안 하고 throws하면?
- JVM에서 에러를 발생시킴

### unchecked 예외
- 어디서 어떤 예외가 나는지 한눈에 안 보임
- `RuntimeException`을 상속받는 예외들
- 컴파일러가 따로 검사를 안 해줘서 unchecked 에외

checked 예외는 왜 있을까
- API 제작자가 이건 클라이언트가 반드시 처리해야 할 예외라고 알려주는 용도

예외로부터 안전한 프로그래밍 *exception-safe*
- 복잡해질수록 너무 어려워짐
- 모든 곳에서 예외로부터 안전한 프로그래밍은 매우 힘들다..

## 근래의 예외처리 트렌드
1. 그냥 unchecked 예외를 쓰자고 함
   - 다른 언어와 똑같아짐
   - 여전히 누가 어떤 예외를 던지는지 한눈에 안 보임
2. 예외로부터 안전한 최선의 방법은 재부팅
   - 예외로부터 회복하지 않는다
   - 단, 디버깅에 필요한 정보를 최대한 남기고 프로그램 종료

> 모든 예외를 한번에 "처리"하자!
>
> Exception으로 한번에 잡자!

- 주로 main() 함수에서 한 번만!
- 다시 예외를 던지는 일(rethrow) 훨씬 적어짐
- 여전히 던질 때는 세세한 예외 형을 던짐(커스텀 예외 포함)
- `catch`를 Exception으로 한방에 할 뿐

## 제어 흐름용으로 예외를 사용하지 말 것
- `goto`와 개념이 같음
- 함수 범위에서 점프하는 `goto`가 아니라 호출 스택 어디로도 점프 가능
> **절대! '다음에 실행할 코드를 결정하는 용도'로 사용하지 말 것**

매우 나쁜 예 : 재귀 함수 한방에 빠져나오기

```java
void search(TreeNode node, Object data) throws ResultException {
  if (node.data.equals(data)) {
    throw new ResultException(node);
  } else {
    search(node.leftChild, data);
    search(node.rightChild, data);
  }   
}
```

- 예외는 오류 상황이라는 전제하에 모든 툴이 개발되어 있다
- 그걸 자기 혼자 이상하게 사용하면 툴의 혜택을 못 받음

# 오류 상황, 예외 상황

오류 상황은 예측 가능한 상황을 의미
- 프로그램 실행 중에 기본적으로 일어나지 않는 일
- 하지만 여전히 일어날 수있는 일
  - 따라서 이런 상황을 처리하는 코드는 프로그램 기능의 일부
- 프로그래머가 미리 예측하지 못했다면?
  - 처리 코드가 있을 수 없음
  - 버그!
    - 발견 후 제대로 처리하는 코드를 추가 -> 다시 빌드

# 오류 상황 처리법

## 일단, 처음부터 문제 없는 코드가 최고다!!

프로그램은 여러 시스템으로 구성되어 있다.
- 각 공간의 제작자는 그 공간을 완전히 통제
  - 자기 공간에 대해 매우 잘 앎
- 그러나 다른 제작자의 공간은 통제 못 함
  - 다른 공간에 대해 잘 알지 못하기 쉽다.
- 내 시스템 안에 들어온 데이터는 언제나 유효해야 한다
  - 예외 상황을 고려할 필요가 없다.
  - 예외 상황이 발생하면 그건 버그
  - 깊은 함수 호출이 있어도 복잡하지 않다.
- 남으로부터 받아오는 데이터는?
  - 언제든 유효하지 않을 수 있음
  - 따라서 **경계**에서 반드시 검증해야 함
  - **잘못된 데이터는 경계에서 곧바로 거부**
  - 남에게 문제가 있다고 알려줌

### 남에게 문제를 알려주는 방법
1. 참/거짓(boolean)이나 null을 반환
2. 오류 코드(int, enum)를 반환
3. 예외를 던짐

## 1. 무시
무시하고 넘어간다

- 프로그램에 다음 중 한 가지 일이 발생
  1. 곧바로 크래시
  2. 일단은 작동하지만 언젠가는 크래시
  3. 안정적이지 못한 상태로 계속 동작함

## 2. 종료
문제를 일으킬 수 있는 상황이 있는지 검사하고, 그렇다면 프로그램을 종료한다.

- 어떤 문제가 있었는지 사용자에게 보여주고 정상 종료
  - 주로 팝업 창이나 로그 파일
  - `System.exit(int)` 호출
- 크래시에 비해 나은 점
  - 제대로 시스템 상태를 정리하고 종료할 가능성이 높음
  - 프로그램 종료 후 시스템이 더 안정적일 가능성이 높음
- 큰 장점
  - 작업하던 내용을 날리지 않고 저장해줄 수 있음

## 3. 수정
문제를 일으킬 수 있는 상황이 있는지 검사하고, 그렇다면 실수를 고친 뒤 계속 프로그램을 실행되게 한다.

- 사용자에게 올바른 값을 입력하라고 다시 요청
- **입력값 검증 방법 중 하나.**
- 단점
  - 문제가 처음 발생한 곳을 파악하기 쉽지 않음
  - 문제 발생 사실을 잊고 오랜 시간이 흐를 수 있음

## 4. 예외
문제가 발생하면 예외를 던진다.

- 문제가 발생했다는 사실을 알려줄 수 있음
- 그 예외를 처리할 수 있음(예외를 catch한 뒤 처리)

## 예외는 OOP의 일부가 아니다

예외 외에는 해결책이 없는 경우 : 생성자
- '수정'이 불가능
  - 이미 객체가 생성됨
  - 생성자에서 null을 반환할 수도 없음
    - 생성자는 반환형이 없다
- 문제가 발생했다는 사실을 알려주려면 예외가 유일한 방법

생성자 호출 순서
1. 메모리 할당
2. 그 메모리를 객체에 배정
3. 생성자를 통해 상태 초기화

**-> 생성자 안에서 문제가 생기면 되돌릴 방법이 없다.**

## 잘못된 예외처리보다 크래시가 낫다
- 잘못 처리하면 크래시가 안 나고 프로그램이 계속 실행됨
- 이때, 프로그램의 상태는 안정적이지 않기 쉬움

> 자동 세이브 덕분에 요즘 사용자들은 더더욱 크래시에 신경 안 씀

메모리 덤프
1. 외부 프로그램이 내 프로그램 실행
2. 내 프로그램에서 크래시 발생
3. 메모리 덤프 생성
4. 개발사에게 인터넷으로 전송

- 메모리 덤프를 디버거에서 열면 실제 모든 스택 값을 다 볼 수 있음

## 프로그램 종료도 올바른 방법이다
- 잘못된 예외처리 때문에 좀비 상태에 빠지는 일을 방지
- 물론 자동 저장도 가능하니 크래시보다 좋음

# 4가지 처리법의 순위

책임감 순위
- 1순위 : 수정
- 2순위 : 종료
- 3순위 : 예외
  - 남에게 폭탄 돌리는 꼴
- 4순위 : 무시
  - 책임감과 거리가 멂

오지랖 순위 *(클라이언트가 할 일을 내가 해 줌)*
- 1순위 : 종료
- 2순위 : 수정
  - 호출자가 수정을 원치 않거나 내가 잘못 고칠 수 있음
- 3순위 : 예외
- 4순위 : 무시

객관성 순위
- 1순위 : 종료
- 1순위 : 수정
- 3순위 : 무시
  - 크래시가 안 나면(좀비) 4순위
- 4순위 : 예외

# 예측 가능한 상황의 처리법

## 예측한 상황 + 고치기 쉬운 경우
- 고치려면, 고쳐도 안전하며 인간이 하기에 너무 어렵지 않아야 함!
- 고치고 계속 프로그램 진행 (수정 or 예외)
  - 내 코드 안에서는 '수정'
  - 경계에서는 '예외'

## 예측한 상황 + 고치기 어려운 경우
- 문제 발생 지점에서 로그를 남기고 곧바로 프로그램 '종료'
- '예외'를 던져 main()에서 catch 후 로그를 남기고 종료
  - 중간에 누가 catch하는 문제
  - 로그 외 자세한 디버깅 정보도 없다
  - 로그를 제대로 안 적는 문제

# 예측 불가능한 상황의 처리법
- 처리 코드가 없음
  - '수정'불가능
- 혹시라도 발생할 수 있는 모든 예외를 main()에서 catch한 뒤 로그를 남김
  - 자세한 디버깅 정보 없음
- 크래시가 나서 곧바로 메모리 덤프 생김
  - 충분히 자세한 디버깅 정보 있음

> 실행 중에 문제를 고치려 한다고 프로그램의 안정성이 높아지는 게 아니다. **좀비가 되면 더 큰 문제**
>
> 실수를 가장 적게 하는 것이 소프트웨어 품질을 높이는 가장 좋은 방법


# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

