---
title: "DE 스터디(5) - Kubernetes"
excerpt: "data engineering 스터디 정리입니다."

categories:
  - data
tags:
  - study
  - linux
  - dataEnginnering
  - docker
  - kubernetics
last_modified_at: 2019-12-04T08:06:00-05:00
---

# Kubernetes

Kubernetes 기반 개발 프로세스

![]({{site.url}}/assets/images/data_enginnering_study/kubernetes.png)

- Kubernetes란?
  - Container Orchestration 역할
    - 스케줄링 : container를 적절한 서버에 배포해주는 작업. 툴에 따라 스케줄링 방법(랜덤, 순차적 배포) 전략 선택 가능
    - 클러스터링 : 여러개의 서버를 하나의 서버처럼 사용하는 방법. 클러스터에 새로운 서버를 추가 및 제거 가능
    - 서비스 디스커버리 : 여러 Node에 생성되는 서비스들의 정보를 중앙 관리
    - 로깅 : 여러 대의 서버의 로그를 모아서 한 곳에서 관리함
    - 모니터링 등
  - 종류
    - Docker Swarm
    - Kubernetes
    - Apache MESOS

## Kubernetes Cluster

![]({{site.url}}/assets/images/data_enginnering_study/k8s_cluster.png)

- Kubernetes Cluster
  - 하나의 클러스터 안에 Master와 여러 Node로 구성
- Master
  - 노드를 관리하는 주체
  - 노드의 글로벌 이벤트를 감지하고 응답하는 등 의사결정을 수행
  - Kube API server
    - API 개체에 대한 유효성을 검사, 구성
  - Controller Manager
    - 핵심 Kubernetes Controller가 실행되는 프로세스
    - 실제 노드에 배포될 Pod, Endpoint 등을 생성, 업데이트, 삭제하는 매니저 역할
    - Deployment, StatefulSets 등 기능에 따라 다수의 컨트롤러가 존재
  - Scheduler
    - 노드에 아직 할당되지 않은 Pod들을 감시하고 실행될 노드를 선택
  - etcd
    - Kubernetes의 저장소로 활용

## Node

![]({{site.url}}/assets/images/data_enginnering_study/k8s_node.png)

- node
  - VM 또는 실제 머신을 의미
  - kubelet이라는 에이전트를 통해 마스터와 통신
  - 실제 컨테이너인 Pod가 생성되는 곳
- Pod
  - Containerize app이 배포되는 컴포넌트
    - 복수개의 컨테이너 구성하는 경우는 Strongly coupled한 관계로 Life-Cycle이 일치하는 경우
    - MSA에서는 보통 1개 Container당 1개의 app
  - Scaling, Replication의 단위
- Deployment
  - 애플리케이션의 배포/삭제, Scale Out의 역할
  - Deployment를 생성하면 Pod, ReplicaSets를 함께 생성
  - Pod이 생성되면서 컨테이너화된 애플리케이션 등이 배포되고 ReplicaSets는 애플리케이션의 replica 수를 지속적으로 모니터링하고 유지시킴

## Service

![]({{site.url}}/assets/images/data_enginnering_study/k8s_service.png)

- service
  - Pod의 논리적 집합과 액세스 정책을 정의하는 추상화 개념
  - 서비스가 타겟으로 하는 Pod의 집합은 LabelSelector에 의해 결정
    - Label
      - Pod과 같은 object에 설정되는 key/value 쌍의 별칭
    - Selector
      - 타 Object를 찾기 위한 별칭 검색어
      - 해당 서비스에서 관리하는 Pod의 목록(실제 pod의 엔드포인트)를 맵핑하고 있는 Endpoint 객체가 자동으로 생성
      - Pod이 죽으면 자동으로 Endpoint에서 제거되고, Selector와 매칭되는 새로운 Pod가 생기면 자동으로 추가됨
    - 로드밸런싱, 서비스 디스커버리 등 제공
    - 서비스를 통해 외부에서 접속하거나 클러스터 내부에서만 접근하도록 설정 가능

- Pod = Container = Application
- Deployment : Pod을 생성해주는 것
- Service : Application을 외부에 노출시켜주는 것