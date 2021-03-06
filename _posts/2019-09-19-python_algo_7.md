---
title:  "파이썬 자료구조와 알고리즘(7)-추상 데이터 타입"
excerpt: "책 '파이썬 자료구조와 알고리즘' 정리"

categories:
  - algorithm
tags:
  - data_structure
  - algorithm
  - study
  - book
last_modified_at: 2019-09-19T08:06:00-05:00
---


**추상 데이터 타입(ADT)**은 유사한 동작을 가진 자료구조의 클래스에 대한 수학적 모델이다. 

크게 배열 기반의 **연속** 방식과 포인터 기반의 **연결** 방식으로 분류한다. 파이썬에서 연속 자료구조는 *문자열, 리스트, 튜플 딕셔너리 등* 이고 이번 장에서는 더 특화된 연속 구조의 예와 연결 구조(포인터에 연결된 메모리 청크)를 살펴본다.

## 1. 스택
후입선출(LIFO)구조. 스택의 연산은 다음과 같으며 모두 O(1)이다.
- push : 스택 맨 끝에 항목을 삽입한다.
- pop : 스택 끝 항목을 반환하고 제거한다.
- top/peek : 스택 맨 끝 항목을 조회한다.
- empty : 스택이 비어 있는지 확인한다
- size : 스택 크기를 확인한다.

스택은 깊이우선탐색(DFS)에서 유용하게 사용된다.

### 1.1 리스트로 스택 구현


```python
class Stack(object):
    def __init__(self):
        self.items = []

    def isEmpty(self):
        return not bool(self.items)

    def push(self, value):
        self.items.append(value)

    def pop(self):
        value = self.items.pop()
        if value is not None:
            return value
        else:
            print('Stack is empty')

    def size(self):
        return len(self.items)

    def peek(self):
        if self.items:
            return self.items[-1]
        else:
            print('Stack is Empty')

    def __repr__(self):
        return repr(self.items)
```

### 1.2 노드(객체)의 컨테이너로 스택 구현


```python
class Node(object):
    def __init__(self, value=None, pointer=None):
        self.value = value
        self.pointer = pointer


class Stack(object):
    def __init__(self):
        self.head = None
        self.count = 0

    def isEmpty(self):
        return not bool(self.head)

    def push(self, item):
        self.head = Node(item, self.head)  # 새 노드는 현 스택의 head를 가리킨다.
        self.count += 1

    def pop(self):
        if self.count > 0 and self.head:
            node = self.head
            self.head = node.pointer
            self.count -= 1
            return node.value
        else:
            print('Stack is Empty')

    def peek(self):
        if self.count > 0 and self.head:
            return self.head.value
        else:
            print('Stack is Empty')

    def size(self):
        return self.count

    def _printList(self):
        node = self.head
        while node:
            print(node.value, end=' ')
            node = node.pointer
        print()
```

## 2. 큐
선입선출(FIFO)구조. 큐의 연산은 다음과 같으며 모두 O(1)이다.
- enqueue : 큐 뒤쪽에 항목 삽입
- dequeue : 큐 앞쪽 항목 반환 후 제거
- peek/front : 큐 앞쪽 항목 조회
- empty : 큐가 비어 있는지 확인
- size : 큐의 크기를 확인

너비 우선 탐색(BFS)에서 사용된다. 

### 2.1 큐 구현
`insert()`메소드를 이용하면 O(N)으로 비효율적이다.


```python
class Queue(object):
    def __init__(self):
        self.items = []

    def isEmpty(self):
        return not bool(self.items)

    def enqueue(self, item):
        self.items.insert(0, item)

    def dequeue(self):
        value = self.items.pop()
        if value is not None:
            return value
        else:
            print('Queue is Empty')

    def size(self):
        return len(self.items)

    def peek(self):
        if self.items:
            return self.items[-1]
        else:
            print('Queue is Empty')

    def __repr__(self):
        return repr(self.items)
```

### 2.2 두 개의 스택을 이용한 구현
`insert()` 메서드 쓰는 것보다 효율적이다.


