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

# Reference
[POCU 강의](https://pocu.academy/ko/Courses/COMP2500)

