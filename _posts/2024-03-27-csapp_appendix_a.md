---
title: "CSAPP(Appendix A) - Error Handling"
excerpt: "Computer Systems : A Programmer’s Perspective - 부록 A"

categories:
  - cs
tags:
  - csapp
last_modified_at: 2024-03-27T08:00:00-08:00
---
# 1. Error Handling in Unix Systems

## 1.1. Unix-Style Error Handling
- `fork`나 `wait`같은 함수는 유닉스 초기에 개발되었다. 
- 함수는 에러 코드와 결과값 둘 다를 반환한다.
- `wait`
  - 에러 발생 시 -1을 반환하고 전역 변수 `errorno`를 에러 코드로 설정한다.
  - 성공 시 유용한 결과를 반환한다. 회수된 자식 프로세스의 PID

## 1.2. Posix-Style Error Handling
- Pthread와 같은 많은 posix 함수는 성공/실패를 구분하는 값만을 반환한다.
- 다른 유용한 결과는 pass by reference인 함수 인자에 반환된다.
- `pthread_create`
  - 반환값으로 성공,실패 구분
  - 참조형 함수 인자에 스레드 id를 반환

## 1.3. GAI-Style Error Handling