```python
class StackQueue(object):
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def _transfer(self):
        while self.in_stack:
            self.out_stack.append(self.in_stack.pop())

    def enqueue(self, item):
        self.in_stack.append(item)

    def dequeue(self):
        if not self.out_stack:
            self._transfer()
        if self.out_stack:
            return self.out_stack.pop()
        else:
            print('Queue is Empty')

    def size(self):
        return len(self.in_stack) + len(self.out_stack)

    def peek(self):
        if not self.out_stack:
            self._transfer()
        if self.out_stack:
            return self.out_stack[-1]
        else:
            print('Queue is Empty')

    def __repr__(self):
        if not self.out_stack:
            self._transfer()
        if self.out_stack:
            return repr(self.out_stack)
        else:
            print('Queue is Empty')

    def isEmpty(self):
        return not(bool(self.in_stack) or bool(self.out_stack))
```

### 2.3 노드(객체)의 컨테이너로 구현


```python
class Node(object):
    def __init__(self, value=None, pointer=None):
        self.value = value
        self.pointer = None


class LinkedQueue(object):
    def __init__(self):
        self.head = None
        self.tail = None
        self.count = 0

    def isEmpty(self):
        return not(bool(self.head))

    def dequeue(self):
        if self.head:
            value = self.head.value
            self.head = self.head.pointer
            self.count -= 1
            return value
        else:
            print('Queue is Empty')

    def enqueue(self, item):
        node = Node(item)
        if not self.head:
            self.head = node
            self.tail = node
        else:
            if self.tail:
                self.tail.pointer = node
            self.tail = node
        self.count += 1

    def size(self):
        return self.count

    def peek(self):
        return self.head.value

    def _print(self):
        node = self.head
        while node:
            print(node.value, end=' ')
            node = node.pointer
        print()
```

## 3. Deque
스택과 큐의 결합체이다. 양쪽 끝에서 조회, 삽입, 삭제가 가능하다
### 3.1 데크의 구현
큐를 바탕으로 구현할 수 있다.


```python
# from queue import Queue

class Deque(Queue): # 상속
    def enqueue_back(self, item):
        self.items.append(item)
        
    def dequeue_front(self):
        value = self.items.pop(0)
        if value is not None :
            return value
        else:
            print('Deque is Empty')
```

## 3.2 deque 모듈을 이용한 구현
`insert()` 메서드를 사용하지 않아 효율적이다. `q = deque(maxlen=4)`와 같이 데크의 크기를 지정할 수 있다. 또한 `rotate(n)`메서드는 `n`이 양수이면 오른쪽으로, 음수이면 왼쪽으로 `n`만큼 시프트한다.

deque 모듈은 배열이 아닌 이중 연결 리스트를 기반으로 구현되었다.


```python
from collections import deque
q = deque(['버피', '젠더', '윌로'], maxlen=4)
print(q.popleft())
q.rotate(-1)
print(q)
q.rotate(1)
print(q)
```

    버피
    deque(['윌로', '젠더'], maxlen=4)
    deque(['젠더', '윌로'], maxlen=4)


## 4. 우선순위 큐와 힙
스택, 큐와 비슷하지만 각 항목마다 우선순위가 있다. 우선순위가 같으면 큐의 순서를 따른다. 힙을 사용하여 구현한다.

### 4.1 힙
각 노드가 하위 노드보다 작은 이진 트리다.균형 트리의 모양이 수정될 때, 다시 균형 트리로 만드는 시간복잡도는 *O(logN)*이다. 

리스트에서 가장 작은(또는 가장 큰) 요소에 반복적으로 접근하는 프로그램에 유용하다. 가장 작은(큰) 요소를 처리하는 시간복잡도는 *O(1)*이고, 조회, 추가, 수정 연산은 *O(logN)*이다.

### 4.2 heapq 모듈
`heapq.heapify()`함수를 사용하여 *O(N)*시간에 리스트를 힙으로 변환할 수 있다.


