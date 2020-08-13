---
title: "MySQL `LOAD DATA`"
excerpt: "LOAD DATA로 적재하기"
categories:
  - data
tags:
  - database
  - ETL
  - mysql
last_modified_at: 2020-07-16T08:06:00+09:00
---

> 책 *real mysql*을 참고하였습니다.
>
> [MySQL Official Document](https://dev.mysql.com/doc/refman/8.0/en/load-data.html)

`LOAD DATA INFILE`은 `SELECT INTO OUTFILE` 쿼리에 대응하는 적재 기능의 쿼리다. CSV 파일 포맷 또는 일정 규칙을 지닌 구분자로 구분된 데이터 파일을 읽어 MySQL 서버의 테이블로 저장한다.

데이터 파일에서 각 칼럼의 값을 읽어서 바로 저장하기 떄문에 `INSERT`문보다 20배정도 빠르다고 한다.

# 데이터 파일의 값과 테이블의 칼럼의 개수가 동일한 경우

```sql
LOAD DATA INFILE '/tmp/employees.csv'
IGNORE INTO TABLE employees
FIELDS
	TERMINATED BY ','
	OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"'
LINES
	TERMINATED BY '\n'
	STARTING BY ''
(emp_no, birth_date, first_name, last_name, gender, hire_date);
```

- INTO 키워드 앞에는 IGNORE 또는 REPACE 옵션을 사용할 수 있다.
  - IGNORE : 중복 레코드 발생 시 새로 입력되는 레코드를 무시한다.
  - REPLACE : 중복 레코드 발생 시 새로 입력되는 레코드로 덮어쓴다.
- 마지막 라인은 파일에서 읽은 순서대로의 칼럼(파일)을 괄호 안 해당하는 컬럼(테이블)에 매핑하여 적재하라는 명령이다.
- `LOCAL`옵션을 추가하면 MySQL 서버가 아닌 클라이언트 컴퓨터의 디스크에 있는 데이터 파일을 사용할 수 있다.
- MySQL 서버나 클라이언트와 전혀 무관한 서버에 있는 데이터 파일을 URL 형태로 명시할 수도 있다.

> ## [`mysqlimport`](https://dev.mysql.com/doc/refman/5.7/en/mysqlimport.html)
>
> - 내부적으로 LOAD DATA INFILE 명령을 이용해 데이터를 적재하는 프로그램
> - MySQL 5.1.7 부터는 `--use-threads` 옵션을 활용하여 병렬로 `LOAD DATA` 명령을 수행한다.
> - csv와 같이 구분자로 구분된 파일만 적재 가능하다.

# 데이터 파일의 값의 개수가 테이블의 칼럼 수보다 적은 경우

테이블의 칼럼 수는 6개인데 데이터 파일에 존재하는 값의 수가 5개뿐이라면, 나머지 칼럼에 대해서는 `SET` 절을 이용해 초기 값을 명시해야 한다.( 해당 칼럼이 NULL 값이 허용된다면 명시하지 않아도 된다. )

```sql
LOAD DATA INFILE '/tmp/employees.csv'
IGNORE
INTO TABLE employees
FIELDS
	TERMINATED BY '\n'
	STARTING BY ''
(emp_no, first_name, last_name, gender, hire_date)
SET birth_date=NOW();
```

# 데이터 파일의 값의 개수가 테이블의 칼럼 수보다 많은 경우

일단 데이터 파일의 값을 사용자 변수로 읽은 후에 버리면 된다.

```sql
LOAD DATA INFILE '/tmp/employees.csv'
IGNORE
INTO TABLE employees
FIELDS
	TERMINATED BY ','
	OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"'
LINES
	TERMINATED BY '\n'
	STARTING BY ''
(emp_no, @dummy, birth_date, first_name, last_name, gender, hire_date);
```

# 데이터 파일의 값을 연산해서 테이블의 칼럼에 저장하려는 경우

사용자 변수에 값을 담은 후 `SET`절을 이용하면 된다.

```sql
LOAD DATA INFILE '/tmp/employees.csv'
IGNORE
INTO TABLE employees
FIELDS
	TERMINATED BY ','
	OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"'
LINES
	TERMINATED BY '\n'
	STARTING BY ''
(emp_no, birth_date, first_name, @middle_name, @last_name, gender, hire_date)
SET last_name=concat(@middle_name, ' ', @last_name);
```

# 데이터 파일이 MySQL 서버가 아닌 다른 컴퓨터에 있을 경우

`LOCAL` 옵션을 사용하면 된다. 

자바 프로그램에서 JDBC 드라이버를 사용해 `LOAD DATA LOCAL INFILE` 명령을 사용할 때는 파일 경로에 URL을 사용할 수 있다. 따라서 MySQL 서버와 클라이언트 컴퓨터 이외의 호스트에 파일을 적재할 수 있게 된다.

> ftp 프로토콜을 이용해 파일을 mysql 서버로 이동 후 적재한다면 속도상 이점이 더 있을수도 있을 것 같다.
>
> 그러나, 작업을 간단하게 만들고 에러나 장애에 대한 감지도 하나의 배치 프로그램에서만 해주면 되기 때문에 운영히는 데 있어서 장점이 많다.

```java
Connection conn = DriverManager.getConnection(
	"jdbc:mysql://mysql_server_ip:3306/employees?allowUrlInLocalInfile=true",
  userid,
  userpassword);
Statement stmt = conn.createStatement();
stmt.executeUpdate("LOAD DATA LOCAL INFILE 'http://another-server-url/employees.csv' "
                  + "IGNORE "
                  + "INTO TABLE temp_employees "
                  + "FIELDS"
                  + "	TERMINATED BY ',' "
                  + " OPTIONALLY ENCLOSED BY '\"' ESCAPED BY '\"' "
                  + "LINES "
                  + "	TERMINATED BY '\r\n' "
                  + " STARTING BY '' "
                  + " (emp_no, birth_date, first_name, last_name, gender, hire_date) ");
```

LOCAL 옵션을 사용하려면 JDBC 커넥션을 생성할 때 `allowUrlInLocalInfile` 옵션이 `true`로 설정되어 있어야 한다.

# LOAD DATA INFILE 의 성능 향상

더욱 빠르게 데이터를 적재하고 싶으면 다음 옵션을 고려해 보자. AUTO-COMMIT 모드와 FORIGN KEY 관련 내용은 InnoDB 테이블에 해당하는 내용이며, 유니크 인덱스는 모든 스토리지 엔진의 테이블에 해당하는 내용이다.

## AUTO-COMMIT

InnoDB 스토리지 엔진에서는 트랜잭션을 사용할 수 있다. AUTO-COMMIT 이 활성화 된 상태에서는 레코드 단위로 INSERT 될 때마다 COMMIT을 실행하는데, 이 작업은 매번 레코드 단위로 로그 파일의 디스크 동기화(FLUSH) 작업을 발생시킨다. 대량의 INSERT 연산의 경우에는 디스크 I/O에 상당히 많은 부하를 일으킨다.

AUTO-COMMIT 모드를 비활성화하면 레코드가 INSERT 될 때마다 디스크에 FLUSH하는 작업을 피할 수 있다. 이후 COMMIT을 실행하는 시점에 버퍼링됬던 내용을 디스크에 FLUSH하게 된다. InnoDB의 로그(Redo log)파일 뿐 아니라 바이너리 로그에도 똑같이 영향을 미치게 된다. 

```sql
SET autocommit = 0;
LOAD DATA ...
COMMIT;
SET autocommit = 1;
```

## UNIQUE INDEX

데이터를 적재하는 테이블에 UNIQUE 인덱스가 있다면 매번 레코드 단위로 중복 체크가 발생한다. 중복 체크는 곧 INSERT를 수행하기 전에 SELECT를 한 번씩 더 실행해야 한다는 것을 의미한다. `unique_checks` 설정을 변경해 중복 체크를 건너뛰도록 할 수 있다. **물론 적재되는 데이터의 중복이 없다는 것을 꼭 먼저 확인해야 한다.** 중복 체크 작업을 비활성화하면 SELECT를 생략할 수 있는 데다, 유니크 인덱스에 대해서도 InnoDB의 인서트 버퍼를 사용할 수 있기 때문에 상당히 많은 디스크 I/O를 줄일 수 있다.

```sql
SET unique_checks = 0;
LOAD DATA ...
SET unique_checks = 1;
```

## FOREIGN KEY

데이터를 적재하는 테이블에 FOREIGN KEY 가 있다면 매번 레코드의 INSERT 시점마다 FOREIGN KEY 값이 존재하는지 여부를 확인해야 한다. 이 작업 또한 상당한 디스크 I/O를 유발한다. `foreign_key_checks` 설정을 변경하면 FOREIGN KEY의 무결성 체크를 수행하지 않고 바로 적재할 수 있다. **물론 FOREIGN KET의 무결성을 해치는 데이터가 없다는 것을 꼭 먼저 확인해야 한다.**

```sql
SET foreign_key_checks = 0;
LOAD DATA ...
SET foreign_key_checks = 1;
```

# 참고

[데이터 적재 속도 비교 슬라이드](https://www.slideshare.net/billkarwin/load-data-fast)

![](https://image.slidesharecdn.com/loaddatafast-170510050007/95/load-data-fast-50-1024.jpg?cb=1494392465)

