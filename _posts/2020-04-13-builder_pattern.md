---
title: "빌더 패턴"
excerpt: "python으로 구현해본 빌더 패턴"
categories:
  - TIL
tags:
  - python
  - design_pattern
last_modified_at: 2020-04-13T08:06:00-05:00
---

# Builder Pattern

복합 객체의 **생성 과정과 표현 방법을 분리**하여 동일한 생성 절차에서 서로 다른 표현 결과를 만들 수 있게 하는 패턴. 복잡한 객체를 빌드하는 프로세스를 캡슐화 또는 숨기는 작업을 하고 해당 객체와 해당 구조의 표현을 분리한다.

이에 더해 생성자에 전달하는 인수에 의미를 부여할 수 있다.

생성자를 통해서 멤버를 생성하지 않고 내부 클래스(빌더)를 통해 생성한다.

![Builder UML class diagram.svg](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Builder_UML_class_diagram.svg/1920px-Builder_UML_class_diagram.svg.png)

```python
import abc
# Product
class Pizza(object):
    def setDough(self, dough):
        self.__dough = dough
    
    def setSauce(self, sauce):
        self.__sauce = sauce

    def setTopping(self, topping):
        self.__topping = topping

    def __repr__(self):
        return '\n'.join([self.__dough, self.__sauce, self.__topping])

# Abstract Builder
class PizzaBuilder(metaclass=abc.ABCMeta):
    def getPizza(self):
        return self._pizza
    
    def createNewPizzaProduct(self):
        self._pizza = Pizza()

    @abc.abstractmethod
    def buildDough(self):
        pass

    @abc.abstractmethod
    def buildSauce(self):
        pass

    @abc.abstractmethod
    def buildTopping(self):
        pass

# ConreteBuilder
class HawaiianPizzaBuilder(PizzaBuilder):
    def buildDough(self):
        self._pizza.setDough("cross")
    
    def buildSauce(self):
        self._pizza.setSauce("mild")

    def buildTopping(self):
        self._pizza.setTopping("ham + pineapple")

# ConreteBuilder
class SpicyPizzaBuilder(PizzaBuilder):
    def buildDough(self):
        self._pizza.setDough("pan baked")
    
    def buildSauce(self):
        self._pizza.setSauce("hot")

    def buildTopping(self):
        self._pizza.setTopping("pepperoni+salami")

# Director
class Cook(object):
    def setPizzaBuilder(self, pizzaBuilder):
        self.__pizzaBuilder = pizzaBuilder

    def getPizza(self):
        return self.__pizzaBuilder.getPizza()

    def constructPizza(self):
        self.__pizzaBuilder.createNewPizzaProduct()
        self.__pizzaBuilder.buildDough()
        self.__pizzaBuilder.buildSauce()
        self.__pizzaBuilder.buildTopping()

# 주어진 타입의 피자를 생성
if __name__ == "__main__":
    cook = Cook()
    hawaiianPizzaBuilder = HawaiianPizzaBuilder()
    spicyPizzaBuilder = SpicyPizzaBuilder()

    cook.setPizzaBuilder(hawaiianPizzaBuilder)
    cook.constructPizza()

    pizza = cook.getPizza()

    print(pizza)
```

출력결과

```sh
$ python builder.py 
cross
mild
ham + pineapple
```