```python
import heapq
list1 = [4,6,8,1]
heapq.heapify(list1)
list1
```




    [1, 4, 8, 6]




```python
h = []
heapq.heappush(h, (1,'food'))
heapq.heappush(h, (2,'fun'))
heapq.heappush(h, (3,'work'))
heapq.heappush(h, (4,'study'))
h
```




    [(1, 'food'), (2, 'fun'), (3, 'work'), (4, 'study')]




```python
print(heapq.heappop(list1))
print(list1)
```

    1
    [4, 6, 8]



```python
for x in heapq.merge([1,3,5],[2,4,6]):
    print(x)
```

    1
    2
    3
    4
    5
    6



```python
heapq.nlargest(3, [1,2,3,4,5,6])
```




    [6, 5, 4]



### 4.3 최대 힙 구현하기
> 책 참조할것


```python
class Heapify(object):
    def __init__(self, data=None):
        self.data = data or []
        for i in range(len(data)//2, -1, -1):
            self.__max_heapify__(i)

    def __repr__(self):
        return repr(self.data)

    def parent(self, i):
        if i & 1:
            return i >> 1
        else:
            return (i >> 1) - 1

    def left_child(self, i):
        return (i << 1) + 1

    def right_child(self, i):
        return (i << 1) + 2

    def __max_heapify__(self, i):
        largest = i  # 현재 노드
        left = self.left_child(i)
        right = self.right_child(i)
        n = len(self.data)

        # 왼쪽 자식
        largest = (left < n and self.data[left] > self.data[i]) and left or i
        # 오른쪽 자식
        largest = (right < n and self.data[right] > self.data[largest]) and \
            right or largest

        # 현재 노드가 자식들보다 크다면 Skip, 자식이 크다면 Swap
        if i is not largest:
            self.data[i], self.data[largest] = self.data[largest], self.data[i]
            # print(self.data)
            self.__max_heapify__(largest)

    def extract_max(self):
        n = len(self.data)
        max_element = self.data[0]

        # 첫 번째 노드에 마지막 노드를 삽입
        self.data[0] = self.data[n - 1]
        self.data = self.data[:n - 1]
        self.__max_heapify__(0)
        return max_element

    def insert(self, item):
        i = len(self.data)
        self.data.append(item)
        while (i != 0) and item > self.data[self.parent(i)]:
            print(self.data)
            self.data[i] = self.data[self.parent(i)]
            i = self.parent(i)
        self.data[i] = item


def test_heapify():
    l1 = [3, 2, 5, 1, 7, 8, 2]
    h = Heapify(l1)
    assert(h.extract_max() == 8)
    print("테스트 통과!")


if __name__ == "__main__":
    test_heapify()
```

    테스트 통과!


### 4.4 우선순위 큐 구현하기


```python
import heapq


class PriorityQueue(object):
    def __init__(self):
        self._queue = []
        self._index = 0

    def push(self, item, priority):
        heapq.heappush(self._queue, (-priority, self._index, item))
        self._index += 1

    def pop(self):
        return heapq.heappop(self._queue)[-1]


class Item:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return 'Item({0!r})'.format(self.name)
```

## 5. 연결 리스트
런타임에 저장할 항목의 수를 알 수 없을 때 유용하다. 삽입 *O(1)*, 검색 및 삭제 *O(N)*, 연결 리스트의 뒤부터 순회하거나 정렬하는 경우 *O(N^2)*, 노드의 포인터를 알고 있을 때 삭제 *O(1)*이다.


```python
class Node(object):
    def __init__(self, value=None, pointer=None):
        self.value = value
        self.pointer = pointer

    def getData(self):
        return self.value

    def getNext(self):
        return self.pointer

    def setData(self, newdata):
        self.value = newdata

    def setNext(self, newpointer):
        self.pointer = newpointer
```


