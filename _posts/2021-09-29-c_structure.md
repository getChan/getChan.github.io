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

   





