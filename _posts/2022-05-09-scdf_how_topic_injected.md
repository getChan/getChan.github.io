---
title: "SCDF는 stream app에 토픽명을 어떻게 주입해줄까?"
excerpt: "spring cloud dataflow는 stream app에 바인딩 정보를 어떻게 주입해줄까?"

categories:
  - TIL
tags:
  - spring
  - spring cloud data flow
  - kafka
last_modified_at: 2022-05-09T08:06:00-05:00
---

spring cloud dataflow에서 spring cloud stream 파이프라인 생성/배포시에 어떻게 stream app에게 바인딩할 토픽명을 알려주는지 궁금해서 찾아보고 정리

# 코드 따라가기

1. [scdf는 dsl을 파싱해서 Destination 정보를 가져온다.](https://github.com/spring-cloud/spring-cloud-dataflow/blob/397fe3da703a2e120fae98f97eeb74c40b835fb4/spring-cloud-dataflow-core/src/main/java/org/springframework/cloud/dataflow/core/DefaultStreamDefinitionService.java#L56)
2. **[scdf는 destination 이름을 stream app의 binding property key로 주입해준다.](https://github.com/spring-cloud/spring-cloud-dataflow/blob/35009e7f2e866e46bdb019c89aad2e6aabcfcc0d/spring-cloud-dataflow-core/src/main/java/org/springframework/cloud/dataflow/core/StreamApplicationDefinitionBuilder.java#L137)**
3. **위 프로퍼티 key는 `spring.cloud.stream.bindings.input.destination` 이고, 이 프로퍼티는 spring cloud stream 앱에서 바인더의 destination(토픽!) 이름으로 설정된다. [참고](https://cloud.spring.io/spring-cloud-stream/multi/multi__configuration_options.html)**
4. [scdf는 `AppDeploymentRequest` 객체로 프로퍼티를 wrapping해서 skipper에게 배포 REST 요청을 한다.](https://github.com/spring-cloud/spring-cloud-dataflow/blob/d9cffa39ccc6352b2ae0a31a9aa1b2287c57fccc/spring-cloud-dataflow-server-core/src/main/java/org/springframework/cloud/dataflow/server/stream/SkipperStreamDeployer.java#L280)
5. [skipper 서버는 REST 요청을 받는다](https://github.com/spring-cloud/spring-cloud-skipper/blob/86fd25b98ff863281c1119fe3cac6435118d296b/spring-cloud-skipper-server-core/src/main/java/org/springframework/cloud/skipper/server/controller/PackageController.java#L91-L95)
6. [skipper 서버는 해당 요청을 deployer에게 위임한다. `AppDeploymentRequest` 객체를 그대로 넘긴다!](https://github.com/spring-cloud/spring-cloud-skipper/blob/5e5f0714418f3b2442eb242dfde88debc7453b66/spring-cloud-skipper-server-core/src/main/java/org/springframework/cloud/skipper/server/deployer/DefaultReleaseManager.java#L142)
7. [(kubernetes) deployer는 배포한다.](https://github.com/spring-cloud/spring-cloud-deployer-kubernetes/blob/c7063551f158218b5e9df25adb947cec88c3850d/src/main/java/org/springframework/cloud/deployer/spi/kubernetes/KubernetesAppDeployer.java#L120)

# 요약
- 토픽명은 scdf에서 dsl을 파싱한 destination 으로 정해진다.
- 실행될 spring cloud stream app의 프로퍼티로 **scdf가 주입해준다.**
- skipper나 deployer는 프로퍼티를 전달하고 배포하는 역할만 한다.