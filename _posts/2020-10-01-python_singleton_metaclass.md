---

title: "파이썬 메타클래스를 이용한 싱글톤 패턴 구현"
excerpt: "환경변수 설정 시 싱글톤 패턴 사용하는 예제"
categories:
  - TIL
tags:
  - python
  - design pattern
  - singleton
last_modified_at: 2020-10-01T08:06:00+09:00
---

환경변수를 로드하는 등의 경우에서 싱글톤 패턴을 활용하면 메모리 효율도 좋아지고 안전성도 강화할 수 있다.

파이썬에서 메타클래스란 간단하게 클래스를 설명하는 개념인데, 파이썬은 모든 것이 객체로 이루어져 있기 때문에(예를 들어, 객체 `3`의 클래스는 `int`이고 `int`의 클래스는 `type`이다.) 메타클래스는 `type`을 상속받아 정의하게 된다. (정확한 정보가 아닙니다. 저의 추측일 뿐이에요)

아무튼 메타클래스를 이용해서 싱글톤 객체를 구현할 수 있다.

# 코드

```python
class Singleton(type):

  _instances = {}

  def __call__(cls, *args, **kwargs):
    if cls not in cls._instances:
      cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
    return cls._instances[cls]
    
class ConfigDict(dict, metaclass=Singleton):
  def __init__(self):
    super().__init__(self.read_config_file())

  @staticmethod
  def read_config_file():
    """
    Reads config file based on path passed when running app.
    :return: (dict) loaded data from yml file
    """
    config_file_path = sys.argv[-1]
    if not config_file_path.endswith(".yml"):
      raise ConfigDictError(message=f"yml file not passed into flask app but {config_file_path} instead")
    return yaml.load(open(str(config_file_path)), Loader=yaml.FullLoader)
```


# Reference

https://towardsdatascience.com/memory-management-in-python-6bea0c8aecc9

