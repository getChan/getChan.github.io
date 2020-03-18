---
title:  "Python Startup Script"
excerpt: "파이썬 파일/인터프리터 실행 전 스타트업 스크립트 실행하기"
categories:
  - TIL
tags:
  - python
last_modified_at: 2020-03-18T08:06:00-05:00
---

# Python Startup Script

파이썬 파일 또는 인터랙티브 쉘(jupyter notebook, ipython 포함)을 실행할 때마다 다른 파이썬 스크립트를 사전 설정하고 싶으면 어떻게 해야 할까? `$ python a.py` 와 같이 파일을 실행하는 경우와 `$ python` 명령어로 인터랙티브 쉘을 실행하는 경우 설정 방법이 다르다. 알아보자!

## `*.py` 파일 실행하는 경우

스타트업 스크립트를 `sitecustomize.py` 라는 파일명으로 site-packages 디렉토리에 저장하면 된다.

site-packages 디렉토리는 파이썬에서 다음처럼 알아낼 수 있다.

```sh
>>> import site
>>> site
<module 'site' from '/usr/lib/python3.6/site.py'>
```

해당 경로 디렉토리 `/usr/lib/python3.6/`에 `sitecustomize.py` 파일을 작성해보자

```python
# sitecustomize.py
print('startup...')
```

```python
# a.py
print('main')
```

```sh
$ python3.6 a.py
startup..
main
```

의도했던 결과를 얻었다!

파이썬 파일을 실행하는 경우 스타트업 스크립트의 변수들이 전역변수로 남아있지 않는다. 그러나, `warnings('ignore')` 와 같은 메서드 실행의 결과는 남아 유지된다.

## 인터랙티브 쉘

인터랙티브 쉘, ipython, jupyter notebook의 경우 `PYTHONSTARTUP='PATH/startup.py'` 와 같이 환경변수를 설정해주면 된다.

```python
# startup.py
print('startup...')
```

```sh
$ export PYTHONSTARTUP='startup.py'
```

환경변수로 스타트업 스크립트의 경로와 파일명을 설정해주고 실행해보자.

```sh
$ python
Python 3.7.4 (default, Aug 13 2019, 20:35:49) 
[GCC 7.3.0] :: Anaconda, Inc. on linux
Type "help", "copyright", "credits" or "license" for more information.
startup..
>>> 
```

인터랙티브 쉘의 경우 스타트업에서 실행한 변수들이 그대로 전역변수로 남아있게 된다.

# Reference

https://www.assertnotmagic.com/2018/06/30/python-startup-file/

https://stackoverflow.com/questions/11404165/python-startup-script/12737010

https://www.assertnotmagic.com/2018/06/30/python-startup-file/