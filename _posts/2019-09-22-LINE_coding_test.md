---
title:  "라인 채용연계형 인턴십 온라인 코딩 테스트"
excerpt: "LINE 2019하반기 채용연계형 인턴십 코딩 테스트"

categories:
  - web
tags:
  - data_structure
  - algorithm
  - test
last_modified_at: 2019-09-22T08:06:00-05:00
---

# 1. 메시지 큐

```python
message, consumer = map(int, input().strip().split(' '))
process = []
for _ in range(message):
    process.append(int(input()))

queueList = [[] for _ in range(consumer)]
time = 0
for queue in queueList:
    if process:
        queue.append(process.pop(0))
    else:
        break

while process or list(filter(None, queueList)):
    time += 1
    for queue in queueList:
        if queue:
            queue[0] -= 1
            if queue[0] == 0:
                queue.pop(0)
                if process:
                    queue.append(process.pop(0))
            
        

print(time)
```

# 2.K번째 순열

```python
from itertools import permutations
numbers = list(map(int, input().strip().split()))
k = int(input())

numbers.sort()

for i, v in enumerate(permutations(numbers)):
    if i == k-1:
        print(''.join(map(str,v)))
```

# 3. 화장실 문제

```python
n = int(input())
time = []
for _ in range(n):
    time.append([int(x) for x in input().split()])
    
toilet = [] # queue
time.sort(key=lambda x:x[0])
timer = 0
maximum = 0
while time or toilet:
    for t in time:
        if t[0] == timer:
            toilet.append(time.pop(0)[1])
    timer += 1
    for i, toil in enumerate(toilet):
        if toilet[i] == timer:
            toilet.pop(0)
    if maximum < len(toilet):
        maximum = len(toilet)
    
print(maximum)
```

# 4. 지하철 좌석 문제

```python
n = int(input())
seats = [int(x) for x in input().split()]

maximum = 0
cnt = 0
for i, v in enumerate(seats):
    
    if v == 0 :
        cnt += 1
        if i+1 == n: #끝이 0이면
            if cnt > maximum:
                maximum = cnt    
    else:
        if i-cnt == 0 and seats[i-cnt]==0: #시작이 0이면
            if cnt > maximum:
                maximum = cnt

        if cnt % 2 == 0: #짝수면
            if cnt//2 > maximum:
                maximum = cnt //2
        else:#홀수면
            if (cnt+1)//2 > maximum:
                maximum = (cnt+1) //2
        cnt = 0
    # print(cnt)
    # print(maximum)
print(maximum)
```

# 5. 코니 잡기

```python
def memo(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper
@memo 
def dfs(x,y, depth):
    global koni
    global maximum
    if x > koni[0] or y > koni[1]:
        return 0
    if [x, y] == koni:
        maximum = depth
        return 1
    return dfs(x+1, y, depth+1) + dfs(x, y+1, depth+1)
    
width, height = [int(x) for x in input().split()]
koni = [int(x) for x in input().split()]
maximum = 0
if koni[0] > width or koni[1] > height or width == 0 or height == 0:
    print(fail)
else:
    print(dfs(0, 0, 0))
    print(maximum)
```

# 6. 출력 문제

```python
n, align = input().split()
n = int(n)
numbers = []
maxsize = 0
for _ in range(n):
    size, num = input().split()
    if size > maxsize:
        maxsize = size
    numbers += [int(size), num]
```
