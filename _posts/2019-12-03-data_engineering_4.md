---
title: "DE 스터디(4) - Docker"
excerpt: "data engineering 스터디 정리입니다."

categories:
  - data
tags:
  - study
  - linux
  - dataEnginnering
  - docker
  - kubernetics
last_modified_at: 2019-12-03T08:06:00-05:00
---

# Docker

도커는 2013년 3월 Docker. Inc에서 출시한 오픈소스 **컨테이너 프로젝트**

AWS, GCP, AZURE 등의 클라우드 서비스에서 공식 지원하고 있다

## 도커의 특징

- 복잡한 리눅스 애플리케이션을 컨테이너로 **묶어서 실행**할 수 있음
- 개발, 테스트, 서비스 환경을 **하나로 통일**하여 **효율적으로 관리**할 수 있다.
- 컨테이너(이미지)를 전 세계 사람들과 **공유**
  - 리눅스 커널에서 제공하는 **컨테이너 기술**을 이용
  - GitHub와 유사한 방식의 **Docker Hub 제공**

## 가상 머신과 도커
### 가상 머신

![virtual_machine.jpg]({{site.url}}/assets/images/data_enginnering_study/virtual_machine.JPG)

- 컴퓨터 안에서 컴퓨터를 만들어내기 위한 시도
- 컴퓨터와 서버 성능이 좋아지게 됨
- 서버가 **놀게 된다**.
- 서버에 가상 머신을 여러개 띄워서 **일을 더 시키자!**
- **서버 자체**를 가상 머신에 **집어넣어서** 돌리자.
- **가상 머신**에 각종 **서버 프로그램, DB**등을 설치하여 애플리케이션이나 웹사이트를 실행
- 가상 머신 이미지를 **여러 서버에 복사하여 실행**하면 이미지 하나로 **서버를 계속 만들어낼 수 있음**
- 가상화 기술을 이용하여 **서버를 임대**해주는 서비스가 **클라우드 서비스**

### 가상 머신의 문제점

- 컴퓨터를 통째로 만들어내다 보니 **각종 성능 손실이 발생**
- 호스트 OS와 커널을 공유하는 **반가상화** 기술이 등장
- 어쨌든, **가상 머신은 완전한 컴퓨터**
  - 항상 게스트OS를 설치해야 한다.
- 이미지 안에 OS가 포함되기 때문에 **이미지 용량이 커짐**
  - **네트워크**로 가상화 이미지를 주고 받는 것이 **부담**스러움 
- 오픈소스 가상화 소프트웨어는 OS 가상화에만 주력
  - **배포와 관리 기능이 부족**
- 가상머신의 성능 문제로 **리눅스 컨테이너**가 등장

### 리눅스 컨테이너

- 컨테이너 안에 **가상 공간**을 만들지만 실행 파일을 **호스트에서 직접 실행**
- 리눅스 커널의 **cgroups**와 **namespaces**가 제공하는 기술
- 가상화가 아닌 **격리**
- **도커는 리눅스 컨테이너를 사용!**

## 도커의 특징

![virtual_machine.jpg]({{site.url}}/assets/images/data_enginnering_study/docker_structure.JPG)

- **도커는 게스트 OS를 설치하지 않음**
  - 이미지에 서버 운영을 위한 프로그램과 라이브러리만 격리해서 설치
  - 이미지 용량이 크게 줄어듦
  - 호스트와 OS자원(시스템 콜)을 공유
- **도커는 하드웨어 가상화 계층이 없음**
  - 메모리 접근, 파일 시스템, 네트워크 전송 속도가 가상 머신에 비해 월등히 빠름
  - 호스트와 도커 컨테이너 사이의 성능 차이가 크지 않음
- 도커는 이미지 **생성**과 **배포**에 특화
  - **이미지 버전 관리**도 제공하고 **중앙 저장소**에 **push/pull 가능**
  - 도커 이미지를 공유하는 **Docker Hub**제공
- 다양한 **API**를 제공하여 원하는 만큼 **자동화** 가능
  - 개발과 서버 운영에 매우 유용

## 도커 이미지와 컨테이너

- 이미지는 서비스 운영에 필요한 서버 프로그램, 소스 코드, 컴파일된 실행 파일을 **묶은 형태**
  - 저장소에 push/pull하는 건 이미지
- 컨테이너는 이미지를 **실행한 상태**
- 이미지로 **여러 개의 컨테이너**를 만들 수 있음
- 운영체제로 치면 **이미지는 실행파일, 컨테이너는 프로세스**

### 도커의 이미지 처리 방식

![virtual_machine.jpg]({{site.url}}/assets/images/data_enginnering_study/docker_image_process.JPG)

