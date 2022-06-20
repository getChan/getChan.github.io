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

# spring integration metrics
prometheus에 저장되는 `spring_integration*` 메트릭들을 정리했습니다. 참고되실까 하여 공유드립니다.

메트릭은 spring integration(stream) 애플리케이션에서 micrometer를 통해 prometheus로 전달됩니다. 

## Spring Integration
spring integration 개념에서 메트릭이 저장되기 때문에 관련 용어를 정리했습니다.
- `Channel`
  - 메세지 브로커와 동일한 개념(Kafka)
  - stream 앱에는 `input`/`output` 채널뿐만 아니라 앱 내부적으로 사용하는 채널이 있을수도 있다.
- `Handler`
  - `Channel` 로부터의 outbound 처리를 담당한다.
  - `output` 채널에 대한 핸들러뿐만 아니라 앱 내부적으로 사용하는 핸들러가 있을수도 있다.
- `Source`
  - source stream 앱 message의 출처. poll 대상. Channel 아님. 

## micrometer 
벤더 중립적인 메트릭 인터페이스
> Think SLF4J, but for metrics.

메트릭 유형은 크게 3가지로 나뉩니다. 

`Timer` 
> Timers are intended for measuring short-duration latencies and the frequency of such events. All implementations of Timer report at least the total time and the count of events as separate time series.

짧은 시간동안 발생한 이벤트의 처리시간과 횟수를 나타내는 메트릭

`Counter` 
> Counters report a single metric: a count. The Counter interface lets you increment by a fixed amount, which must be positive.

카운터 메트릭


`Gauge`
> A gauge is a handle to get the current value. Typical examples for gauges would be the size of a collection or map or number of threads in a running state.

현재 값을 나타내는 메트릭

# prometheus에 저장되는 메트릭
`spring_integration_send` 는 Timer로. 아래 메트릭들을 저장한다.
- `spring_integration_send_seconds_count`
  - `Channel` 혹은 `Handler`에서 처리한 전송 수
- `spring_integration_send_seconds_max`
  - `Channel` 혹은 `Handler`에서 처리한 전송 시간 중 최대값
  - **최대 처리 시간**
- `spring_integration_send_seconds_sum`
  - `Channel` 혹은 `Handler`에서 처리한 전송 시간 합


`spring_integration_receive_total`
- Counter
- `MessageSource` 로부터 받은 메세지 수
- Source 앱만 값이 있다.

`spring_integration_channels`
- Gauge
- 앱에 있는 `MessageChannels` 개수
- `input`/`output` 채널 이외 앱 내부 채널이 있을수도 있어서 2이상인 경우도 있다.

`spring_integration_handlers`
- Gauge
- 앱에 있는 `MessageHandlers` 개수
- `output` 채널 핸들러 이외 앱 내부 채널이 있을수도 있다.

`spring_integration_sources`
- Gauge
- 앱에 있는 `MessageSource` 개수
- Source 앱만 양수값이 있다.

`spring_integration_channel_queue_remaining_capacity`
- Gauge
- 큐의 남은 용량
- kafka는 구현 안됨.

`spring_integration_channel_queue_size`
- Gauge
- 큐 사이즈
- kafka는 구현 안됨.

# reference
- [spring-integration](https://docs.spring.io/spring-integration/docs/5.3.2.RELEASE/reference/html/metrics.html)
- [micrometer](https://micrometer.io/docs/concepts#_meters)