```python
class LinkedListLIFO(object):
    def __init__(self):
        self.head = None
        self.length = 0

    # 헤드부터 각 노드의 값 출력
    def _printList(self):
        node = self.head
        while node:
            print(node.value, sep=' ')
            node = node.pointer
    print()

    # 이전 노드를 기반으로 노드를 삭제한다
    def _delete(self, prev, node):
        self.length -= 1
        if not prev:
            self.head = node.pointer
        else:
            prev.pointer = node.pointer

    # 새 노드를 추가한다
    def _add(self, value):
        self.length += 1
        self.head = Node(value, self.head)

    # 인덱스로 노드를 찾는다
    def _find(self, index):
        prev = None
        node = self.head
        i = 0
        while node and i < index:
            prev = node
            node = node.pointer
            i += 1
        return node, prev, i

    # 값으로 노드를 찾는다.
    def _find_by_value(self, value):
        prev = None
        node = self.head
        found = False
        while node and not found:
            if node.value == value:
                found = True
            else:
                prev = node
                node = node.pointer
        return node, prev, found

    # 인덱스 노드를 찾아 삭제
    def deleteNode(self, index):
        node, prev, i = self._find(index)
        if index == i:
            self._delete(prev, node)
        else:
            print(f'인덱스{index}에 해당하는 노드가 없습니다')

    # 값에 해당하는 노드 찾아 삭제
    def deleteNodeByValue(self, value):
        node, prev, found = self._find_by_value(value)
        if found:
            self._delete(prev, node)
        else:
            print(f'값{value}에 해당하는 노드가 없습니다')
```


​    


```python
class LinkedListFIFO(object):
    def __init__(self):
        self.head = None  # 헤드(머리)
        self.length = 0
        self.tail = None  # 테일(꼬리)

    # 헤드부터 각 노드의 값을 출력한다.
    def _printList(self):
        node = self.head
        while node:
            print(node.value, end=" ")
            node = node.pointer
        print()

    # 첫 번째 위치에 노드를 추가한다.
    def _addFirst(self, value):
        self.length = 1
        node = Node(value)
        self.head = node
        self.tail = node

    # 첫 번째 위치의 노드를 삭제한다.
    def _deleteFirst(self):
        self.length = 0
        self.head = None
        self.tail = None
        print("연결 리스트가 비었습니다.")

    # 새 노드를 추가한다. 테일이 있다면, 테일의 다음 노드는
    # 새 노드를 가리키고, 테일은 새 노드를 가리킨다.
    def _add(self, value):
        self.length += 1
        node = Node(value)
        if self.tail:
            self.tail.pointer = node
        self.tail = node

    # 새 노드를 추가한다.
    def addNode(self, value):
        if not self.head:
            self._addFirst(value)
        else:
            self._add(value)

    # 인덱스로 노드를 찾는다.
    def _find(self, index):
        prev = None
        node = self.head
        i = 0
        while node and i < index:
            prev = node
            node = node.pointer
            i += 1
        return node, prev, i

    # 값으로 노드를 찾는다.
    def _find_by_value(self, value):
        prev = None
        node = self.head
        found = False
        while node and not found:
            if node.value == value:
                found = True
            else:
                prev = node
                node = node.pointer
        return node, prev, found

    # 인덱스에 해당하는 노드를 삭제한다.
    def deleteNode(self, index):
        if not self.head or not self.head.pointer:
            self._deleteFirst()
        else:
            node, prev, i = self._find(index)
            if i == index and node:
                self.length -= 1
                if i == 0 or not prev:
                    self.head = node.pointer
                    self.tail = node.pointer
                else:
                    prev.pointer = node.pointer
            else:
                print("인덱스 {0}에 해당하는 노드가 없습니다.".format(index))

    # 값에 해당하는 노드를 삭제한다.
    def deleteNodeByValue(self, value):
        if not self.head or not self.head.pointer:
            self._deleteFirst()
        else:
            node, prev, i = self._find_by_value(value)
            if node and node.value == value:
                self.length -= 1
                if i == 0 or not prev:
                    self.head = node.pointer
                    self.tail = node.pointer
                else:
                    prev.pointer = node.pointer
            else:
                print("값 {0}에 해당하는 노드가 없습니다.".format(value))
```