도커는 이미지의 **바뀐 부분**을 어떻게 관리할까?
- 유니온 파일 시스템 형식(aufs, btrfs, devicemapper)
- 도커는 베이스 이미지에서 **바뀐 부분만 이미지로 생성**
- 컨테이너로 실행할 때는 베이스 이미지와 **바뀐 부분을 합쳐서 실행**
- Docker Hub 및 개인 저장소에서 이미지를 공유할 때 **바뀐 부분만 주고 받음**
- 각 이미지는 **의존 관계** 형성

## 서비스 운영 환경과 도커

### 지금까지의 서버 환경

- 지금까지는 **물리 서버**를 **직접 운영**했음
  - 호스팅 또는 IDC 코로케이션 서비스 사용
  - 서버 구입과 설치에 **돈이 많이 들고 시간이 오래 걸림**

### 클라우드 환경

- 가상화가 발전하면서 **클라우드 환경으로 변화**
- 가상 서버를 **임대**하여 사용한 만큼만 **요금 지불**
- 이젠 **자동**으로 **서버를 추가**하고 **삭제**하기까지..
- 서버 대수가 많아지면서 **사람이 일일이 세팅하기 힘들어짐**

### Immutable Infrastructure

![virtual_machine.jpg]({{site.url}}/assets/images/data_enginnering_study/immutable_infrastructure.JPG)

- **호스트 OS**와 **서비스 운영 환경**(서버 프로그램, 소스코드, 컴파일 된 바이너리)을 **분리**
- 한 번 설정한 운영 환경은 **변경하지 않는다(Immutable)**는 개념
- 서비스 운영 환경을 **이미지로 생성**한 뒤 **서버에 배포하여 실행**
- 서비스가 **업데이트되면** 운영 환경 자체를 변경하지 않고, **이미지를 새로 생성하여 배포**
- 클라우드 플랫폼에서 서버를 쓰고 버리는 것과 같이
  - **서비스 운영 환경 이미지를 한 번 쓰고 버림**

### Immutable Infrastructure의 장점

- 편리한 관리
  - 서비스 환경 **이미지만 관리**하면 됨
  - 중앙 관리를 통한 **체계적인 배포와 관리**
  - 이미지 생성에 **버전 관리 시스템 활용**
- 확장
  - 이미지 하나로 **서버를 계속 찍어낼 수 있음**
  - 클라우드 플랫폼의 **자동 확장(Auto Scaling)** 기능과 연동하여 **손쉽게 서비스 확장**
- 테스트
  - 개발자 PC, 테스트 서버에서 이미지를 실행만 하면 서비스 운영 환경과 **동일한 환경이 구성됨**
  - **테스트가 간편**
- 가볍다
  - 운영체제와 서비스 환경을 **분리**하여 **가볍고(Lightweight) 어디서든 실행 가능한(Portable) 환경** 제공

> 도커는 Immutable Infrastructure를 구현한 프로젝트

## 도커 요약

도커의 고래는 **여러 개의 컨테이너(이미지)를 실행**하고, **이미지 저장과 배포(운반)을** 의미

도커는 **서비스 운영 환경을 묶어서 손쉽게 배포하고 실행**하는 **경량 컨테이너** 기술

# 도커 사용해보기

- 도커의 명령은 `docker <명령>` 형식
  - **항상 root 권한으로 실행**

## 이미지 검색하기

- `docker search <이미지 이름>`
  ```shell
  # docker hub에서 이미지 검색해보기
  $sudo docker search ubuntu
  ```
  - 보통 ubuntu, centos, redis 등 OS나 프로그램 이름을 가진 이미지가 공식 이미지
  - 나머지는 사용자들이 만들어서 공개한 이미지
- **Docker Hub**를 통해 **이미지**를 공유하는 **생태계**가 구축되어 있음
- 유명 **리눅스 배포판**과 **오픈소스 프로젝트**의 이미지를 모두 Docker Hub에서 구할 수 있음
- 이미지와 관련된 명령은 기본적으로 Docker Hub를 이용하도록 설정되어 있음
- Docker Hub에서 이미지를 검색한 뒤 해당 이미지의 Tags 탭에서 **이미지의 버전을 볼 수 있음**
  
## 이미지 받기

`docker pull <이미지 이름>:<태그>`

```shell
# docker hub에서 우분투 이미지 받아보기
$sudo docker pull ubuntu:latest
```

## 이미지 목록 출력하기

`docker images`

```shell
$sudo docker images
```

## 컨테이너 생성하기

`docker run <옵션> <이미지 이름> <실행할 파일>`

```shell
# 이미지를 컨테이너로 생성한 뒤 Bash 셸 실행해보기
$sudo docker run -i -t --name hello ubuntu /bin/bash
```

