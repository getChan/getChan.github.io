---
title: "파이썬 백엔드(4)-인증"
excerpt: "책 '깔끔한 파이썬 탄탄한 백엔드' 공부 자료입니다"

categories:
  - web
tags:
  - book
  - study
  - python
  - flask
  - web
  - backend
last_modified_at: 2019-10-24T08:06:00-05:00
---
# 인증(authentication)

로그인 기능을 구현해 주는 것이 인증 엔드포인트다. 절차는 다음과 같다.
1. 회원가입
2. id, password를 db에 저장한다. 비밀번호는 암호화해서 저장한다.
3. 로그인할 때 아이디와 비밀번호를 입력한다
4. 암호화되어 db에 저장된 비밀번호와 비교한다
5. 비밀번호 일치하면 로그인 성공
6. 로그인 성공하면 access token을 클라이언트에 전송
7. 로그인 성공 이후부터는 access token을 첨부하여 request를 서버에 전송함으로써 매번 로그인하지 않아도 된다.

# 사용자 비밀번호 암호화

암호화하는 이유
1. 외부의 해킹 공격에 의해 db가 노출되었을 경우를 대비
2. 내부 인력에 의해 db가 노출될 경우를 대비

비밀번호 암호화 시에는 단방향 해시 함수가 쓰인다. 복호화하지 못하게 하기 위함이다.
```python
import hashlib
m = hashlib.sha256() # sha256 암호 알고리즘을 사용한다
m.update(b'test password')
m.hexdigest() # 암호화된 값을 hex(16진수)로 읽어 들인다.
```
## Bcrypt

단방향 해시 암호 알고리즘도 해킹 가능하다. rainbow attack은 해시 값을 계산해 놓은 테이블을 생성해 놓은 후 해시 함수 값을 역추적해서 본래 값을 찾아낸다.

이러한 취약점을 보완하기 위한 방법이 있다.

### salting

실제 비밀번호 이외에 추가적으로 랜덤 데이터를 더해서 해시 값을 계산하는 방법

### key stretching

기존 해시 알고리즘들의 실행 속도가 너무 빠르다는 취약점을 보완하기 위해 단방향 해시 값을 계산한 후 그 해시 값을 또 해시하고... 반복하는 방법이다.

두 가지를 구현한 해시 함수 중 가장 널리 사용되는 것이 bcrypt이다. `pip install bcrypt`명령어로 라이브러리를 설치하자.
```python
import bcrypt
# 해시 값과 salt 값을 받아 해시화한다.
bcrypt.hashpw(b'secret password', bcrypt.gensalt())
```

# access token

로그인 성공 후에는 백엔드 api 서버가 access token을 클라이언트에게 전송한다. 이후 클라이언트는 access token을 HTTP request에 첨부하여 전송한다.

HTTP는 stateless다. 따라서 로그인 정보 또한 HTTP request에 첨부해야 로그인된 상태임을 알 수 있다. 이 로그인 정보가 access token이다.

## JWT(JSON Web Tokens)

access token의 생성 기술이다. JSON 데이터를 token으로 변화하는 방식이다.

1. 사용자는 로그인 정보를 담아 서버에 전송한다.
2. 벡엔드는 인증이 되면 사용자의 아이디를 JSON 형태로 생성한다.
3. 이 JSON 데이터를 token 데이터로 변환(암호화)시켜서 HTTP response한다.
4. 클라이언트는 받은 access token을 쿠키 등에 저장해서 request시에 첨부해서 보낸다.
5. 서버는 access token을 복호화해서 JSON 데이터를 얻어 사용자 아이디를 읽는다.

### JWT 구조

- header
- payload
- signature

#### header

토큰 타입(JWT)과 해시 알고리즘을 지정한다.
```json
{
  "alg" : "HS256",
  "typ" : "JWT"
}
```
이를 Base64URL 방식으로 코드화해서 JWT의 첫 부분을 구성한다.

#### payload

데이터 부분이다. 
```json
{
  "user_id" : 2,
  "exp" : 1539517391
}
```
이를 Base64URL 방식으로 코드화해서 JWT의 두번쨰를 구성한다. 암호화가 아니므로 보안이 필요한 정보는 넣지 않는다.

#### signature

JWT가 원본 그대로라는 것을 확인해주기 위함이다. 코드화된 header와 payload, JWT secret를 헤더에 지정된 암호 알고리즘으로 암호화하여 전송한다.(복호화가 가능한 암호)

signature 외에 다른 부분은 암호화되어있지 않으므로 주의해야 한다.

### PyJWT
```python
import jwt
data_to_encode ={'some' : 'payload'}
encryption_secret = 'secret' # 암호화에 사용할 secret key
algorithm = 'HS256'
encoded = jwt.encode(data_to_encode, encryption_secret, algorithm=algorithm)
```