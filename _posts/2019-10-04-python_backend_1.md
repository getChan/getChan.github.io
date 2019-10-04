---
title:  "책 <깔끔한 파이썬 탄탄한 백엔드> 정리(1)-첫 API 개발 시작"
excerpt: "백엔드 공부 자료입니다"

categories:
  - web
tags:
  - book
  - study
  - python
  - flask
  - web
last_modified_at: 2019-10-04T08:06:00-05:00
---

# 첫 API 개발 시작

## ping 엔드포인트 구현하기
엔드포인트(endpoint)란 API 서버가 제공하는 통신 채널 혹은 점점이다. 각 엔드포인트는 고유의 URL주소를 가지게 되며, 이를 통해 해당 엔드포인트에 접속할 수 있다.

일반적으로 각 엔드포인트는 고유의 기능을 담당하며, 엔드포인트들이 모여 하나의 API를 구성한다.

ping 엔드포인트는 주로 API 서버가 현재 운행되고 있는지 아닌지를 확인할 때 사용된다.
	
```python
from flask import Flask

# Flask 클래스를 객체화시킨다. app 변수에 APi설정과 엔드포인트를 추가하면 API가 완성된다.
app = Flask(__name__)

# 데코레이터를 사용하여 엔드포인트 등록 후 주소화 메서드 설정
@app.route('./ping', methods=['GET'])
def ping():
    '''
	Flask가 알아서 HTTP response로 변환하여 클라이언트에게 전송한다.
    '''
	return 'pong'
```

Flask에서의 엔드포인트 구현은 함수 구현과 큰 차이가 없다. 따라서 개발자는 비즈니스 로직을 구현하는 엔드포인트 함수를 중점적으로 개발하면 된다.

## API 실행하기
`FLASK_APP=app.py FLASK_DEBUG=1 flask run`
- FLASK_APP 환경 변수는 FLASK 애플리케이션을 실행시키는 파일을 지정해 주면 된다. 
- FLASK_DEBUG 환경 변수를 1로 지정하면 debug mode가 활성화된다. 코드 수정되었을때 재시작할 필요 없이 자동으로 재시작되어 수정된 코드가 반영된다.