ubuntu 이미지를 컨테이너로 생성한 뒤 이미지 안의 `/bin/bash`를 실행
- `-i`(interactive), `-t`(pseudo-tty) 옵션을 사용하면 실행된 Bash 셸에 입력 및 출력 가능
- `--name` 옵션으로 컨테이너에 이름 지정할 수 있음.
- 우분투 이미지에서 `/bin/bash` 실행 파일을 실행했기 때문에 여기서 빠져나오면 컨테이너가 정지(stop)됨

## 컨테이너 목록 확인하기

`docker ps`

```shell
# 모든 컨테이너 목록을 출력하기
$sudo docker ps -a
```

- `-a` 옵션은 정지된 컨테이너까지 모두 출력됨
- 옵션을 사용하지 않으면 실행중인 컨테이너만 출력됨

## 컨테이너 시작하기

`docker start <컨테이너 이름>`

```shell
$sudo docker start hello
```

컨테이너 이름 대신 컨테이너 ID 사용해도 됨

## 컨테이너 재시작하기

`docker retart <컨테이너 이름>`

```shell
$sudo docker restart hello
```

컨테이너 ID 사용해도 됨

## 컨테이너 접속하기

`docker attach <컨테이너 이름>`

```shell
$sudo docker attach hello
```

- 시작한 컨테이너에 접속해보기
- 명령을 실행한 뒤 엔터를 한번 더 입력하면 bash 셸 표시됨
- 컨테이너 이름 대신 컨테이너 ID를 사용해도 됨
- 여기서는 `/bin/bash`를 실행했기 때문에 **명령을 입력**할 수 있음. 단 DB나 서버 애플리케이션을 실행하면 출력만 보게 됨
- Bash셸에서 `exit`또는 `Ctrl+D`를 입력하면 **컨테이너가 정지**됨

여기서는 `ctrl+P`, `ctrl+Q`를 차례로 입력해서 컨테이너를 **정지하지 않고 빠져나오기**

## 외부에서 컨테이너 안의 명령 실행하기

`docker exec <컨테이너 이름> <명령> <매개변수>`

```shell
$sudo docker exec hello echo "Hello World"
>> Hello World
```

- 컨테이너가 실행되고 있는 상태에서만 사용 가능
- 이미 실행된 컨테이너에 `apt-get`, `yum` 명령으로 패키지를 설치하거나 각종 데몬을 실행할 때 활용

## 컨테이너 정지하기

`docker stop <컨테이너 이름>`

```shell
$sudo docker stop hello
```

## 컨테이너 삭제하기

`docker rm <컨테이너 이름>`

```shell
$sudo docker rm hello
```

## 이미지 삭제하기

`docker rmi <이미지 이름>:<태그>`

```shell
$sudo docker rmi ubuntu:latest
```

- `docker rmi ubuntu`처럼 이미지 이름만 지정하면 **태그**는 다르지만 `ubuntu`이름을 가진 **모든 이미지**가 삭제됨

# 도커 이미지 생성하기

## Dockerfile 작성하기

- 도커 **이미지 설정 파일**

```shell
$mkdir example
$cd example
```

- nginx 서버를 설치한 도커 이미지를 생성하는 예제

```dockerfile
FROM ubuntu:14.04 
MAINTAINER Foo Bar foo@bar.com 
 
RUN apt-get update 
RUN apt-get install -y nginx 
RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf 
RUN chown -R www-data:www-data /var/lib/nginx 
 
VOLUME ["/data", "/etc/nginx/site-enabled", "/var/log/nginx"] 
 
WORKDIR /etc/nginx 
 
CMD ["nginx"] 
 
EXPOSE 80 
EXPOSE 443
```

## 이미지 생성하기

`docker build <옵션> <Dockerfile 경로>`

```shell
$sudo docker build --tag hello:0.1 .
```

- Dockerfile로 이미지 생성하기
- Dockerfile이 저장된 폴더에서 명령 실행
- `--tag` 옵션으로 이미지 이름과 태그를 설정할 수 있음
- 이미지 이름만 설정하면 태그는 `latest`

```shell
# 생성한 이미지 실행해보기
$sudo docker run --name hello-nginx -d -p 80:80 -v /root/data:/data hello:0.1
```

- `-d` 옵션은 컨테이너를 백그라운드로 실행
- `-p 80:80` 옵션으로 호스트의 80번 포트와 컨테이너의 80번 포트를 연결하고 **외부에 노출** 
- `-v /root/data:/data` 옵션으로 호스트의 `/root/data` 디렉터리를 컨테이너의 `/data` 디렉터리에 연결

> 웹 브라우저를 실행하고 `http://<호스트 ip>:80`으로 접속하면 `welcome to nginx!` 페이지가 표시됨

