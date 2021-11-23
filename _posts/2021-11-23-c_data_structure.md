---
title: "C - 자료구조"
excerpt: "C로 구현한 자료구조들"

categories:
  - cs
tags:
  - c
  - data_structure
last_modified_at: 2021-11-23T08:06:00-05:00
---

# 배열

## 삽입

```c
enum { MAX_NUNS = 8 };
int s_nums[MAX_NUMS];
size_t s_num_count = 0;

void insert_at(size_t index, int n) {
  size_t i;
  assert(index <= s_num_count);
  assert(s_num_count < MAX_NUMS);
  
  for (i = s_num_count; i > index; --i) {
    s_nums[i] = s_nums[i-1];
  }
  
  s_nums[index] = n;
  ++s_num_count;
}
```

- 배열 제일 뒤에 삽입하면 간단히 삽입하고 끝
- 그 외의 경우는 삽입하려는 위치의 요소부터 마지막 요소를 모두 뒤로 한 칸 씩 민 뒤에 삽입
- 시간 복잡도 $O(n)$

## 삭제

```c
void remove_at(size_t index){
  size_t i;
  
  assert(index < s_num_count);
  
  --s_num_count;
  for (i = index; i < s_num_count; ++i) {
    s_nums[i] = s_nums[i+1];
  }
}
```

- 삭제하는 색인을 기준으로 그 뒤의 값들을 한 칸씩 앞으로 당김
- 시간 복잡도 : $O(n)$

## 검색

```c
size_t find_index(int n) {
  size_t i;
  for (i = 0; i < s_num_count; ++i) {
    if (s_nums[i] == n) {
      return i;
    }
  }
  return INVALID_INDEX;
}
```

- 요소를 처음부터 차례대로 방문하며 일치하는 값을 확인
  - 있으면 해당 색인을 반환
  - 없으면 `-1`을 반환
- 시간 복잡도 $O(n)$

## 접근

- 색인을 알고 있다면 곧바로 접근 가능
- 시간 복잡도 : $O(n)$

# 스택

# 큐

# 연결 리스트

# 해시 테이블



# 출처

POCU 아카데미 'C 언매니지드 프로그래밍'



