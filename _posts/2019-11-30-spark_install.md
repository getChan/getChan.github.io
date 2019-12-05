---
title:  "spark 설치"
excerpt: "centos7에 Spark 설치하기"

categories:
  - data
tags:
  - BOAZ
  - DataEnginnering
last_modified_at: 2019-11-30T08:06:00-05:00
---

데이터 엔지니어링 스터디의 마지막 주제인 스파크. 스터디 사전준비로 스파크를 설치해야 했다.

스파크는
- 인메모리 기반의 대용량 데이터 고속 처리 엔진
- 범용 분산 클러스터 컴퓨팅 프레임워크

라고 한다. 직관적으로 이해하기 힘든 개념이다. [관련 블로그](https://futurecreator.github.io/2018/08/14/apache-spark-basic/)에 잘 설명되어 있다.

스파크 설치하면서 있었던 이슈를 정리해본다. GCP centos7서버 인스턴스를 기반으로 설치했다.

1. 스파크 설치파일 다운로드

spark 공식홈페이지에 있는 최신버전 spark를 다운로드했다.

`wget`명령어로 설치파일을 다운받는다.

```shell
$wget http://apache.tt.co.kr/spark/spark-3.0.0-preview/spark-3.0.0-preview-bin-hadoop2.7.tgz
```

2. 압축파일 해제

`tgz` 파일은 리눅스 내 압축파일 형태로, `tar` 명령어로 압축 해제할 수 있다.

```shell
$tar -zxf spark-3.0.0-preview-bin-hadoop2.7.tgz 
```

압축 해제하면 해당 폴더는 여러 파일들을 가지고 있다.

```shell
beeline               find-spark-home.cmd  pyspark2.cmd     spark-class       sparkR2.cmd       spark-shell.cmd  spark-submit
beeline.cmd           load-spark-env.cmd   pyspark.cmd      spark-class2.cmd  sparkR.cmd        spark-sql        spark-submit2.cmd
docker-image-tool.sh  load-spark-env.sh    run-example      spark-class.cmd   spark-shell       spark-sql2.cmd   spark-submit.cmd
find-spark-home       pyspark              run-example.cmd  sparkR            spark-shell2.cmd  spark-sql.cmd
```
`pyspark`, `spark-shell` 등 여러 실행 파일을 찾아볼 수 있다. 

해당 폴더를 `%PATH`에 추가해줘야 커맨드 라인에서 바로 실행할 수 있다. 환경변수 추가하는 과정은 생략한다.

3. JAVA 설치

jdk를 설치해두지 않으면 spark실행 시 에러가 난다. scala기반으로 실행되기 때문이다.

jdk를 설치해보자.

> yum 은 centos의 패키지 설치/제거 도구이다

```shell
$yum list java*jdk-devel
```
로 jdk 설치 패키지들을 살펴본 뒤 최신 버전으로 설치했다.

```shell
$yum install java-latest-openjdk-devel.x86_64
```

java 설치한 뒤 `JAVA_HOME`이 제대로 설정된다면 잘 실행되는 것을 볼 수 있다.

4. 실행 결과

```shell
spark-shell
```
```
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 2.4.4
      /_/
         
Using Scala version 2.11.12 (OpenJDK 64-Bit Server VM, Java 13.0.1)
Type in expressions to have them evaluated.
Type :help for more information.
scala> 
```