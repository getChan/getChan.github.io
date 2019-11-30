---
title:  "NHN Foward 기록"
excerpt: "27일 있었던 nhn foward 세션 기록"

categories:
  - etc
tags:
  - conference
last_modified_at: 2019-11-27T08:06:00-05:00
---
> nhn foward 행사에 다녀왔다. 공부하고 경험해야 할 기술들이 참 많다. 힘내자!
> 이번 포스팅은 발표를 이해하느라 의식의 흐름대로 적었다...
> 이후에 nhn foward 페이지의 발표자료를 찾아서 볼 것이다.


# `깃`깔나는 GIT 워크플로우 알아보기

## Git flow

규칙이 많지만 기계적으로만 지켜주면 많은 사람들의 협업이 가능함


## GitHub flow
 
기존 깃 플로우가 너무 복잡하다.

워크플로우를 이해하기 쉬워 실수가 없어짐

- 지속적 배포
- master가 항상 stable
- topic branch
  - 새로운 기능을 개발할 떄 생성한다
  - Topic branch 자체를 바로 **배포**하게 됨
- 롤백이 필요하다면 master를 배포하게 됨

## GitLab flow

git flow 는 너무 복잡

github flow 는 너무 간단

- 지속적인 배포가 어려울 떄
- 환경별 배포가 필요할 때

- merge 전에 테스트하라
  

# 하이퍼파라미터 탐색을 통한 모델 성능 개선하기

## 모델 성능 개선
1. 학습 데이터 추가
2. 딥러닝 네트워크 개선
3. 하이퍼파라미터 탐색

> 단순 하이퍼파라미터 탐색 작업을 자동화해보자

## 하이퍼파라미터
- learning rate
- number of layers
- batch size
- optimizer
- activation function

## Bayesian Optimization

> random search는 하이퍼파라미터를 random하게 탐색한다.
> 그러나 bayesian optimization의 경우 학습의 결과를 새로운 하이퍼파라미터 탐색에 반영한다.

1. 관측 데이터를 기반으로 f(x)를 추정
   - 베이즈 정리를 활용
   - 가우시안 프로세스
   - 슬롯머신의 결과를 관측
2. 추정 모델을 기반을 탐색할 파라미터를 선택
   - 평균이 큰 것
   - 분산이 큰 것
     - 불확실성을 우선적으로 없애겠다.

### Gaussian Distribution

# Music Mood Classification

## 데이터셋 구축 과정

- **한땀한땀** 수동 라벨링
- Multi-label dataset
- Class imbalanced

## 성능 평가
서비스적 의미 때문에 f1-score 사용

multi-label 문제는
- confusion matrix를 그릴 수 없다.
- 학습이 잘 안되는 Mood 개별 확인

# DNN 보이스 트리거 개발기

## 보이스 트리거

구성
- 특징 추출
- 음성 구간 검출
- 음성 인식
- 판별

### 특징 추출
raw데이터를 목적에 맞게 변환하는 것

음성 인식에서는
- MFCC 등

### MFCC
raw 오디오 데이터를 일정 구간을 나누어 스펙트럼을 분석, 음성 인식에 널리 사용됨

### 음성 구간 검출

어디까지가 음성의 구간인지 판별

- 한국어 42개 음소 + 무음 1개
- 일정 구간마다 backtrace
- rule based 분석


## 음향 모델

**은닉 마르코프 모델**
- 관측된 정보(음성)을 가지고 숨겨진 정보(문자열)을 결정하려는 통계 모델

## 언어 모델

N-gram : N개 단어 시퀀스의 확률
