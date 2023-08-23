-

title: "Implement LRU cache by python in O(1)"
excerpt: "orderedDict를 이용한 LRU cache 구현"
categories:
  - TIL
tags:
  - python
  - data structure
  - hash
last_modified_at: 2020-10-04T08:06:00+09:00
---

python의 내장 자료구조인 **OrderedDict** 를 활용하면 LRU 알고리즘을 *O(1)* 시간에 구현할 수 있다.

# 코드

```python
from collections import OrderedDict
def LRU(cacheSize, keys):
  cache = OrderedDict()
  for key in keys:
    if key in cache: # cache hit
      cache.move_to_end(key)
    else: # cache miss
      cache[key] = None # dummy value
      if len(cache) > cacheSize:
        cache.popitem(last=False)
```
