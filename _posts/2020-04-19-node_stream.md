---
title:  "Nodejs 디자인 패턴(3)-Stream Coding"
excerpt: "nodejs에서의 Stream Coding하기"
categories:
  - cs
tags:
  - nodejs
  - design pattern
  - stream
last_modified_at: 2020-04-19T08:06:00-05:00
---

# 스트림

node.js 와 같은 이벤트 기반 플랫폼에서 입출력을 처리하는 효율적인 방법은 실시간으로 가능한 순간 바로 입력을 사용하고 어플리케이션에서 출력이 생성되는 즉시 내보내는 것입니다. 스트림을 사용하면 리소스에서 도착하자마자 데이터를 처리할 수 있습니다.

## 공간 효율성

V8의 버퍼는 `0x3FFFFFFF` 바이트보다 클 수 없습니다. 이보다 큰 파일을 모드 읽은 후 커다란 버퍼를 반환하는 API는 적절하지 않습니다.

## 시간 효율성

다음 코드와 같이 클라이언트에서 스트림을 사용하면 파일 시스템에서 데이터 덩어리를 읽는 즉시 압축하고 보낼 수 있습니다. 서버에서는 원격 peer에서 수신된 즉시 모든 덩어리를 압축 해제할수 있습니다.

```js
// Server
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');

const server = http.createServer((req, res) => {
  const filename = req.headers.filename;
  console.log('File request received: ' + filname);
  req
 	.pipe(zlib.createGunzip())
 	.pipe(fs.createWriteStream(filename))
 	.on('finish', ()=> {
    	res.writeHead(201, {'Content-Type' : 'text/plain'});
    	res.end("That's it\n");
    	console.log("file saved");
  })
})

server.listen(3000, () => console.log('Listen...'))
```

```js
const fs = require('fs');
const zlib = require('zlib');
const http = require('http');
const path = require('path');
const file = process.argv[2];
const server = process.argv[3];

const options = {
  hostname : server,
  port : 3000,
  path : '/',
  method : 'PUT',
  headers = {
  	filename : path.basename(file),
    Content-Type : 'application/octet-stream',
    Content-Encoding : 'gzip'
	}
}

const req = http.request(options, res => {
  console.log('Server response: '+ res.statusCode);
});

fs.createReadStream(file)
.pipe(zlib.createGzip())
.pipe(req)
.on('finish', () => {
  console.log('File sent');
});
```

스트림을 사용하면 전체 파일을 읽을 때까지 기다리지 않고 첫 번째 데이터 덩어리를 수신하자마자 조립 라인이 시작됩니다. 데이터의 다음 덩어리가 사용 가능한 상태가 될 때, 이전 작업들이 완료될 때까지 기다릴 필요가 없습니다. 대신 조립 라인은 병렬로 실행됩니다.

이는 각 작업이 비동기적이면서 node.js에 의해 병렬로 실행될수 있기 때문에 완벽히 작동합니다.

유일한 제약은 데이터 덩어리가 각 단계에 도착하는 순서가 보존되어야 한다는 것입니다.

## 결합성

위에서 `pipe()` 메소드를 통해 단일 기능을 담당하는 서로 다른 프로세스 유닛들을 연결할 수 있는지 보았습니다. 유일한 전제 조건은 파이프라인의 다음 스트림이 이전 스트림에 의해 생성되어 전달된 데이터 타입을 지원해야 한다는 것입니다.

이미 존재하는 파이프라인에 간단히 변환 스트림을 끼워넣어 스트림을 재사용할 수 있습니다. 스트림을 사용하면 더 깨끗하고 모듈화된 코드를 만들 수 있습니다.

```js
const crypto = require('crypto');
//...
fs.createReadStream(file)
	.pipe(zlib.createGzip())
	.pipe(crypto.createCipher('aes102', 'a_shared_secret')
	.pipe(req)
	.on('finish', () => console.log('File Sent'))
```

