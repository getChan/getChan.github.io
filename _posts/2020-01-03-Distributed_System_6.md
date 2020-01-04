---
title: "분산컴퓨팅(6)-Hive 실습:bee:"
excerpt: "빅데이터분산컴퓨팅 강의 정리"

categories:
  - data
tags:
  - dataEnginnering
  - hadoop
  - hive
last_modified_at: 2020-01-03T08:06:00-05:00
---

> 숭실대학교 박영택교수님의 "빅데이터분산컴퓨팅" 강의를 참고했습니다.\
>
> 1. [하둡 개요](/data/Distributed_System_1/)
> 2. [HDFS](/data/Distributed_System_2/)
> 3. [MapReduce](/data/Distributed_System_3/)
> 4. [Hive and Sqoop](/data/Distributed_System_4/)
> 5. [Apache Hive](/data/Distributed_System_5/)

# Join

- Hive에서 지원하는 Join
  - Inner Join
  - Outer join (left, right, full)
  - Cross join (ver 0.1 이상)  == 카디전 프로덕트
  - Left Semi join
- `=` 조건은 join 에서만 허용
- 쿼리 성능을 위해서 가장 큰 테이블을 마지막에 쿼리하기

# 텍스트 분석

### 1 - 제품들에 대한 Ratings 수치 분석

> - 사용자로부터 Comment 개수가 많고, 실제 제품도 만족한 제품
> - Comment 개수는 많지만, 제품에 대한 만족도 낮은 제품

- ratings 테이블 생성

  ```sql
  CREATE TABLE ratings
  	(posted TIMESTAMP, cust_id INT, prod_id INT, rating TINYINT, message STRING)
  ROW FORMAT DELIMITED
  FIELD TERMINATED BY '\t';
  ```
  
- HDFS에 경로 생성 후 파일 업로드

  ```shell
  $ hadoop fs -mkdir ratings
  $ hadoop fs -put ratings_2013.txt ratings
  ```

- 테이블에 데이터 로드

  ```shell
  hive> LOAD DATA INPATH 'ratings' INTO TABLE ratings;
  ```

- 평가횟수가 50개 이상인 제품에 대해 평점 높은 순으로 정렬

  ```sql
  hive>
  SELECT prod_id, FORMAT_NUMBER(avg_rating, 2) AS avg_rating
  FROM (SELECT prod_id, AVG(rating) AS avg_rating, COUNT(*) AS num
       FROM ratings
       GROUP BY prod_id) rated
  WHERE num >= 50
  ORDER BY avg_rating DESC;
  ```

### 2 - 가장 평가가 안좋은 제품에 대한 Comments 분석

> - 그 제품의 comments에서 가장 많이 나타난 문장 추출
>   - 2-gram, 3-gram
> - 가장 많이 나타난 문장들을 포함하고 있는 Comments 추출

#### EXPLODE

- array의 각 element마다 하나의 record 생성

  - SPLIT과 같은 함수는 table generating function
  - table generating function을 EXPLODE의 파라미터로 사용할 때는 alias 필요(`AS x`)

  ```sql
  hive> SELECT people FROM example;
  Amy, Sam, Ted
  hive> SELECT SPLIT(people, ',') FROM example;
  ["Amy", 'Sam', 'Ted']
  hive> SELECT EXPLODE(SPLIT(people, ',')) AS x FROM example;
  Amy
  Sam
  Ted
  ```

#### N-grams

- Hive에서는 n-grams 를 계산하기 위한 NGRAMS 함수 제공
- NGRAMS 함수는 3개의 파리미터 필요
  - Stirng 타입의 Array of array 형태, 각 element는 word (ex. [["is", "great"]])
  - `N` : number of words
  - 결과 값의 출력 개수(top-X, based on frequency)
- Output은 2개의 속성을 가진 STRUCT 구조의 array 리턴
  - `[{ngram: [...] , estfrequency: count}, ...]`

#### Sentences를 Word로

- SENTENCES`는 sentences를 array of words로 변환

  ```sql
  hive> SELECT txt FROM phrases WHERE id=12345;
  I bought this computer and really love it! It`s very fast...
  hive> SELECT SENTENCES(txt) FROM phrases WHERE id=12345
  [['I', "bought", ...],
   ["It's", "very", "fast", ...]]
  ```

#### n-grams in Hive

- `NGRAMS` 함수는 `SENTENCES` 함수와 자주 함께 사용

  ```sql
  hive> SELECT EXPLODE(NGRAMS(SENTENCES(LOWER(txt)), 2, 2))
  		AS bigrams FROM phrases WHERE id=1234;
  {"ngram":["is", "great"], "estfrequency":4.0}
  {"ngram":["great", "the"], "estfrequency":3.0}
  ```

> 다음 포스팅은 Spark:sparkles:와 RDD에 대해 정리할 것이다.