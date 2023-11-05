---
title: "Monotonic queue"
excerpt: "monotonic queue을 이용해 슬라이딩 윈도우 최대/최소값 찾기"

categories:
  - Algorithm
tags:
  - data structure
last_modified_at: 2023-11-06T08:06:00-05:00
---

monotonic queue는 요소가 단조 증가 또는 감소하는 큐이다.

슬라이딩 윈도우의 최대/최소 값을 찾을 때 효율적인 자료구조이다. 

윈도우의 최소값을 유지할 때는 증가 큐, 최대값을 유지할 때는 감소 큐를 사용한다. 
- 구현에는 deque을 사용하는데, 최대/최소를 유지하기 위해 tail 요소를 새로 넣을 값과 비교 및 tail pop해야 하기 때문이다.
- deque의 head는 윈도우의 최대/최소 값이 된다.

# 참고
- https://leetcode.com/tag/monotonic-queue/
- https://goldenriver42.tistory.com/135