---
title: "C - 구조체, 공용체, 함수 포인터"
excerpt: "c - 구조체, 공용체, 함수 포인터"

categories:
  - cs
tags:
  - c
  - cs
last_modified_at: 2021-09-29T08:06:00-05:00
---

# 구조체

 typedef

- 구조체에 `typedef` 쓰면 간결하게 변수선언이 가능

- ```c
  struct date {
    int year;
    int month;
    int day
  };
  typedef struct date date_t;
  
  typedef struct date {
    int year;
    int month;
    int day;
  } date_t
    
  typedef struct {
    int year;
    int month;
    int day;
  } date_t; // struct date 로 접근 불가
  
  date_t date;
  ```

- `enum` /  `union` 도 마찬가지다

 초기화

- 구조체 선언과 동시에 초기화되지 않음. 스택에 남아있는 가비지 데이터 그대로 사용함

- 초기화 방법

  - 멤버 변수에 직접 0으로 대입하거나

  - ```c
    date_t date = { 0, }
    ```


## 구조체 매개변수

구조체는 값형이다.

- 멤버 변수가 포인터형이 아닌 이상은 데이터 변경이 불가능하다.
- 구조체를 매개변수로 받는 함수 내에서 구조체의 멤버 변경해도 함수 밖에서는 변경되지 않는다.

구조체 포인터에서 멤버의 값에 접근하기

- ```c
  void increase_year(date_t* date) {
    (*date).year = (*date).year + 1; // 연산자 우선순위 때문에 괄호 필요
    date->year = date->year + 1; // 위와 동일한 결과
    date->year++; // 위와 동일한 결과
  }
  ```

구조체 매개변수 베스트 프랙티스

1. 값으로 전달 vs 주소로 전달

   - 구조체의 경우 데이터 크기가 클 수 있음. 기본 자료형은 데이터 크기가 작음.
     - 전체 멤버변수를 복사하는 게 성능이 느릴 수 있음
     - 포인터에 `const` 포인터를 붙이면 원본도 못 바꾸니 안전함

2. 구조체 매개변수 vs 여러 개의 개별 변수?

   - 3~5개까지는 낱개 변수로, 그 이후에는 구조체로 넘기자
   - 구조체를 사용하면 실수를 줄일 수 있고, 주소로 전달할 경우 성능을 빠르게 할 수 있다.


## 얕은 복사, 깊은 복사

- 얕은 복사 : 실제 데이터가 아니라 주소를 복사하는 걸 얕은 복사라고 함
- 깊은 복사 : 구조체 변수마다 독자적인 메모리 공간을 만들어주고 문자열을 복사해야 함

파일을 쓸 때도 문자열이 아닌 주소값을 쓰지 않도록 주의해야 한다.

주소값이 아닌 배열을 복사하여 매개변수로 전달하는 방법

```c
enum { NAME_LEN = 32 };
typedef struct {
  char firstName[NAME_LEN]; // 포인터가 아닌 배열로 선언하면 된다. 
  char lastName[NAME_LEN];
} name_t;
```

베스트 프랙티스

- 가능한 한 덩어리 메모리에 모든 데이터가 들어가고 대입 가능한 구조체를 만들자. 복사가 가능하다
- 즉, 포인터만 없으면 됨

## 구조체를 구조체의 멤버로

```c
struct user_info_t {
  unsigned int id; // 4 byte
  name_t name; // 64 byte
  unsigned short height; // 2 byte? X -> 4 byte
  float weight; // 4 byte
  unsigned short age; // 2 byte? X -> 4 byte
};
```

- 4바이트를 안 채운 애들이 쓸데없는 공간을 먹음
  - 시스템 상의 제약이 있거나 효율성 때문
- 각 시스템마다 메모리에 접근 할 때 사용하는 주소에 대한 요구사항이 다름
- 특정 시스템은 `n` 바이트 배수인 시작 주소에서만 메모리 접근 가능
- X86 시스템은 4바이트(워드 크기) 경계에서 읽어오는게 효율적
  - 이걸 4 바이트 경계에 정렬된다(aligned)고 함
- 컴파일러가 알아서 각 멤버의 시작 위치를 경계에 맞춤
  - 32비트 clang 윈도우는 4바이트 정렬

패딩 줄이기

```c
struct user_info_t {
  unsigned int id; // 4 byte
  name_t name; // 64 byte
  unsigned short height; // 2 byte
  unsigned short age; // 2 byte
  float weight; // 4 byte
};
```

- 2개의 short 형 변수가 4바이트로 합체! (안 해 줄 수 도)

구조체 베스트 프랙티스

- 구조체를 파일 등에 저장해야 해서 바이트 크기가 정확히 맞아야 한다면?

  - `assert()` 를 사용해서 크기를 확인

    ```c
    #include <assert.h>
    assert(sizeof(user_info_t) == 76);
    ```

  - 구조체에 패딩을 명시

    ```c
    struct user_info_t {
      unsigned int id; // 4 byte
      name_t name; // 64 byte
      float weight; // 4 byte
      unsigned short height; // 2 byte
      unsigned short age; // 2 byte
    	char unsused[2];
    };
    ```

  

## 비트 필드

c에서 구조체를 사용하면 간단히 비트 플래그 구현 가능

```c
typedef struct {
  unsigned char b0 : 1; // 1비트만 쓰겠다!
  unsigned char b1 : 1;
  unsigned char b2 : 1;
  unsigned char b3 : 1;
  unsigned char b4 : 1;
  unsigned char b5 : 1;
  unsigned char b6 : 1;
  unsigned char b7 : 1;
} bitflags_t; // 총 1byte
```

# 공용체

- 똑같은 메모리 위치를 다른 변수로 접근하는 방법
- 즉, 공용체 안에 있는 여러 변수들이 같은 메모리를 공유

```c
typedef union {
  unsigned char val;
  struct {
    unsigned char b0 : 1;
    unsigned char b1 : 1;
    unsigned char b2 : 1;
    unsigned char b3 : 1;
    unsigned char b4 : 1;
    unsigned char b5 : 1;
    unsigned char b6 : 1;
    unsigned char b7 : 1;
  } bits;
} bigflags_t;

// val 은 8개 비트를 한번에 1byte char로 읽는다.
```

# 함수 포인터

함수 포인터, 함수를 변수에 저장할 수 있을까?

- 함수의 시작 주소를 변수에 저장하면 되겠다!

함수의 파라미터로 함수를 전달할 수 있을까?

- 함수 코드의 시작 메모리 주소를 파라미터로 전달하고
- 호출된 함수 내부에서 함수 파라미터 주소를 실행하면 되겠다!

함수를 매개변수로 전달할 때 필요한 것들

- 자기 자신이 받아야 하는 매개변수 목록
- 자기 자신이 반환하는 자료형
- 호출된 함수는 파라미터 함수의 시그니처를 알 방법이 없음! 그냥 4byte 주소값

함수 포인터 변수의 선언과 사용

```c
double add(double x, double y) {
  return x + y;
}

double (*funcVar)(double, double) = add;
result = funcVar(op1, op2)
```

함수 포인터 매개변수의 선언과 사용

```c
double calculate(double, double, double, (*)(double, double));

double calculate(double x, double y, double (*funcVar)(double, double)) {
  return funcVar(x, y);
}

result = calculate(op1, op2, add)
```

