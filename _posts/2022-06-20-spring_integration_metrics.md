---
title: "Spring integration metrics"
excerpt: "prometheus에 저장되는 `spring_integration*` 메트릭들을 정리."

categories:
  - TIL
tags:
  - spring
  - spring cloud data flow
  - kafka
  - spring integration
  - micrometer
  - prometheus
  - metrics
last_modified_at: 2022-06-20T08:06:00-05:00
---


# spring integration metrics
prometheus에 저장되는 `spring_integration*` 메트릭들을 정리.

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
벤더 중립적인 메트릭 인터페이스 "Think SLF4J, but for metrics."

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
  - Channel, Handler에서 처리한 메세지 수
- `spring_integration_send_seconds_max`
  - Channel, Handler의 최대 메세지 처리 시간
- `spring_integration_send_seconds_sum`
  - Channel, Handler의 처리시간 합

`spring_integration_receive_total`
- Counter
- `MessageSource` 로부터 받은 메세지 수
- Source 앱만 값이 있다.

`spring_integration_channels`
- Gauge
- 앱에 있는 `Channel` 개수
- `input`/`output` 채널 이외 앱 내부 채널이 있을수도 있어서 2이상인 경우도 있다.

`spring_integration_handlers`
- Gauge
- 앱에 있는 `Handler` 개수
- `output` 핸들러 이외 앱 내부 핸들러가 있을수도 있다.

`spring_integration_sources`
- Gauge
- 앱에 있는 `Source` 개수
- Source 앱만 1이상이다

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