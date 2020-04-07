---
title:  "Nodejs 디자인 패턴(2)-Factory 패턴"
excerpt: "nodejs에서의 Fatory 패턴"
categories:
  - cs
tags:
  - nodejs
  - design pattern
last_modified_at: 2020-04-05T08:06:00-05:00
---

# Factory Pattern

JS에서 `new` 연산자 혹은 `Object.create()`를 사용하여 프로토타입에서 직접 새 객체를 만드는 대신 팩토리를 호출하면 여러 면에서 훨씬 편리하고 유연하다.

팩토리는 객체 생성을 구현과 분리할 수 있게 해 준다. 팩토리의 소비자는 인스턴스 생성이 수행되는 방법에 대해서는 전적으로 알 필요가 없다. 

다음과 같이 이미지를 생성하는 팩토리를 작성하면 유형에 따라 다른 객체를 생성할 수 있다.

```javascript
function createImage(name){
  if(name.match(/\.jpeg$/)){
    return new JpegImage(name);
  }else if(name.match(/\.gif$/)){
    return new GifImage(name);
  }else if(name.match(/\.png$/)){
    return new PngImage(name);
  }else{
    throw new Exception('Unsupported format');
  }
}
```

## 캡슐화

캡슐화란 *외부 코드가 내부 정보에 대해 직접 조작하지 못하게 하여 객체의 접근을 제어하는 기술*이다.

팩토리는 생성된 객체의 생성자를 노출시키지 않고 객체를 확장, 수정하지 못하도록 캡슐화해야 한다.

js에서는 접근 수준 지정자가 없으므로 function scopes와 closure를 이용해 캡슐화를 적용해야 한다.

```javascript
function createPerson(name){
  const privateProperties = {};
  
  const person = {
    setName : name => {
      if(!name)
        throw new Error('Must have name') // name이 단순 person의 속성일 경우 강제할 수 없다!
      privateProperties.name = name;
    },
    getName : () => {
      return privateProperties.name;
    }
  };
  
  person.setName(name);
  return person;
}
```

## 예제 : 코드 프로파일러

다음과 같은 프로파일러 코드가 있다고 하자.

```javascript
class Profiler{
  constructor(label){
    this.label = label;
    this.lastTime = null;
  }
  start(){
    this.lastTime = process.hrtime();
  }
  end(){
    const diff = process.hrtime(this.lasttime);
    return diff;
  }
}
```

위 코드가 프로덕션 환경에서는 동작하지 않게 하고 싶을 때, Profiler의 생성을 추상화하기 위해 팩토리를 사용할 수 있다.

```javascript
module.exports = function(label){
  if(process.env.NODE_ENV === 'development'){
    return new Profiler(label);
  }else if(process.env.NODE_ENV === 'production'){
    return{
      start : () => {},
      end : () => {}
    }
  }else{
    throw new Error('Must set NODE_ENV');
  }
}
```

이렇게 팩토리를 이용해서 구현과 객체의 생성을 분리할 수 있다.

# Composable 팩토리 함수

조합이 가능한 특정 유형의 팩토리 함수를 말한다. 복잡한 클래스 계층 구조를 만들지 않고도 속성을 상속하는 객체를 만들 때 유용하다. 많은 자유를 제공하고 클래스의 관점보다는 동작의 관점에서 사고 할 수 있는 매커니즘이다. 대표적인 패키지로 [Stamp](https://medium.com/javascript-scene/introducing-the-stamp-specification-77f8911c2fee)가 있다.

# 추상 팩토리 패턴

**추상 팩토리 패턴**(Abstract factory pattern)은 다양한 구성 요소 별로 '[객체](https://ko.wikipedia.org/wiki/객체_(컴퓨터_과학))의 집합'을 생성해야 할 때 유용하다. 이 패턴을 사용하여 상황에 알맞은 객체를 생성할 수 있다.

![Abstract factory UML.svg](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Abstract_factory_UML.svg/1920px-Abstract_factory_UML.svg.png)

```python
import enum
from abc import *

class Button:
  @abstractmethod
  def Paint(self):
    pass

class MousePointer:
  @abstractmethod
  def Paint(self):
    pass

class GUIFactory:
  @abstactmethod
  def CreateButton(self):
    return Button
  
  @abstractmethod
  def CreateMousePointer(self):
    return MousePointer

class WinFactory(GUIFactory):
  def CreateButton(self):
    return WinButton()
  def CreateMousePointer(self):
    return WinMousePointer()
  
class OSXFactory(GUIFactory):
  def CreateButton(self):
    return OSXButton()
  def CreateMousePointer(self):
    return OSXMousePointer()
 
class WinMousePointer(MousePointer):
  def Paint(self):
    print("Render a mousepointer in a Windows style")

class OSXMousePointer(MousePointer):
  def Paint(self):
    print ("Render a mousepointer in a OSX style")

class WinButton(Button):
  def Paint(self):
    print ("Render a button in a Windows style")
    
class OSXButton(Button):
    def Paint(self):
        print ("Render a button in a Mac OSX style")

class Settings:
  @staticmethod
  def Default():
    return Appearance.WIN
  
class Apperance(enum.Enum):
  WIN = 0
  OSX = 1

def main():
  appearance = Settings.Default()
  if apperance == Appearance.WIN:
    factory = WinFactory()
  elif appearance == Appearance.OSX:
    factory = OSXFactory()
  button = factory.CreateButton()
  mousePointer = factory.CreateMousePointer()
  button.Paint()
  mousePointer.Paint()

if __name__ == '__main__':
  main()
```



# Reference

책 *<Node.js 디자인 패턴>,  Mario Casciaro*

[위키백과](https://ko.wikipedia.org/wiki/추상_팩토리_패턴)

