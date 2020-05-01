---
title: "파이썬 subprocess"
excerpt: "파이썬으로 스크립트 실행하기"
categories:
  - TIL
tags:
  - python
  - script
last_modified_at: 2020-05-01T08:06:00-05:00
---

스크립트를 파이썬으로 작성하면 가독성과 유지보수성을 향상시킬 수 있다. 또한 파이썬으로 시작한 자식 프로세스를 병렬로 실행할 수 있어서 CPU를 많이 사용하는 작업을 관리하고 조절하기 쉽다. *반면 파이썬 프로세스 자체는 병렬처리가 까다롭다.*

# Subprocess

subprocess 내장 모듈을 통해 자식 프로세스를 쉽게 관리할 수 있다.

`Poen`생성자는 프로세스를 생성한다. `communicate`메서드는 자식 프로세스의 출력을 읽어오고 종료할 때까지 기다린다.

```python
proc = subprocess.Popen(
	['echo', 'Hello from the child!'],
  stdout=subprocess.PIPE)
out, err = proc.commmunicate()
print(out,decode('utf-8'))

# Hello from the child!
```

자식 프로세스는 부모 프로세스와 파이썬 인터프리터와는 독립적으로 실행된다. 자식 프로세스의 상태는 파이썬이 다른 작업을 하는 동안 주기적으로 polling 된다.

```python
proc = subprocess.Popen(['sleep', '0.3'])
while proc.poll() is None:
  print('Working...')
  # 시간이 걸리는 작업을 수행
print('Exit Status', proc.poll())

# Working...
# Working...
# Exit Status 0
```

Pipe를 이용해 데이터를 subprocess로 보낸 다음 subprocess의 결과를 받아올 수 있다. 또한 받아온 결과를 다른 프로세스의 입력으로 연결하여 병렬 프로세스 체인을 생성할 수도 있다.

```python
def run_openssl(data):
  env = os.environ.copy()
  env['password'] = b'password'
  proc = subprocess.Popen(
  	['openssl', 'enc', '-des3', '-pass', 'env:password'],
  	env=env,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE)
  proc.stdin.write(data)
  proc.stdin.flush() # 자식 프로세스가 반드시 입력을 받게끔 함
  return proc
  
def run_md5(input_stdin):
  proc = subprocess.Popen(
  	['md5'],
  	stdin=input_stdin,
  	stdout=subprocess.PIPE)
 	return proc
  
  
# openssl로 데이터를 암호화하는 프로세스 집합 결과를
# md5로 해시하는 프로세스 집합에 연결한다.
input_procs = []
hash_procs = []

for _ in range(3):
  data = os.urandom(10)
  proc = run_openssl(data)
  input_procs.append(proc)
  hash_proc = run_md5(proc.stdout)
  hash_procs.append(hash_proc)
  
for proc in input_procs:
  proc.communicate()
for proc in hash_procs:
  out, err = proc.communicate()
  print(out.strip())
  # b'7a1207387120391.....'
```

자식 프로세스가 deadlock에 빠지거나 입력 또는 출력 파이프에서 블록될 염려가 있다면 `communication` 메서드에 `timeout`파라미터를 넘겨야 한다.

```python
proc = subprocess.Popen(['sleep', str(10)])
try:
  proc.communicate(timeout=0.1)
except subprocess.TimeoutExpired:
  proc.terminate()
  proc.wait()

print('Exit status', proc.poll()) # Exit Status -15
```



# Reference

책 *파이썬 코딩의 기술. 브렛 슬라킨*

