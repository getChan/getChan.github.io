---
title: "면접 문제 - 연결 리스트"
excerpt: "연결 리스트 대표 문제 풀이"
categories:
  - algorithm
tags:
  - python
  - linkedlist
last_modified_at: 2020-10-1T08:06:00+09:00
---
# 단방향 링크드 리스트 구현

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self, arr):
        self.head = None
        cur_node = None
        self.length = len(arr)
        for i in range(len(arr)):
            if cur_node is None:
                self.head = Node(arr[i])
                cur_node = self.head
            else:
                cur_node.next = Node(arr[i])
                cur_node = cur_node.next

    def __repr__(self):
        rep = []
        cur_node = self.head
        while cur_node:
            rep.append(cur_node.data)
            cur_node = cur_node.next
        return str(rep)
```
# 뒤에서 `k`번째 원소 구하기
> 단방향 연결 리스트가 주어졌을 때 뒤에서 `k`번째 원소를 찾는 알고리즘을 구현하라

```python
def elem_from_tail1(linked_list:LinkedList, k:int) -> any:
    '''
    연결 리스트의 길이를 알고 있을 때
    '''
    cur_node = linked_list.head
    for _ in range(linked_list.length-k):
        cur_node = cur_node.next
    return cur_node.data

def elem_from_tail2(linked_list:LinkedList, k:int) -> any:
    '''
    부가 포인터를 이용한 방법
    시간 O(N), 공간 O(1)
    '''
    cur_node = linked_list.head
    runner = linked_list.head
    for _ in range(k):
        runner = runner.next
    while runner:
        runner = runner.next
        cur_node = cur_node.next
    return cur_node.data

def elem_from_tail3(linked_list:LinkedList, k:int) -> any:
    '''
    재귀를 이용한 방법
    시간 O(N), 공간 O(N)
    '''
    answer = []
    def recurse(node:Node, answer:list) -> tuple:
        if node is None: # tail
            return 0
        cur_k = recurse(node.next, answer)+1
        if cur_k == k:
            answer.append(node.data)
        return cur_k
    recurse(linked_list.head, answer)
    return answer[0]
```

# 중간 노드 삭제
> 단방향 연결리스트에서 중간에 있는 노드 하나를 삭제하는 알고리즘을 구현하라. 단, 삭제할 노드에만 접근할 수 있다.

```python
def remove(node: Node):
    '''
    다음 노드를 현재 노드로 복사 후 다음 노드를 삭제
    '''
    next_node = node.next
    node.data = next_node.data
    node.next = next_node.next
    del next_node
```

# 리스트의 합
> 연결 리스트로 숫자를 표현할 때 각 노드가 자릿수 하나를 가리키는 방식으로 표현할 수 있다. 각 숫자는 역순으로 배열되어 있는데, 첫번쨰 자리수가 리스트의 맨 앞에 위치하도록 배열된다는 뜻이다. 이와 같은 방식으로 표현된 숫자 두 개가 있을 때, 이 두 수를 더하여 그 합을 연결 리스트로 반환하는 함수를 작성하라.

```python
def add_ll(ll1: LinkedList, ll2: LinkedList) -> LinkedList:
    def get_num(cur_node:Node) -> int:
        if cur_node is None:
            return 0
        return get_num(cur_node.next)*10 + cur_node.data
        
    num = get_num(ll1.head) + get_num(ll2.head)
    new_ll = LinkedList()
    while num:
        digit = num % 10
        if new_ll.head is None:
            new_ll.head = Node(digit)
            cur_node = new_ll.head
        else:    
            cur_node.next = Node(digit)
            cur_node = cur_node.next
        num = num // 10
    return new_ll
```

# 문제 출처
책 *Cracking the Coding Interview*