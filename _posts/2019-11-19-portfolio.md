---
title:  "남궁찬의 포트폴리오"
excerpt: "개발자 지망생 남궁찬의 포트폴리오"

categories:
  - projects
tags:
  - portfolio
last_modified_at: 2019-12-12T08:06:00-05:00
---
> 끊임없이 성장하고 새로운 것을 반기는 개발자 지망생


# Profile

## 남궁찬

- GitHub 
  
  **https://github.com/getChan**

- Email :e-mail:
  
    **9511chn@gmail.com** 

현업 프로그래밍 세상에 뛰어들고자 하는 개발자 지망생 입니다. 대용량 데이터를 효율적으로 처리하는 개발자가 되고 싶습니다. 다가오는 세상이 필요로 하는 새로운 기술에 많은 관심이 있습니다.

# Education :books:

- 2014.03 ~ 2020.02 **인천대학교 컴퓨터공학부 / 인공지능학과 부전공**
  
  :heavy_check_mark:전산학 :heavy_check_mark:인공지능

- 2018.07 ~ 2019.05 **교내 `데이터지능 연구실` 학부연구생 활동**

  :heavy_check_mark:딥러닝 :heavy_check_mark:Linux

- 2019.01 ~ **대학생 빅데이터 연합동아리 `BOAZ` 활동**

  :heavy_check_mark:데이터분석 :heavy_check_mark:머신러닝/딥러닝 :heavy_check_mark:`Hadoop`:elephant:/`Spark`

- 2019.07 ~ 2019.08 **데이터진흥원 `데이터청년캠퍼스` 지능정보시스템과정 수료**

  :heavy_check_mark:Python/Numpy/Pandas :heavy_check_mark:Flask(Basic)
  
# Projects :writing_hand:

## 인터넷방송 채팅 분석을 통한 필터링 시스템

- 데이터청년캠퍼스 프로젝트
- 팀장
- 2019.07 ~ 2019.08
- 3등 :3rd_place_medal:
- [GitHub Repo](https://github.com/getChan/korea-3)
- [결과물](https://chrome.google.com/webstore/detail/cyberaffiti/iglebngmpbfnkjcccpkdleefmdpekkoe)(Chrome Extension)
- [최종 발표 자료](https://github.com/getChan/korea-3/blob/master/docs/%EC%B5%9C%EC%A2%85%EB%B0%9C%ED%91%9C.pdf)

채팅 데이터를 분석하여 유해정도를 산출하는 딥러닝 모델을 만들고, 해당 모델을 통해 인터넷방송 다시보기와 실시간 스트리밍 인터넷방송에 대해 유해도를 산출하여 필터링하는 시스템을 개발했습니다.

**데이터 수집**과 **전처리**, 딥러닝 **모델 개발**, **서버에 배포**한 뒤 서버에서 사용자의 입력값을 받으면 모델의 결과를 **시각화**하는 역할을 맡았습니다. 팀장을 맡아 협업 이슈도 관리하였으며 발표도 도맡아 진행했습니다.

**데이터 수집** 단계에서는 네트워크 지식을 활용하여 수집 후 정규표현식 등을 이용하여 정제하였습니다.

- :heavy_check_mark:Python :heavy_check_mark:데이터 수집 자동화 :heavy_check_mark:데이터 정제


**데이터 저장** 단계에서는 Sqlite로 클라우드에 **데이터베이스 구축**, 수집한 데이터를 저장하였습니다.

- :heavy_check_mark:sqlite :heavy_check_mark:in AWS:cloud:

**데이터 전처리**는 Byte Pair Encoding을 이용하여 토큰화하였고, 불균형 데이터 처리 등을 진행했습니다.

- :heavy_check_mark:NLP
  

**자연어 모델 개발**은 논문 참고하여 Bi-LSTM Self-Attention 모델을 이용하였습니다.

- :heavy_check_mark:pytorch:fire:(Basic) :heavy_check_mark:NLP

**클라우드**에서 Linux 서버 생성하여 Flask로 웹 개발한 뒤 서비스 하였습니다.

- :heavy_check_mark:Flask(Basic) :heavy_check_mark:Linux

## 수어 동영상 인식을 통한 교육 애플리케이션

- 교내 졸업작품 발표회
- 2019.01 ~ 2019.05
- 동상 :3rd_place_medal:
- [GitHub Repo](https://github.com/getChan/SuicideSquad)

수어 동영상 인식을 통한 교육 애플리케이션을 개발했습니다. 안드로이드에서 수어 동영상을 서버로 전송하면 서버에서 영상처리, 딥러닝 모델을 통해 동영상과 수어가 일치하는지 여부를 보여줍니다.

저는 영상처리, 모델 개발, 모델 배포, 안드로이드 개발을 담당하였습니다.

**영상처리 단계**에서는 색상 검출과 동영상 프레임 처리 등의 전처리를 수행하였습니다.

- :heavy_check_mark:Python :heavy_check_mark:OpenCV

**모델 개발 단계**에서는 동영상 데이터에 적합한 C3D 모델을 구현하여 개발하였습니다.

- :heavy_check_mark:tensorflow

**안드로이드 개발**하였고, 촬영한 동영상을 전송하는 서버와의 **네트워크 프로그래밍**에 중점을 두어 개발하였습니다.

- :heavy_check_mark:Android(Basic)

**AWS**에서 서버 구축하였고, 백엔드 시스템에서 모델 구동과 파일 처리를 위한 스크립트도 작성하였습니다.

- :heavy_check_mark:AWS :heavy_check_mark:Linux :heavy_check_mark:Shell Script