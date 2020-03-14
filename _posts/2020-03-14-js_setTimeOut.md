---
title:  "JS-`setTimeOut()`의 재귀를 이용해 루프 돌기"
excerpt: "JS에서 setTimeOut과 setInterval 로 루프 돌기"
categories:
  - TIL
tags:
  - JavaScript
last_modified_at: 2020-03-14T08:06:00-05:00
---

>[Medium 포스트를 참고한 글입니다.](https://medium.com/@devinmpierce/recursive-settimeout-8eb953b02b98)

`setTimeOut(func, ms)` 는 일정 시간 이후 매개변수로 주어진 함수를 실행하는 함수이고

`setInterval(func, ms)` 는 일정 시간 간격으로 매개변수로 주어진 함수를 실행하는 함수이다.

함수를 반복 실행해야 할 때에 두 함수를 어떻게 써야 할까?

![img](https://miro.medium.com/max/1728/1*gmz2nQOT9QQ6p0qsWw1f7w.png)

`setInterval()`의 경우 있는 그대로 사용하면 되고, `setTimeout()`은 재귀를 통해 루프를 돌 수 있다. 겉으로는 같아 보이지만, 두 구문은 약간의 차이점이 있다.

`setInverval()` 은 순차적 실행을 보장하지 않는다. 위의 예시에서 두 번째 호출은 첫번째 함수 호출하고 1000ms이후에 호출되는 것은 맞지만, 만약 첫번째 함수 연산이 1000ms가 넘어간다면 첫번째 함수가 끝나기 전에 두번째 함수가 호출된다는 것이다.

반면 `setTimeout()` 의 재귀를 통해 함수를 호출하므로 함수의 순차적 실행을 보장한다. **그러나! 이 구문은 재귀를 통해 호출하므로 스택 영역에 할당된 메모리가 해제되지 않는 치명적인 단점을 가지고 있다.**

![img](https://miro.medium.com/max/1078/1*XsoINv0-Y-ZVaSrSIwyFqQ.png)

직전에 호출된 함수가 **끝나는 시점**부터 특정 시간 이후로 함수를 호출하고 싶을 때는 `setTimeout()` 함수를 사용해 루프를 돌아야겠다. 그리고 다른 재귀 로직과 마찬가지로 적합한 탈출 조건을 부여해주어야 하겠다.

반면 직전 호출 함수가 **호출되는 시점**부터 특정 시간 이후로 함수를 호출하고 싶을 때는 `setInterval()` 함수를 사용해 루프를 돌아야겠다.