## 6. 해시 테이블
key를 value에 연결하여 하나의 키가 0 또는 1개의 값과 연관된다. 각 키는 hash function을 계산할 수 있어야 한다. 해시 테이블은 hash bucket의 배열로 구성된다. 해시 값이 42이고 5개의 버킷이 있는 경우 *42%5 = 2*에 매핑한다

두 개의 키가 동일한 버킷에 해시될 때 **해시 충돌** 이를 처리하기 위해 각 버킷에 대해 key-value pair linked list를 저장한다.

조회, 삽입, 삭제 *O(1)*이다. 최악의 경우 각 키가 해시 충돌시 *O(N)*이다.


```python
class HashTableLL(object):
    def __init__(self, size):
        self.size = size
        self.slots = []
        self._createHashTable()

    def _createHashTable(self):
        for i in range(self.size):
            self.slots.append(LinkedListFIFO())

    def _find(self, item):
        return item % self.size

    def _add(self, item):
        index = self._find(item)
        self.slots[index].addNode(item)

    def _delete(self, item):
        index = self._find(item)
        self.slots[index].deleteNodeByValue(item)

    def _print(self):
        for i in range(self.size):
            print(f'슬롯 {i}:')
            self.slots[i]._printList()
```

## 7. 연습문제

### 7.1 스택
데이터를 역순으로 정렬하거나 검색할 때 사용한다. 

#### 문자열 뒤집기


```python
def reverse_string_with_stack(str1):
    stack = Stack()
    revStr = ''
    for ch in str1:
        stack.push(ch)
    while not stack.isEmpty():
        revStr += stack.pop()
    return revStr


str1 = '버피는 천사다'
reverse_string_with_stack(str1)
```




    '다사천 는피버'



#### 괄호의 짝 확인하기


```python
def balance_par_str_with_stack(str1):
    s = Stack()
    balanced = True
    index = 0

    while index < len(str1) and balanced:
        symbol = str1[index]
        if symbol == '(':
            s.push(symbol)
        else:
            if s.isEmpty():
                balanced = False
            else:
                s.pop()
        index += 1
    if not s.isEmpty():
        balanced = False

    return balanced


print(balance_par_str_with_stack('((()))'))
print(balance_par_str_with_stack('(((()))'))
```

    True
    False



```python
# 10진수를 2진수로 변환하기
def dec2bin_with_stack(decNum):
    s = Stack()

    while decNum > 0:
        s.push(decNum % 2)
        decNum = decNum // 2

    res = ''
    while not s.isEmpty():
        res += str(s.pop())
    return res


dec2bin_with_stack(9)  # 1001
```




    '1001'



#### 스택에서 최솟값 조회하기


```python
class NodeWithMin(object):
    def __init__(self, value=None, minimum=None):
        self.value = value
        self.minimum = minimum
    
class StackMin(Stack):
    def __init__(self):
        self.items = []
        self.minimum = None
        
    def push(self, value):
        if self.isEmpty() or self.minimum > value:
            self.minimum = value
        self.items.append(NodeWithMin(value, self.minimum))
        
    def peek(self):
        return self.items[-1].value
    
    def peekMinimum(self):
        return self.items[-1].minimum
    
    def pop(self):
        item = self.items.pop()
        if item:
            if item.value == self.minimum:
                self.minimum = self.peekMinimum
        else:
            print('Stack is Empty')
            
    def __repr__(self):
        aux = []
        for i in self.items:
            aux.append(i.value)
        return repr(aux)
```

#### 스택 집합
스택에 '용량'이 있을 때 초과 시에 새 스택을 만들어야 한다. 이 경우 여러 스택의 집합에서도 단일 스택과 같이 `pop()`과 `push()`를 하려면?


