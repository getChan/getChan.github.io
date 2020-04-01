---
title:  "EventEmmiter를 이용한 Node에서의 Observer패턴"
excerpt: "nodejs에서의 observer 패턴"
categories:
  - TIL
tags:
  - nodejs
  - design pattern
last_modified_at: 2020-04-01T08:06:00-05:00
---

# Observer Pattern

> **옵저버 패턴**이란 상태 변화가 일어날 때 관찰자(Listener)에게 알릴 수 있는 객체(Subject)를 정의하는 패턴.

javascript의 콜백 패턴과의 가장 큰 차이점은 subject가 실제로 **여러 옵저버**들에게 알릴 수 있다는 점. 콜백은 일반적으로 **하나의  listener**인 콜백 함수에게만 전파한다.

node.js에서는 코어에 내장된 클래스를 사용하여 간단하게 구현할 수 있다.

## `EventEmitter` 클래스

<img src="https://www.codeproject.com/KB/recipes/1277373/1_uWYzmc0WG5f0YIKm4ZdjJg.png" alt="Code Your Own Event Emitter in Node.js: A Step-by-step Guide ..." style="zoom:60%;" />

필수 메소드

- `on(event, listener)` : 주어진 `event` 유형에 대해 새로운 `listener`를 등록한다.
- `once(event, listener)` : `event`를 한번 받은 뒤 제거되는 새로운 `listener`를 등록한다.
- `emit(event, [arg1], [...])` :  `event`를 발생시키고 `listener` 에게 추가적인 인자들을 전달한다.
- `removeListener(event, listener)` : 지정된 `event`에 대한 `listener`를 제거

```javascript
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');

function findPattern(files, regex){
  const emitter = new EventEmitter();
  files.foreach(function(file){
    fs.readline(file, 'utf8', (err, content) => {
      if(err)
        return emitter.emit('error', err);
      
      emitter.emit('fileread', file);
      let match;
      if(match = content.match(regex))
        match.foreach(elem => emitter.emit('found', file, elem));
    });
  });
}
```

위에서 정의한 event 객체에 대해 listener를 등록해보자

```javascript
findPattern(
  ['fileA.txt', 'fileB.json'],
  /hello \w+/g
)
.on('fileread', file => console.log(file + ' was read'))
.on('found', (file, match) => console.log('Matched "' + match + '"in file' + file))
.on('error', err => console.log('Error emitted : '+ err.message));
```

## 관찰 가능한 객체

`EventEmitter` 클래스를 가지고  직접 옵저버를 만드는 방법도 있지만, 이는 단순한 이벤트를 만드는 것일 뿐이다. 실제로는 일반 객체가 옵저버 패턴이 가능하도록 만드는 것이 일반적이다.

`EventEmitter`클래스를 상속받아서 일반 객체에 옵저버 패턴을 추가할 수 있다.

```javascript
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');

class FindPattern extends EventEmitter{
  constructor(regex){
    super();
    this.regex = regex;
    this.files = [];
  }
  addFile(file){
    this.files.push(file);
    return this;
  }
  find(){
    this.files.forEach(file =>{
      fs.readFile(file, 'utf8', (err, content) =>{
        if(err){
          return this.emit('error', err);
        }
        this.emit('fileread', file);
        
        let match = null;
        if (match = content.match(this.regex)){
          match.forEach(elem => this.emit('found'. file, elem));
        }
      });
    });
    return this;
  }
}
```

```javascript
const filePatternObject = new FindPattern(/hello \w+/);
findPatternObject
  .addFile('fileA.txt')
  .addFile('fileB.json')
  .find()
  .on('found', (file, match) => {....})
  .on('error', err => {....})
```

실례로 node.js에서 핵심 HTTP모듈인 Server 객체는 위와 같은 패턴으로 구현되어 있다.