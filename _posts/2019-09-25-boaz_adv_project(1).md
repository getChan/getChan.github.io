---
title:  "YouTube 댓글 분석을 통한 컨텐츠 점수 산출 프로젝트(1)"
excerpt: "BOAZ ADV PROJECT- 프로젝트 환경구축"
published: false

categories:
  - projects
tags:
  - BOAZ
  - project
  - DB
last_modified_at: 2019-09-25T08:06:00-05:00
---

[프로젝트 저장소](https://github.com/getChan/ADV)

# 1. 환경구축

데이터 엔지니어링 스터디에서 CentOS 서버 설치가 필요해서 구글 클라우드 플랫폼에서 CentOS 7 서버를 하나 판 뒤, MariaDB 5 를 설치하였습니다. 이번 프로젝트에 이 서버를 활용해서 DB를 만들어 보려고 합니다.

```powershell
# mariaDB 5 설치하는 코드(CentOS 7)
$ yum install mariadb-server

# mariaDB 실행
$ systemctl start mariadb
$ systemctl enable mariadb

# mariadb의 기본 보안 설정
$ mysql_secure_installation

# 접속
$ mysql -u root -p
# 계정 생성
$ create user '아이디'@'%' identified by '패스워드' ;

# 계정 생성
$ grant all privileges on *.* to '생성한아이디'@'%' identified by '패스워드';
$ flush privileges;

```

# 2. 테이블 생성

MariaDB는 MySQL과 문법이 완전히 동일합니다. `mysql` 명령어로 DB 실행하고 SQL문 작성해서 테이블 생성했습니다.

```sql
SHOW DATABASES; -- DB 목록들을 보여준다.

CREATE DATABASE BOAZ;

USE BOAZ;

CREATE TABLE video(
  video_id INT NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  length INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(255) NOT NULL
);

DESC video;
-- +-----------+--------------+------+-----+---------+-------+
-- | Field     | Type         | Null | Key | Default | Extra |
-- +-----------+--------------+------+-----+---------+-------+
-- | video_id  | int(11)      | NO   | PRI | NULL    |       |
-- | title     | varchar(255) | NO   |     | NULL    |       |
-- | length    | int(11)      | NO   |     | NULL    |       |
-- | url       | varchar(255) | NO   |     | NULL    |       |
-- | thumbnail | varchar(255) | NO   |     | NULL    |       |
-- +-----------+--------------+------+-----+---------+-------+

CREATE TABLE comments(
  comment_id INT NOT NULL PRIMARY KEY,
  video_id INT NOT NULL,
  commentary VARCHAR(255) NOT NULL,
  comment VARCHAR(500) NOT NULL,
  likes INT,
  FOREIGN KEY (video_id) REFERENCES video(video_id)
);

DESC comments;
-- +------------+--------------+------+-----+---------+-------+
-- | Field      | Type         | Null | Key | Default | Extra |
-- +------------+--------------+------+-----+---------+-------+
-- | comment_id | int(11)      | NO   | PRI | NULL    |       |
-- | video_id   | int(11)      | NO   | MUL | NULL    |       |
-- | commentary | varchar(255) | NO   |     | NULL    |       |
-- | comment    | varchar(500) | NO   |     | NULL    |       |
-- | likes      | int(11)      | YES  |     | NULL    |       |
-- +------------+--------------+------+-----+---------+-------+

CREATE TABLE recomments(
  recomment_id INT NOT NULL PRIMARY KEY,
  comment_id INT NOT NULL,
  recommentary VARCHAR(255) NOT NULL,
  recomment VARCHAR(500) NOT NULL,
  relikes INT,
  FOREIGN KEY (comment_id) REFERENCES comments(comment_id)
);

DESC recomments;
-- +--------------+--------------+------+-----+---------+-------+
-- | Field        | Type         | Null | Key | Default | Extra |
-- +--------------+--------------+------+-----+---------+-------+
-- | recomment_id | int(11)      | NO   | PRI | NULL    |       |
-- | comment_id   | int(11)      | NO   | MUL | NULL    |       |
-- | recommentary | varchar(255) | NO   |     | NULL    |       |
-- | recomment    | varchar(500) | NO   |     | NULL    |       |
-- | relikes      | int(11)      | YES  |     | NULL    |       |
-- +--------------+--------------+------+-----+---------+-------+
```

이후 GCP에서 방화벽으로 DB 포트를 열어주어 외부 네트워크에서도 DB에 접근 가능하게 설정합니다. DB포트는 `3306`으로 설정해 두었습니다.

# 3. DB 연결 확인
테이블 생성했으니 로컬에서 서버 DB에 잘 접속하는지 파이썬으로 확인해 보겠습니다. 

```python
import pymysql

conn = pymysql.connect(host='34.85.53.48', user='아이디', password='패스워드', db='BOAZ', charset='utf8')
 
# Connection 으로부터 Cursor 생성
curs = conn.cursor()
 
# SQL문 실행
sql = "select * from video"
curs.execute(sql)
 
# 데이타 Fetch
rows = curs.fetchall()
print(rows)     # 전체 rows
 
# Connection 닫기
conn.close()

>> ()
```
