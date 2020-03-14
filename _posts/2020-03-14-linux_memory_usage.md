---
title:  "Linux 메모리 사용량, 명목 메모리와 실질 메모리"
excerpt: "리눅스에서 명목 메모리와 실질 메모리의 차이"
categories:
  - TIL
tags:
  - linux
  - os
last_modified_at: 2020-03-14T08:06:00-05:00
---

리눅스에서 메모리 사용량을 확인하기 위해`free, sar, top` 등의 커맨드로 명령어를 내려보면, `free`가 실제 사용 가능한 유휴 메모리라고 생각할 수 있다. 그러나, `free`의 경우 **사용 가능한** 메모리가 아닌 **실제로 사용되지 않는** 메모리 용량이다. 사용 가능한 메모리 자원을 확인하려면 cache와 buffer를 더한 값을 확인해야 한다.

리눅스는 사용되고 있지 않은 메모리를  캐시와 버퍼에 할당해서 조금이라도 일을 시키려고 한다.

Buffer

- 파일에 write 명령이 내려지면 리눅스는 바로 명령을 수행하지 않고 CPU가 바쁘지 않을 때 명령을 수행한다. 이때 데이터를 담아두는 곳.

Cache

- 메모리에 적재되었던 데이터를 일시적으로 보관하고 있는 공간
- 디스크 입출력 연산의 빈도를 줄여서 자주 사용하는 프로그램을 빠르게 실행할 수 있다.

![img](https://techiess.files.wordpress.com/2010/09/fig03.gif?w=330)

어쨌든, 리눅스의 메모리 사용량을 제대로 측정하기 위해서는 $Total - Free / Total$이 아니라 $ Total - active / Total $으로 측정해야 한다는 것이다. **아무것도 하지 않았는데 메모리 사용량이 97% 가까이 된다고 해서 놀라지 말자!**

![image-20200314151722958](/assets/images/TIL/image-20200314151722958.png)

# Reference

https://techiess.com/2010/09/09/about-memory-on-linux/