---
title: "파이썬 백엔드(3)-데이터베이스"
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
  - db
last_modified_at: 2019-10-22T08:06:00-05:00
---
> Google Cloud Platform 에 만든 VM에 DB를 구축하고 실습했다.
> CentOS, MariaDB 사용.
## API에 데이터베이스 연결하기
일단. 데이터베이스에 접속하자
```shell
mysql -u root -p 
# -u : 접속할 사용자의 아이디(root)를 명시, -p : 비밀번호 직접 입력
```
### DB 생성하기
DB 생성
```sql
CREATE DATABASE miniter;
```
DB 사용하겠다
```sql
USE miniter;
```
Table 생성하자
```sql
CREATE TABLE users(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  profile VARCHAR(2000) NOT NULL,
  -- 값이 없으면 디폴트로 현재 timestamp를 사용해라.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 해당 row가 update 되면 현재 timestamp 사용해라. 
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  -- 고유키로 사용될 컬럼을 지정, 여러 컬럼이 올 수 있다.
  PRIMARY KEY (id),
  -- 해당 칼럼의 값이 중복되는 row가 없어야 한다. 중복 이메일 방지
  UNIQUE KEY email (email)
);

CREATE TABLE users_follow_list(
  user_id INT NOT NULL,
  follow_user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, follow_user_id),
  -- 외부 키를 걸 수 있다.
  CONSTRAINT users_follow_list_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT users_follow_list_follow_user_id_fkey FOREIGN KEY (follow_user_id) REFERENCES users(id)
);

CREATE TABLE tweets(
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  tweet VARCHAR(300) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT tweets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);
```
`show tables;` 와 `explain <테이블명>;`으로 확인해보자.

## SQLAlchemy
파이썬 코드에서 DB 연결하여 SQL실행 가능하다. SQLAlchemy는 ORM(Object Relational Mapper)이다. 필요한 라이브러리를 설치하자
```shell
conda activate api
conda install sqlalchemy
conda install mysql-connector-python
```
db연결 정보를 저장할 파일을 만들자.
```python

db = {
  'user' : 'chan',
  'password' : 'boazadv',
  'host' : 'localhost'
  'port' : 3306,
  'database' : 'miniter'
}

db_url = f"mysql+mysqlconnector://{db[user]}:{db[password]}@{db[host]}:{db[port]}/{db[database]}?charset=utf8"
```
설정 파일을 읽어 db와 연결하자
```python
from flask import Flask, jsonify
from sqlalchemy import create_engine, text

# Flask가 자동으로 create_app이름의 함수를 factory 함수로 인식해서 해당 함수를 통해 Flask를 실행시킨다.
# test_config 매개변수는 단위 테스트 시에 테스트용 db의 설정을 적용하기 위함이다.
def create_app(test_config = None):
  app = Flask(__name__)

  if test_config is None:
    app.config.from_pyfile('config.py')
  else:
    app.config.update(test_config)
  
  database = create_engine(db_url, encoding = 'utf-8', max_overflow=0)
  app.database = database
  
  return app
```
## 회원가입 엔드포인트
```python
@app.route('/sign-up', methods=['POST'])
def sign_up():
  new_user = request.json
  new_user_id = app.database.execute(text('''
    INSERT INTO users (
      name,
      email,
      profile,
      hashed_password
    ) VALUES(
      :name,
      :email,
      :profile,
      :password
    )
  '''), new_user).lastrowid # request에서 읽어들인 데이터를 그대로 사용한다.
  # 필드 이름이 틀리거나 부재인 경우 오류가 나게 된다.

  # excute 메서드는 ResultProxy 객체를 리턴한다. fetchall 메서드로 데이터를 리스트 형태로 반환한다.
  row = current_app.database.execute(text('''
    SELECT
      id,
      name,
      email,
      profile
    FROM users
    WHERE id = :user_id
  '''), {
    'user_id' : new_user_id
  }).fetchone()

  created_user = {
    'id' : row['id'],
    'name' : row['name'],
    'email' : row['email'],
    'profile' : row['profile']
  } if row else None

  return jsonify(created_user)
```
명령어를 통해 테스트해보자.
```shell
http -v POST "http://localhost:5000/sign-up"\
name=chan\
email=chan@gmail.com\
password=1234\
profile="blah blah..."
```
## tweet 엔드포인트
```python
@app.route('/tweet', methods=['POST'])
def tweet():
  user_tweet = request.json
  tweet = user_tweet['tweet']

  if len(tweet) > 300:
    return '300자를 초과했습니다.', 400
  app.database.execute(text('''
    INSERT INTO tweets (
      user_id,
      tweet
    ) VALUES (
      :id,
      :tweet
    )
  '''), user_tweet)

  return '', 200
```
테스트
```shell
http -v POST localhost:5000/tweet id=1 tweet='Hello World'
```

## timeline 엔드포인트
db에 있는 데이터를 읽어서 json형태로 변화하여 HTTP response한다.
```python
  @app.route('/timeline/<int:user_id>', methods=['GET'])
  def timeline(user_id):
    # LEFT JOIN을 사용하여 팔로우가 없더라도 해당 사용자의 트윗을 가져온다.
    rows = app.database.execute(text('''
      SELECT
        t.user_id,
        t.tweet
      FROM tweets t
      LEFT JOIN users_follow_list ufl ON ufl.user_id = :user_id
      WHERE t.user_id = :user_id
      OR t.user_id = ufl.follow_user_id
    '''), {
      'user_id' : user_id
    }).fetchall()
    print(rows)
    timeline = [{
      'user_id' : row['user_id'],
      'tweet' : row['tweet']
    } for row in rows]

    return jsonify([{
      'user_id' : user_id,
      'timeline' : timeline
    }])
```
테스트
```shell
http -v GET localhost:5000/timeline/1
```
> `current_app` 메서드는 `create_app` 함수에서 생성한 `app`변수를 `create_app` 함수 외부에서도 사용할 수 있게 해준다.
> 전체 코드는 [이 책의 깃허브](https://github.com/rampart81/python-backend-book/)에서 참조할 수 있다.

# 정리
- database system은 데이터를 저장하는 시스템이다. 
- 데이터베이스 시스템은 크게 2가지 종류가 있다.
  - 관계형 데이터베이스(RDBMS)
  - 비관계형 데이터베이스(NoSQL)
- 관계형 데이터베이스의 상호 관련성 종류는 3가지가 있다.
  - one to one
  - one to many
  - many to many
- foreign key를 사용해 db를 연결여 데이터의 중복을 최소화하는 프로세스를 normalization이라 한다.
- sqlalchemy 라이브러리는 파이썬 코드에서 db에 연결하여 SQL을 실행시킨다.
- sqlalchemy의 `create_engine`함수를 통해 db에 연결하고, `text`를 통해 실행할 SQL을 만든다.
- Flask가 `create_app` 함수를 자동으로 factory 함수로 인식해서 해당 함수를 통해 Flask를 실행시킨다.