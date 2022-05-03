---
title: "WebAssembly 모아보기"
excerpt: "wasm 란 뭘까. 왜 뜰까. 꼭 필요할까?"

categories:
  - TIL
tags:
  - webassembly
  - rust
last_modified_at: 2022-05-03T08:06:00-05:00
---

# 뭘까. 왜 생겨났을까
- [카툰으로 설명하는 웹어셈블리(번역)](https://dongwoo.blog/2017/06/06/%eb%b2%88%ec%97%ad-%ec%b9%b4%ed%88%b0%ec%9c%bc%eb%a1%9c-%ec%86%8c%ea%b0%9c%ed%95%98%eb%8a%94-%ec%9b%b9%ec%96%b4%ec%85%88%eb%b8%94%eb%a6%ac/)
  
# 꼭 필요할까? 대세 기술이 될 수 있을까?
  - [Zaplib 부검](https://zaplib.com/docs/blog_post_mortem.html#-zaplib-post-mortem)
    > 원래 Zaplib라는 프로젝트는 다음 가설에서 시작했음.
    > JS와 브라우저는 느림
    > 점진적으로 JS를 Rust/Wasm으로 이식하면 앱 속도가 빨라짐
    > 작은 포팅에서 시작 및 확장하여 전체 앱을 전환
    > 장기적으로 이것은 차세대 스택("앱을 위한 Unity")으로 진화
    > 그러나 여러 프로토타입과 유즈케이스들의 결과 WASM은 일반적으로 약 2배정도 빨랐음.
    > 10배까지 빨라지려면 러스트의 제로비용 추상화를 최대한 활용해야하며 백만개의 객체를 처리하는 정도여야했고 이는 도입에 드는 비용이 훨씬 큼을 의미.
    >
    > 오히려 WebGL을 이용한 그래픽 가속이 미치는 영향이 훨씬 컸음.
    > WASM을 사용하기로 유명한 Figma도 C++ 코드를 활용하기 위한 역사적 이유 때문이었으며, WebGL이 주요 성능향상 원인이었음.
    >
    > **따라서 프로젝트를 유지관리모드로 전환**

# 이 외 좋은 문서들
- https://developer.mozilla.org/ko/docs/WebAssembly