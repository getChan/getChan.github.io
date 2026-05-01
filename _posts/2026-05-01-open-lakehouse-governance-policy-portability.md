---
title: "Unifying Open Lakehouse Governance via Policy Portability"
excerpt: "Scott Haines session notes"
categories:
  - data
tags:
  - data
  - lakehouse
  - governance
last_modified_at: 2026-05-01T20:00:00+09:00
---

# Unifying Open Lakehouse Governance via Policy Portability

- Speaker: Scott Haines
- Event: Seattle/Bellevue DataFusion Meetup
- Video: https://www.youtube.com/watch?v=WMhaqR5pgYU

## AI 요약

이 발표는 open lakehouse 환경에서 거버넌스 정책을 특정 엔진 구현에 묶지 않고, 다른 엔진으로 이식 가능한 형태로 다루는 방법을 설명한다. 발표자는 멀티클라우드, 멀티플랫폼, 멀티카탈로그 환경에서는 엔진마다 접근 제어나 필터링 방식을 따로 구현하면 운영 복잡성이 커지기 때문에, 정책 자체를 portable하게 다뤄야 한다고 본다.

핵심 아이디어는 정책을 `Cedar`로 기술하고, 이를 `CEL(Common Expression Language)` 표현식으로 컴파일한 뒤, 다시 `DataFusion expression`으로 매핑해서 실제 쿼리 엔진에 밀어 넣는 것이다. 발표에서는 row filter, column mask, target table 같은 확장 정보를 Cedar 정책에 붙이고, 이 결과를 policy manifest 형태로 만들어 DataFusion 쪽에서 읽어 실행에 반영하는 흐름을 보여준다.

구현 관점에서는 DataFusion의 `TableProvider`를 감싼 `govern table` 래퍼가 중심이다. 이 래퍼는 사용자 identity와 policy manifest를 함께 받아서, 실제 Delta Lake 테이블을 읽기 전에 row filter와 column mask를 pushdown하는 역할을 한다. 발표자는 이 방식이 Delta에 국한된 것이 아니라 Hudi, Iceberg 같은 다른 table provider 계층으로도 확장 가능하다고 설명한다.

데모에서는 의료 데이터 예시를 사용했다. physician은 자신이 담당하는 환자 정보만 조회할 수 있고, analyst는 social security number나 diagnosis 같은 민감 정보를 볼 수 없도록 정책이 적용된다. 발표의 메시지는 정책 문서를 따로 두는 거버넌스가 아니라, 쿼리 계획 단계에서 실제로 강제되는 거버넌스를 만들자는 데 있다.

한 줄로 정리하면, 이 발표는 `Cedar -> CEL -> DataFusion expression` 경로를 통해 open lakehouse에서 정책을 엔진 독립적으로 정의하고, row filtering과 column masking 같은 enforcement를 실행 엔진까지 밀어 넣는 policy portability 접근을 소개한다.

## 느낀점

- 회사에서 거버넌스 정책이 문서로만 정의되어 있어 엄밀하지 않고, 시스템과의 통합이 까다롭다는 문제가 있다. 본 아이디어를 참고해도 좋을 듯.
- AI가 문서 기반으로 Policy as Code를 생성한다면, 정책 관리와 운영 측면에서 꽤 유용할 듯.
- 다만 Unity Catalog 통합은 아직까지는 잘 안 되어 있는 것 같다.
- 또 정책 기능들도 데이터 관련 기능들(RBAC, ABAC) 위주라 한계가 있어 보인다. 내가 필요한 것은 "외주 직원의 경우 어떤 그룹에 속해야 한다" 같은, 회사 맥락이 더 강하게 반영된 정책 명시다.
