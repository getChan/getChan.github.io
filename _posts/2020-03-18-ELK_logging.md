---
title: "ElaticSearch로 로깅 인프라 구축하기"
excerpt: "custom log를 ELK에 저장하기 위해 겪었던 이슈들"

categories:
  - data
tags:
  - ELK
  - ElasticSearch
  - nodejs
  - infra
last_modified_at: 2020-03-18T08:06:00-05:00
---

> [공식문서](https://www.elastic.co/guide/en/elastic-stack-get-started/current/get-started-docker.html)를 대부분 참고했습니다.

# ElasticSearch와 Kibana 설치

ElasticSearch 와 Kibana를 설치하기 위해 도커를 이용했다.

`docker-compose` 를 이용해서 3개의 엘라스틱서치 컨테이너와 1개의 키바나 컨테이너를 동시에 올리고 통신할 수 있게 한다.

다음과 같이 `docker-compose.yml`파일을 작성하고. `$ docker-compose up ` 명령어로 실행해주자.

**이 때!** 컨테이너 중 하나라도 `137` 에러를 내면서 종료된다면, 컨테이너에 할당할 메모리 자원이 부족하다는 것인데 Mac이나 Window로 docker desktop 을 사용한다면 docker desktop 설정에서 메모리 할당 리미트를 올려줘야 한다.

```yaml
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.6.1
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.6.1
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data02:/usr/share/elasticsearch/data
    ports:
      - 9201:9201
    networks:
      - elastic

  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.6.1
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data03:/usr/share/elasticsearch/data
    ports:
      - 9202:9202
    networks:
      - elastic

  kib01:
    image: docker.elastic.co/kibana/kibana:7.6.1
    container_name: kib01
    ports:
      - 5601:5601
    environment:
      ELASTICSEARCH_URL: http://es01:9200
      ELASTICSEARCH_HOSTS: http://es01:9200
    networks:
      - elastic

volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  elastic:
    driver: bridge
```

키바나에 지정해준 5601번 포트로 브라우저에서 정상 실행된다면 엘라스틱서치와 키바나 설치는 성공이다.

## Index Template 생성

ES에 인덱스 템플릿을 생성해야 filebeat에서 불러올 수 있다. 인덱스 템플릿은 인덱스 패턴과 매핑 정보를 담고 있다. Rest API를 이용해 생성해보자. *키바나에서도 생성할 수 있다*

```json
PUT _template/nodejs
{
  "index_patterns": "nodejs-*",
  "settings": {
    "number_of_shards": 1,
    "index.lifecycle.name": "nodejs-history-ilm-policy"
  },
  "mappings": {
    "_meta": {
        "created_by": "ml-file-data-visualizer"
      },
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "loglevel": {
        "type": "keyword"
      },
      "message": {
        "type": "text"
      }
    }
  }
}
```

## ILM 생성

인덱스를 관리하기 위한 Index Lifecycle Manage를 생성해야 한다. 키바나의 management -> Index LifeCycle Polices 탭에서 생성할 수 있다. ILM을 미리 생성하지 않으면 filebeat는 default ILM을 생성해서 custom 인덱스 템플릿을 지정할 수 없으므로 주의!

## Pipeline 생성

log를 parsing 할 파이프라인을 생성해야 한다. Rest API를 이용했다.

```json
PUT _ingest/pipeline/nodejs-test-pipeline
{
  "description" : "Ingest pipeline created by file structure finder",
    "processors" : [
      {
        "grok" : {
          "field" : "message",
          "patterns" : [
            "%{TIMESTAMP_ISO8601:timestamp}.*?%{LOGLEVEL:loglevel}.*"
          ]
        }
      },
      {
        "date" : {
          "field" : "timestamp",
          "formats" : [
            "ISO8601"
          ]
        }
      },
      {
        "remove" : {
          "field" : "timestamp"
        }
      }
    ]
}
```

# Filebeat 설치

로컬에 있는 로그 파일을 elasticsearch로 자동 전송하고 싶기 때문에, filebeat를 설치해야 한다.

Filebeat를 엘라스틱서치와 버전을 맞춰서 로컬에 설치해보자.

```sh
# mac
$ curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.6.1-darwin-x86_64.tar.gz
$tar xzvf filebeat-7.6.1-darwin-x86_64.tar.gz

# linux
$curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.6.1-linux-x86_64.tar.gz
$tar xzvf filebeat-7.6.1-linux-x86_64.tar.gz
```

# Filebeat 설정

다운받은 filebeat 디렉토리 안에 `filebeat.yml` 파일을 수정하여 환경설정이 가능하다.

```yaml
# filebeat에 입력할 로그 파일 설정
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /usr/local/var/log/nodejs/*.log
    #- c:\programdata\elasticsearch\logs\*

# filebeat to elasticsearch
output.elasticsearch:
	hosts: ["localhost:9200"]
	index: "nodejs-%{[agent.version]}-%{+yyyy.MM.dd}"
	# set custom pipeline
	pipeline: "nodejs-test-pipeline"
	
# filebeat to Kibana
setup.kibana:
	host: "localhost:5601"
	
# setup custom index template
setup:
	template:
		name: "nodejs"
		pattern: "nodejs-*"
		# do not overwrite index template
		overwrite: false

# set custom index lifecycle management
setup.ilm.enabled: false
# custeom lim name
setup.ilm.policy_name: "nodejs-history-ilm-policy"
```

설정을 마치고 `$ sudo chdown root filebeat.yml` 로 파일 권한을 변경 후 `$sudo ./filebeat -e` 로 실행하면 된다!

로그를 잘 살펴보면 로그 파일 경로와 인덱스 템플릿, 파이프라인이 설정된 것을 확인할 수 있다.

```
2020-03-22T00:44:04.861+0900	INFO	instance/beat.go:622	Home path: [/usr/local/lib/filebeat-7.6.1-darwin-x86_64] Config path: [/usr/local/lib/filebeat-7.6.1-darwin-x86_64] Data path: [/usr/local/lib/filebeat-7.6.1-darwin-x86_64/data] Logs path: [/usr/local/lib/filebeat-7.6.1-darwin-x86_64/logs]
2020-03-22T00:44:04.882+0900	INFO	instance/beat.go:630	Beat ID: 84b608f5-9916-484a-8e8d-6f4ff3744e52
2020-03-22T00:44:04.915+0900	INFO	[beat]	instance/beat.go:958	Beat info	{"system_info": {"beat": {"path": {"config": "/usr/local/lib/filebeat-7.6.1-darwin-x86_64", "data": "/usr/local/lib/filebeat-7.6.1-darwin-x86_64/data", "home": "/usr/local/lib/filebeat-7.6.1-darwin-x86_64", "logs": "/usr/local/lib/filebeat-7.6.1-darwin-x86_64/logs"}, "type": "filebeat", "uuid": "84b608f5-9916-484a-8e8d-6f4ff3744e52"}}}
2020-03-22T00:44:04.915+0900	INFO	[beat]	instance/beat.go:967	Build info	{"system_info": {"build": {"commit": "c1c49432bdc53563e63e9d684ca3e9843626e448", "libbeat": "7.6.1", "time": "2020-02-28T23:12:25.000Z", "version": "7.6.1"}}}
2020-03-22T00:44:04.915+0900	INFO	[beat]	instance/beat.go:970	Go runtime info	{"system_info": {"go": {"os":"darwin","arch":"amd64","max_procs":8,"version":"go1.13.8"}}}
2020-03-22T00:44:04.915+0900	INFO	[beat]	instance/beat.go:974	Host info	{"system_info": {"host": {"architecture":"x86_64","boot_time":"2020-03-21T20:48:57.719184+09:00","name":"Namgungui-MacBookPro.local","ip":["127.0.0.1/8","::1/128","fe80::1/64","fe80::8f2:f7f9:5f7:caee/64","192.168.219.123/24","fe80::9830:13ff:fe49:f2f5/64","fe80::9830:13ff:fe49:f2f5/64","fe80::19fe:c458:efc1:a7e7/64","fe80::5154:eedd:20cb:9357/64"],"kernel_version":"19.3.0","mac":["a0:99:9b:0e:f1:15","82:17:02:cc:2a:80","82:17:02:cc:2a:81","82:17:02:cc:2a:80","02:99:9b:0e:f1:15","9a:30:13:49:f2:f5","9a:30:13:49:f2:f5"],"os":{"family":"darwin","platform":"darwin","name":"Mac OS X","version":"10.15.3","major":10,"minor":15,"patch":3,"build":"19D76"},"timezone":"KST","timezone_offset_sec":32400,"id":"5E29DDC8-24E8-5DEB-8022-76C0C80C49AA"}}}
2020-03-22T00:44:04.916+0900	INFO	[beat]	instance/beat.go:1003	Process info	{"system_info": {"process": {"cwd": "/usr/local/lib/filebeat-7.6.1-darwin-x86_64", "exe": "./filebeat", "name": "filebeat", "pid": 14304, "ppid": 14303, "start_time": "2020-03-22T00:44:04.826+0900"}}}
2020-03-22T00:44:04.916+0900	INFO	instance/beat.go:298	Setup Beat: filebeat; Version: 7.6.1
2020-03-22T00:44:04.916+0900	INFO	elasticsearch/client.go:174	Elasticsearch url: http://localhost:9200
2020-03-22T00:44:04.917+0900	INFO	[publisher]	pipeline/module.go:110	Beat name: Namgungui-MacBookPro.local
2020-03-22T00:44:04.918+0900	INFO	instance/beat.go:439	filebeat start running.
2020-03-22T00:44:04.919+0900	INFO	[monitoring]	log/log.go:118	Starting metrics logging every 30s
2020-03-22T00:44:04.919+0900	INFO	registrar/migrate.go:104	No registry home found. Create: /usr/local/lib/filebeat-7.6.1-darwin-x86_64/data/registry/filebeat
2020-03-22T00:44:04.919+0900	INFO	registrar/migrate.go:112	Initialize registry meta file
2020-03-22T00:44:04.929+0900	INFO	registrar/registrar.go:108	No registry file found under: /usr/local/lib/filebeat-7.6.1-darwin-x86_64/data/registry/filebeat/data.json. Creating a new registry file.
2020-03-22T00:44:04.951+0900	INFO	registrar/registrar.go:145	Loading registrar data from /usr/local/lib/filebeat-7.6.1-darwin-x86_64/data/registry/filebeat/data.json
2020-03-22T00:44:04.951+0900	INFO	registrar/registrar.go:152	States Loaded from registrar: 0
2020-03-22T00:44:04.952+0900	INFO	crawler/crawler.go:72	Loading Inputs: 1
2020-03-22T00:44:04.953+0900	INFO	log/input.go:152	Configured paths: [/usr/local/var/log/nodejs/*.log]
2020-03-22T00:44:04.953+0900	INFO	input/input.go:114	Starting input of type: log; ID: 13120237379788523527
2020-03-22T00:44:04.953+0900	INFO	crawler/crawler.go:106	Loading and starting Inputs completed. Enabled inputs: 1
2020-03-22T00:44:04.953+0900	INFO	cfgfile/reload.go:171	Config reloader started
2020-03-22T00:44:04.954+0900	INFO	log/harvester.go:297	Harvester started for file: /usr/local/var/log/nodejs/app.js.log
2020-03-22T00:44:07.890+0900	INFO	add_cloud_metadata/add_cloud_metadata.go:89	add_cloud_metadata: hosting provider type not detected.
2020-03-22T00:44:08.892+0900	INFO	pipeline/output.go:95	Connecting to backoff(elasticsearch(http://localhost:9200))
2020-03-22T00:44:08.924+0900	INFO	elasticsearch/client.go:757	Attempting to connect to Elasticsearch version 7.6.1
2020-03-22T00:44:08.954+0900	INFO	[license]	licenser/es_callback.go:50	Elasticsearch license: Basic
2020-03-22T00:44:08.962+0900	INFO	template/load.go:89	Template nodejs already exists and will not be overwritten.
2020-03-22T00:44:08.962+0900	INFO	[index-management]	idxmgmt/std.go:295	Loaded index template.
2020-03-22T00:44:08.962+0900	INFO	pipeline/output.go:105	Connection to backoff(elasticsearch(http://localhost:9200)) established
```

# Filebeat Dockerize

Filebeat의 복잡한 설치와 설정을 도커 이미지로 만들어서 배포하기 쉽게 해본다. 먼저 dockerfile을 작성 후

```dockerfile
FROM docker.elastic.co/beats/filebeat:7.6.1
COPY filebeat.yml /usr/share/filebeat/filebeat.yml
USER root
RUN chown root:filebeat /usr/share/filebeat/filebeat.yml
```

`Dockerfile` 이 있는 폴더에 `filebeat.yml` 파일을 복사한 뒤 빌드해보자.

```sh
$ docker build --tag filebeat/nodejs:0.0.1 .
```

컨테이너에서 호스트 네트워크를 볼 수 있게 하고 로그 파일이 있는 경로를 마운트하면서 컨테이너를 실행해보자

```sh
$ sudo docker run --network host  -v /usr/local/var/log:/usr/local/var/log filebeat/nodejs:0.0.1
```

> mac 환경에서 `Mounts Denied...` 와 같은 에러가 뜬다면, docker desktop에서 setting-> file sharing탭에서 로그 저장 경로를 추가해주어야 한다.

# Reference

https://www.elastic.co/guide/en/elastic-stack-get-started/current/get-started-docker.html

