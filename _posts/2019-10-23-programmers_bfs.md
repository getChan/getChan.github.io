---
title:  "알고리즘-가장 먼 노드(BFS)"
excerpt: "프로그래머스 알고리즘 문제풀이"

categories:
  - algorithm
tags:
  - python
  - algorithm
  - BFS
last_modified_at: 2019-10-23T08:06:00-05:00
---
> 전형적인 BFS 문제인데 풀지 못했다. 꼭 기억해두도록 하자.

# 문제
가장 먼 노드 (https://programmers.co.kr/learn/courses/30/lessons/49189?language=python3)

# 풀이

1. 문제조건 해석

    먼저, 현재 노드로부터 가장 멀리 떨어진 노드와의 최단거리를 찾는다. 

    이 최단거리들 중, 가장 큰 값을 가지는 거리의 개수를 찾는 문제다.

2. 알고리즘

    전형적인 BFS 문제

3. 코드
```python
from collections import deque, defaultdict
def solution(n, edge):
    dists = {i:0 for i in range(1, n+1)} # 노드 1과 다른 노드 사이의 거리
    edges = defaultdict(list) # edges[node_no]에는 node_no 노드에 연결된 노드정보를 리스트로 담습니다.
    for u, v in edge:
        edges[u].append(v)
        edges[v].append(u)
    
    # 노드 1부터, BFS 순회를 하며 연결된 노드들을 탐색합니다.
    queue = deque(edges[1])
    level = 1
    dists[1] = -1 # 1로 시작해서 1로 돌아오는 거리는 필요하지 않습니다.
    while queue:
        # 현재 큐에 들어있는 노드들은 같은 레벨입니다.
        size = len(queue)
        for i in range(size):
            v = queue.popleft()
            
            # 방문하지 않은 노드의 경우, 거리를 입력하고,
            # 해당 노드와 연결된 모든 노드들을 큐에 담습니다.
            if dists[v] == 0: # 첫 방문
                dists[v] = level
                for n in edges[v]:
                    queue.append(n)
        level += 1
        
    answer = 0
    maximum = max(dists.values())
    for i in dists.values():
        if i == maximum:
            answer += 1
    return answer
```