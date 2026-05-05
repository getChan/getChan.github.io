---
title: "AnyBlob 논문"
excerpt: "Exploiting Cloud Object Storage for High-Performance Analytics"
categories:
  - data
tags:
  - data
  - paper-review
  - object-storage
  - olap
last_modified_at: 2026-05-05T22:20:00+09:00
---

논문 [Exploiting Cloud Object Storage for High-Performance Analytics](https://www.durner.dev/app/media/papers/anyblob-vldb23.pdf)

# 요약

이 논문은 "오브젝트 스토리지를 직접 읽는 OLAP 엔진이, 로컬 SSD 캐시 없이도 충분히 빠를 수 있는가"를 묻는다. 결론은 `가능하다`에 가깝다.

예전에는 원격 스토리지가 로컬 디스크보다 훨씬 느리다는 가정이 강했다. 하지만 최근 클라우드 인스턴스는 네트워크 대역폭이 커졌고, 이 논문은 바로 그 지점에서 오브젝트 스토리지를 분석 엔진의 직접 데이터 소스로 다루는 방법을 제시한다.

핵심 문제는 세 가지다.

- 오브젝트 요청 하나의 지연이 크다.
- 인스턴스의 전체 네트워크 대역폭을 쓰려면 많은 요청을 동시에 날려야 한다.
- 네트워크 I/O는 로컬 디스크보다 CPU 오버헤드가 크다.

이 문제를 해결하기 위해 논문은 `AnyBlob`이라는 다운로드 매니저를 제안한다.

- 쿼리 엔진 내부에서 동작한다.
- 처리량은 높이고 CPU 사용량은 낮추는 것이 목표다.
- 멀티 클라우드 환경도 고려한다.

논문은 AWS S3, GCP Storage 같은 오브젝트 스토어에서 성능과 비용 관점의 retrieval 설정을 실험적으로 분석하고, 이를 Umbra DBMS에 통합했다. 결과적으로 scan operator가 원격 데이터를 직접, 그리고 효율적으로 읽을 수 있게 된다.

# 핵심 메시지

- 로컬 SSD 캐시는 항상 필수는 아니다.
- 네트워크가 충분히 빠르면 object store direct read도 경쟁력이 있다.
- 관건은 "좋은 다운로드 계층"이다.

이 논문의 인상적인 부분은 단순히 "S3도 쓸 수 있다"가 아니라, `어떻게 해야 진짜로 인스턴스 네트워크 대역폭을 다 활용할 수 있는지`를 구체적으로 다뤘다는 점이다.

# 결과

논문에 따르면 Umbra + AnyBlob은 캐시 없이도 로컬 SSD 캐시를 활용하는 최신 클라우드 DW들과 비슷한 성능을 보였다. 대신 컴퓨트와 스토리지를 더 자연스럽게 분리할 수 있어서 elasticity 측면에서 이점이 있다.

한 줄로 요약하면, AnyBlob은 `오브젝트 스토리지를 느린 백업 저장소가 아니라 고성능 분석 엔진의 직접 데이터 소스로 쓰기 위한 다운로드 계층`이다.
