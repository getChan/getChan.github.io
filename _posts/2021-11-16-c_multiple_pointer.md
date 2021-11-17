---
title: "C - 다중 포인터"
excerpt: "다중 포인터"

categories:
  - cs
tags:
  - c
  - cs
last_modified_at: 2021-11-16T08:06:00-05:00
---

# 이중 포인터

```c
int num = 10;
int* p = &num;
int** pp = &p;
```

포인터 변수의 주소를 저장하는 변수

이차원 배열과 유사하다.

메인 함수의 매개변수인 `argv` 도 이중 포인터

```c
int main(int argc, char** argv)
```



# 출처

POCU 아카데미 'C 언매니지드 프로그래밍'