```python
class SetOfStacks(Stack):
    def __init__(self, capacity=4):
        self.setofstacks = []
        self.items = []
        self.capacity = 4
        
    def push(self, value):
        if self.size() >= self.capacity:
            self.setofstacks.append(self.items)
            self.items = []
        self.items.append(value)
    
    def pop(self):
        value = self.items.pop()
        if self.isEmpty() and self.setofstacks:
            self.items = self.setofstacks.pop()
        return value
    
    def sizeStack(self):
        return len(self.setofstacks) * self.capacity + self.size()
    
    def __repr__(self):
        aux = []
        for s in self.setofstacks:
            aux.extend(s)
        aux.extend(self.items)
        return repr(aux)
```

### 7.2 큐
#### 데크와 회문


```python
from collections import deque
import string

def palindrome_checker_with_deque(str1):
    STRIP = string.whitespace + string.punctuation + "\"'"
    
    dq = deque()
    
    for i in str1.lower():
        if i not in STRIP:
            dq.append(i)
    
    while len(dq) > 1:
        if dq.popleft() != dq.pop():
            return False
    else:
        return True

str1 = 'Madam Im Adam'
str2 = 'Buffy is a Slayer'
print(palindrome_checker_with_deque(str1))
print(palindrome_checker_with_deque(str2))
```

    True
    False


#### 큐와 동물 보호소


```python
class Node(object):
    def __init__(self, animalName=None, animalKind=None, pointer=None):
        self.animalName = animalName
        self.animalKind = animalKind
        self.pointer = pointer
        self.timestamp = 0


class AnimalShelter(object):
    def __init__(self):
        self.headCat = None
        self.headDog = None
        self.tailCat = None
        self.tailDog = None
        self.animalNumber = 0

    def enqueue(self, animalName, animalKind):
        self.animalNumber += 1
        newAnimal = Node(animalName, animalKind)
        newAnimal.timestamp = self.animalNumber

        if animalKind == "cat":
            if not self.headCat:
                self.headCat = newAnimal
            if self.tailCat:
                self.tailCat.pointer = newAnimal
            self.tailCat = newAnimal

        elif animalKind == "dog":
            if not self.headDog:
                self.headDog = newAnimal
            if self.tailDog:
                self.tailDog.pointer = newAnimal
            self.tailDog = newAnimal

    def dequeueDog(self):
        if self.headDog:
            newAnimal = self.headDog
            self.headDog = newAnimal.pointer
            return str(newAnimal.animalName)
        else:
            print("개가 없습니다!")

    def dequeueCat(self):
        if self.headCat:
            newAnimal = self.headCat
            self.headCat = newAnimal.pointer
            return str(newAnimal.animalName)
        else:
            print("고양이가 없습니다!")

    def dequeueAny(self):
        if self.headCat and not self.headDog:
            return self.dequeueCat()
        elif self.headDog and not self.headCat:
            return self.dequeueDog()
        elif self.headDog and self.headCat:
            if self.headDog.timestamp < self.headCat.timestamp:
                return self.dequeueDog()
            else:
                return self.dequeueCat()
        else:
            print("동물이 없습니다.")

    def _print(self):
        print("고양이:")
        cats = self.headCat
        while cats:
            print("\t{0}".format(cats.animalName))
            cats = cats.pointer
        print("개:")
        dogs = self.headDog
        while dogs:
            print("\t{0}".format(dogs.animalName))
            dogs = dogs.pointer


if __name__ == "__main__":
    qs = AnimalShelter()
    qs.enqueue("밥", "cat")
    qs.enqueue("미아", "cat")
    qs.enqueue("요다", "dog")
    qs.enqueue("울프", "dog")
    qs._print()

    print("하나의 개와 고양이에 대해서 dequeue를 실행합니다.")
    qs.dequeueDog()
    qs.dequeueCat()
    qs._print()
```

    고양이:
    	밥
    	미아
    개:
    	요다
    	울프
    하나의 개와 고양이에 대해서 dequeue를 실행합니다.
    고양이:
    	미아
    개:
    	울프


### 7.3 우선순위 큐와 힙
시퀀스에서 N개의 가장 큰 항목과 가장 작은 항목을 찾아보자


