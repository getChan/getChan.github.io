---
title: "파이썬 백엔드 (2)-본격적으로 API 개발하기"
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
last_modified_at: 2019-10-18T08:06:00-05:00
---
미니 트위터를 구현해보자. 핵심 기능들은 다음과 같다
- 회원가입
- 로그인
- 트윗
- 다른 회원 팔로우하기
- 다른 회원 언팔로우하기
- 타임라인

## 회원가입
사용자에게 다음의 정보를 HTTP요청을 통해 받은 후 저장한다. 
- id
- name
- email
- password
- profile

```python
from flask import Flask, jsonify, request

app = Flask(__name__)
app.users = {} # 가입한 사용자를 저장할 딕셔너리
app.id_count = 1 # 사용자의 id

@app.route('/ping', methods=['GET'])
def ping():
  return 'pong'

@app.route('/sign-up', methods=['POST']) # route 데코레이터로 엔드포인트를 정의
def sign_up():
  # request는 엔드포인트에 전송된 HTTP request 정보를 가지고 있다. 
  # request.json은 json 데이터를 딕셔너리로 변환해준다.
  new_user = request.json
  # 전송된 회원가입 정보에 id값을 더해준다.
  new_user['id'] = app.id_count
  # 사용자 정보를 딕셔너리에 저장한다.
  app.users[app.id_count] = new_user
  app.id_count = app.id_count + 1

  # 회원가입 정보를 json으로 전송한다. 
  return jsonify(new_user)
```
다음과 같이 실행하자. `FLASK_ENV`를 `development`로 설정하면 debug mode로 실행한다. 
```shell
FLASK_ENV=development FLASK_APP=app.py flask run
```
회원가입 요청을 보내보자
```shell
http -v POST localhost:5000/sign-up name=남궁찬 email=chan@gmail.com password=1234
```

## 300자 체한 트윗 올리기

다음과 같은 기능을 구현해야 한다
- 사용자는 300자를 초과하지 않는 글을 올릴 수 있다.
- 300자를 초과하면 `400 BAD REQUEST` 응답을 보낸다.
- 300자 이내의 글을 전송하면 엔드포인트는 글을 저장해야 한다. 이후 타임라인 엔트포인트를 통해 읽을 수 있어야 한다.

전송하는 엔트포인트는 다음과 같다.
```json
{
  "id" : 1,
  "tweet" : "My First Tweet"
}
```
**직접** 구현해보자!
```python
app.tweets = []

@app.route("./tweet", methods=['POST'])
def tweet():
  payload = request.json
  user_id = int(payload["id"])
  tweet = payload["tweet"]

  if user_id not in app.users:
    return '사용자가 존재하지 않습니다.', 400

  if len(tweet) > 300:
    return '300자를 초과했습니다.', 400

  app.tweets.append({
    'user_id' : user_id,
    'tweet' : tweed
  })

  return '', 200
```
```shell
http -v POST localhost:5000/tweet id=1 tweet="My First Tweet"
```
데이터들을 메모리에만 저장하므로 API가 재실행되면 데이터는 전부 지워진다.

## 팔로우와 언팔로우 엔드포인트

팔로우 혹은 언팔하고 싶은 사용자의 아이디를 HTTP request 하면 처리하는 방식으로 구현해보자. 엔드포인트에 전송할 JSON은 다음과 같다
```json
# 팔로우 엔트포인트
{
  "id" : 1,
  "follow" : 2
}
```
```json
# 언팔로우 엔드포인트
{
  "id" : 1,
  "unfollow" : 2
}
```
**직접** 구현해보자
```python
@app.route("/follow", method=["POST"])
def follow():
  payload = request.json
  user_id = int(payload['id'])
  user_id_to_follow = int(payload['follow'])

  if user_id not in app.users or user_id_to_follow not in app.users:
    return '사용자가 존재하지 않습니다', 400
  
  user = app.users[user_id]
  user.setdefault('follow', set()).add(user_id_to_follow) # defaultdict
  
  return jsonify(user)
```
팔로우 HTTP 요청을 보자보자 어디보자 
```shell
http -v POST localhost:5000/follow id=1 follow=2
```
에러가 발생한다. set을 json으로 변경하지 못하기 때문이다. JSONEncoder를 상속받아 수정해야 한다.
```python
from flask.json import JSONEncoder

class CustomJSONEncoder(JSONEncoder): # 상속받아 커스텀 인코더 구현
  def default(self, obj): # 메소드를 오버라이딩한다.
    if isinstance(obj, set): # 객체가 set인 경우 list로 변환하여 return
      return list(obj)
    return super().default(self, obj)# set이 아닌 경우 기존 클래스의 default 메소드 호출하여 return

# Flask의 default JSON encoder로 지정해준다. 
# jsonify 함수 실행 시마다 CustomJSONEncoder 클래스가 사용된다.
app.json_encoder = CustomJSONEncoder

```
언팔로우 엔트포인트를 구현해보자.
```python
@app.route("unfollow", methods=["POST"])
def unfollow():
  payload = request.json
  user_id = int(payload['id'])
  user_id_to_unfollow = int(payload['unfollow'])

  user = app.users[user_id]
  user.setdefault('follow', set()).discard(user_id_to_unfollow)

  return jsonify(user)
```

## 타임라인 엔드포인트
해당 사용자의 트윗들과 팔로우하는 사용자들의 트윗들을 리턴해주는 엔드포인트를 구현해 보자. 데이터 수정 없이 조회만 하므로 GET메서드를 사용한다. 리턴하는 JSON 데이터는 다음과 같다.
```json
{
  "user_id" : 1,
  "timeline" : [
    {
      "user_id" : 2,
      "tweet" : "Hello World!"
    },
    {
      "user_id" : 1,
      "tweet" : "My first tweet!"
    }
  ]
}
```
구현해보자.
```python
# 엔드포인트에 지정된 인자를 int값으로 지정한다. 매개변수로 사용한다.
@app.route('/timeline/<int:user_id>', methods=['GET'])
def timeline(user_id): # 엔드포인트 주소로 받는 인자를 매개변수로 받아온다.
  if user_id not in app.users:
    return '사용자가 존재하지 않습니다.', 400
  
  follow_list = app.users[user_id].get('follow', set()) # 사용자가 팔로우 없을 경우 빈 set을 반환한다.
  follow_list.add(user_id) # 사용자의 트윗도 보기 위함
  timeline = [tweet for tweet in app.tweets if tweet['user_id'] in follow_list]

  return jsonify({
    'user_id' : user_id,
    'timeline' : timeline
  })
```
실행해보자.
```shell
http -v GET localhost:5000/timeline/1
```

## 정리
- 데이터 수정하는 기능은 POST를 사용한다
- 데이터를 조회하는 기능은 GET을 사용한다.
- POST 엔드포인트에 데이터 전송할 때는 body에 JSON 형식으로 전송한다.
- URL에 parameter를 전송하고 싶을 때는 `<type:value>` 형식으로 URL을 구성한다. 