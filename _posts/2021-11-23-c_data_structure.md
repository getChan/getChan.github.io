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

## 삽입

```c
void push(int n){
  assert(s_num_count) < MAX_NUMS);
  s_nums[s_num_count++] = n;
}
```
- 시간 복잡도 : $O(1)$

## 삭제

```c
int pop(void){
  assert(is_empty() == FALSE);

  return s_nums[--s_num_count];
}

int is_empty(void){
  return (s_num_count == 0);
}
```
- 시간 복잡도 : $O(1)$

## 검색
- 시간 복잡도 $O(n)$
- 요소들을 제거했다가 다시 원상복구해야함

# 큐

## 삽입

```c
void enqueue(int n){
  assert(s_num_count < MAX_NUMS);

  s_nums[s_back] = n;
  s_back = (s_back + 1) % MAX_NUMS; // 꽉 차면 한바퀴 돌아 첫번째 요소를 가리킨다

  ++s_num_count;
}
```
- $O(1)$

## 삭제
```c
int dequeue(void) {
  int ret;
  assert(is_empty() == FALSE);

  ret = s_nums[s_front];

  --s_num_count;
  s_front = (s_front + 1) % MAX_NUMS;
  
  return ret;
}
```
- $O(1)$

## 검색
- 모든 요소를 전부 제거했다가 원상복구해야함
- $O(n)$

# 연결 리스트

검색
- 헤드 노드부터 찾을 때까지 뒤져야 함
- $O(n)$

## 노드 메모리 해제

```c
typedef struct node {
  int value;
  node_t* next;
} node_t;

void destroy(node_t* head) {
  node_t* p = head;
  while (p != NULL) {
    node_t* next = p->next;
    free(p);
    p = next;
  }
}
```

## 삽입

```c
void insert_front(node_t** phead, int n) {
  node_t* new_node;

  new_node = malloc(sizeof(node_t));
  new_node->value = n;

  new_node->next = *phead;
  *phead = new_node;
}
```

### 오름차순으로 삽입

```c
void insert_sorted(node_t** phead, int n) {
  node_t** pp;
  node_t* new_node;

  new_node = malloc(sizeof(node_t));
  new_node->value = n;

  pp = phead;
  while (*pp != NULL){
    if ((*pp)->value >= n) {
      break;
    }
    *pp = &(*pp)->next

  }
  new_node->next = *pp;
  *pp->next = new_node;
}
```

## 삭제
```c
void remove(node_t** phead, int n) {
  node_t** pp;
  pp = phead;
  while (*pp != NULL) {
    if ((*pp) -> value == n) {
      node_t* tmp = *pp;
      *pp = (*pp) -> next;
      free(tmp);
      break;
    }

    pp = &(*pp) -> next;
  }
}
```

## 용도
- 길이를 자유롭게 늘리거나 줄일 수 있어서 최대 길이를 미리 특정할 수 없고 삽입/삭제가 빈번할 경우 사용
- 현대 어플리케이션 프로그램에서는 연결 리스트보다 동적 할당 배열을 더 흔히 사용
  - 하드웨어 특성상 배열이 보장하는 메모리 지역성이 성능에 유리한 경우가 많기 때문
- 커널 모드 프로그래밍에서는 여전히 많이 사용
  - 메모리 지역성을 해치지 않으면서도 충분히 큰 메모리를 미리 할당 후
  - 필요에 따라 그 메모리를 쪼개 연결 리스트의 노드로 사용한다. (메모리 풀)


# 해시 테이블



# 출처

POCU 아카데미 'C 언매니지드 프로그래밍'