```python
import heapq


def find_N_largest_items_seq(seq, N):
    return heapq.nlargest(N, seq)


def find_N_largest_items_seq(seq, N):
    return heapq.nsmallest(N, seq)
```

정렬된 두 시퀀스를 적은 비용으로 병합해보자. *O(logN)*


```python
import heapq

def merge_sorted_seqs(seq1, seq2):
    result = []
    for c in heapq.merge(seq1, seq2):
        result.append(c)
    return result
```

### 7.4 연결 리스트
#### 끝에서 k번째 항목 찾기


```python
# p1 : 연결 리스트 전부 순회
# p2 : k-1 이후를 순회
class KthFromLast(LinkedListFIFO):
    def find_kth_to_last(self, k):
        p1, p2 = self.head, self.head
        i = 0
        while p1:
            if i > k-1:
                try:
                    p2 = p2.pointer
                except AttributeError:
                    break
            p1 = p1.pointer
            i += 1
        return p2.value
```

#### 연결 리스트 분할하기
항목의 왼쪽에는 작은 숫자, 오른쪽에는 큰 숫자가 나오도록 분할해보자


```python
def partList(ll, n):
    more = LinkedListFIFO()
    less = LinkedListFIFO()
    
    node = ll.head

    while node:
        item = node.value
        if item < n:
            less.addNode(item)
        else:
            more.addNode(item)
        
        node = node.pointer
    less.addNode(n)
    nodemore = more.head
    while nodemore:
        less.addNode(nodemore.value)
        nodemore = nodemore.pointer
        
    return less
    
ll = LinkedListFIFO()
l = [6, 7, 3, 4, 9, 5, 1, 2, 8]
for i in l:
    ll.addNode(i)
newll = partList(ll, 6)
newll._printList()
```

    3 4 5 1 2 6 6 7 9 8 


#### 이중 연결 리스트와 FIFO


```python


class DNode(object):
    def __init__(self, value=None, pointer=None, previous=None):
        self.value = value
        self.pointer = pointer
        self.previous = previous


class DLinkedList(LinkedListFIFO):
    def printListInverse(self):
        node = self.tail
        while node:
            print(node.value, end=" ")
            try:
                node = node.previous
            except AttributeError:
                break
        print()

    def _add(self, value):
        self.length += 1
        node = DNode(value)
        if self.tail:
            self.tail.pointer = node
            node.previous = self.tail
        self.tail = node

    def _delete(self, node):
        self.length -= 1
        node.previous.pointer = node.pointer
        if not node.pointer:
            self.tail = node.previous

    def _find(self, index):
        node = self.head
        i = 0
        while node and i < index:
            node = node.pointer
            i += 1
        return node, i

    def deleteNode(self, index):
        if not self.head or not self.head.pointer:
            self._deleteFirst()
        else:
            node, i = self._find(index)
            if i == index:
                self._delete(node)
            else:
                print("인덱스 {0}에 해당하는 노드가 없습니다.".format(index))


if __name__ == "__main__":
    from collections import Counter

    ll = DLinkedList()
    for i in range(1, 5):
        ll.addNode(i)
    print("연결 리스트 출력:")
    ll._printList()
    print("연결 리스트 반대로 출력:")
    ll.printListInverse()
    print("값이 15인 노드 추가 후, 연결 리스트 출력:")
    ll._add(15)
    ll._printList()
    print("모든 노드 모두 삭제 후, 연결 리스트 출력:")
    for i in range(ll.length-1, -1, -1):
        ll.deleteNode(i)
    ll._printList()
```

    연결 리스트 출력:
    1 2 3 4 
    연결 리스트 반대로 출력:
    4 3 2 1 
    값이 15인 노드 추가 후, 연결 리스트 출력:
    1 2 3 4 15 
    모든 노드 모두 삭제 후, 연결 리스트 출력:
    연결 리스트가 비었습니다.


​    

#### 회문 확인하기
------------------
> 일단 여기까지
