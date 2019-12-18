---
title: "분산컴퓨팅(1)-하둡 개요:elephant:"
excerpt: "빅데이터분산컴퓨팅 강의 정리"

categories:
  - data
tags:
  - dataEnginnering
  - hadoop
last_modified_at: 2019-12-12T08:06:00-05:00
---

> 숭실대학교 박영택교수님의 "빅데이터분산컴퓨팅" 강의를 참고했습니다.

# Hadoop 개요:elephant:

빅데이터를 저장, 처리, 분석할 수 있는 소프트웨어 프레임워크

- Distributed
- Scalable
- Fault-Tolerant
- Open Source

## 분산 처리 시스템

- 하나의 작업에 여러 대의 machine을 사용
- MPI(Message Passing Interface)
- 문제점
  - MPI의 복잡한 프로그래밍
    - 데이터와 프로세스의 sync 유지
  - Bandwidth의 한계
  - Partial Failures
    - 일부 컴퓨터가 고장나는 경우

## Partial Failure

시스템은 반드시 partial failure에 대처가 요구됨

- 컴포넌트의 failure는 애플리케이션 성능 저하를 유발함

## 데이터 Recoverability

시스템의 컴포넌트가 fail하더라도 시스템을 통해 작업은 지속적으로 수행되어야 함

- Failure로 인해 어떠한 데이터의 손실도 발생하면 안됨

## 컴포넌트 Recovery

시스템의 컴포넌트가 fail되고 다시 recover된 경우, 시스템에 rejoin하는 것이 가능해야 함

- 전체 시스템의 재시작 없이 수행

## Consistency

job이 수행되는 동안 컴포넌트의 failure는 결과에 영향을 주지 않아야 함

## Scalability

데이터의 양이 증가하면, 각 작업의 성능이 감소함

- 시스템은 fail되지 않음

시스템의 resource를 증가시키면, 비례적으로 로드 capacity가 증가함

## Core Hadoop Concepts

> Easy to use

- 애플리케이션을 High-level 코드로 작성
  - 개발자에 네트워크 프로그래밍, 의존성, low-level 인프라 구조에 대한 고려가 요구되지 않음
- 각 노드들은 가급적 최소한의 데이터를 주고 받음
  - 개발자는 노드들 사이의 통신에 대한 코드 작성이 필요 없음
  - 'Shared Nothing' architecture
- 데이터는 여러 노드에 미리 분산되어 저장
  - 데이터가 저장된 위치에서 연산을 수행
    - availability와 reliability를 향상 시키기 위해서 데이터는 여러개의 복제본을 두고 사용

## High-Level Overview

- 시스템이 데이터를 로드할 때 'block'으로 나누어짐
  - 기본적으로 64Mb 또는 128Mb 크기를 사용
- Map tasks(MapReduce 시스템의 첫 번째 파트)는 single block 단위의 작업을 처리
- 마스터 프로그램은 분산되어 저장된 데이터의 block에 대한 Map task 작업을 각 노드에 할당
  - 전체 데이터 셋 중 각 노드에 저장된 데이터를 이용해 병렬적으로 작업을 수행

## Fault Tolerance

- 노드가 fail한 경우, master node는 failure를 감지하고 작업을 다른 node에 할당
- Task를 재시작하는 것은 다른 부분에 대한 작업을 수행중인 다른 노드와의 통신을 필요로 하지 않음
- Fail된 node를 재시작하는경우, 자동적으로 시스템에 연결되어 새로운 task를 할당함
- 특정 Node의 성능이 낮은 것으로 감지되면, master node는 같은 task를 다른 node에 할당
  - Speculative Execution



# 