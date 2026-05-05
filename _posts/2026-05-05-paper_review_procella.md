---
title: "Procella 논문"
excerpt: "Procella: Unifying serving and analytical data at YouTube"
categories:
  - data
tags:
  - data
  - paper-review
  - query-engine
  - youtube
last_modified_at: 2026-05-05T22:20:00+09:00
---

논문 [Procella: Unifying serving and analytical data at YouTube](https://storage.googleapis.com/gweb-research2023-media/pubtools/5226.pdf)

# 요약

YouTube는 리포팅, 페이지 내 통계, 모니터링, 애드혹 분석처럼 서로 다른 데이터 워크로드를 여러 시스템으로 나눠 처리해 왔다. Dremel, Mesa, Bigtable, Monarch, Vitess 같은 시스템 조합은 강력했지만, ETL 중복과 데이터 불일치, 운영 복잡성도 함께 키웠다.

Procella의 문제의식은 명확하다.

- 하나의 SQL 엔진으로 서로 다른 서빙/분석 워크로드를 다룰 수 없을까
- 배치와 실시간 ingestion을 동시에 다룰 수 없을까
- 낮은 지연과 높은 QPS를 유지하면서도 SQL 기반의 분석성을 보존할 수 없을까

핵심 설계는 다음과 같다.

- 스토리지와 컴퓨트를 분리한다.
- 거의 완전한 SQL을 제공한다.
- 배치 데이터와 실시간 데이터를 같은 엔진에서 처리한다.
- 대규모 스캔뿐 아니라 point lookup, range scan도 고려한다.

논문에서 눈에 띄는 구성요소는 다음과 같다.

- `Artus`
  - Procella의 컬럼 저장 포맷
  - 대용량 스캔뿐 아니라 point lookup과 range scan도 빠르게 하도록 설계되었다.
- `Superluminal`
  - 컬럼 기반 평가 엔진
  - projection, filter pushdown을 강하게 활용해 저지연 실행을 노린다.
- `Adaptive optimization`
  - 샘플 기반 통계를 활용해 실행 시점에 물리 전략을 조정한다.

스토리지 쪽에서도 읽을 양을 줄이기 위한 장치를 적극적으로 쓴다.

- partition / sort key
- zone map
- bitmap index
- bloom filter

# 메모리 버퍼와 영속 로그

실시간 데이터 처리 설명에서 흥미로웠던 부분은 메모리 버퍼와 영속 로그를 함께 사용하는 방식이다.

- 새 데이터가 들어오면 메모리 버퍼에 먼저 들어간다.
- 동시에 영속 로그에도 append된다.
- 그래서 사용자는 파일 compaction이 끝나기 전에도 최신 데이터를 빠르게 조회할 수 있다.

여기서 `dirty-read`는 "아직 최종 정리되지 않은 최신 데이터도 먼저 읽는다"는 의미로 이해하면 된다. 데이터가 잘못되었다기보다, 아직 정렬/병합/압축이 끝나지 않은 상태의 최신 조각을 먼저 보여주는 것이다.

이후 백그라운드에서 `compaction`이 수행된다.

- 로그와 메모리 버퍼의 데이터를 정리된 컬럼 파일로 병합한다.
- 압축과 인덱스 구성을 적용한다.
- 이후 조회 효율과 안정성을 높인다.

즉, `빠른 최신성`과 `내구성`, `나중의 효율적인 저장 형태`를 동시에 잡으려는 구조다.

# 성과

논문에 따르면 Procella는 YouTube Analytics 같은 실제 서비스에서 매우 큰 규모로 사용된다.

- 하루 15억+ 쿼리
- 실시간 데이터 대상 7억+ 쿼리
- 하루 80경+ row 스캔
- YouTube Analytics 인스턴스 기준 p50 25ms, p99 412ms

한 줄로 요약하면, Procella는 `초고QPS 실시간 서빙과 대규모 분석을 하나의 분산 SQL 엔진으로 통합하려는 YouTube의 실전 시스템`이다.
