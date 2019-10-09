---
title: "데이터 분석 직무 역량 평가 대비 - 시계열 데이터 처리"
excerpt: "데이터 분석 직무 역량 평가 대비"

categories:
  - ai
tags:
  - study
  - interview
  - data analysis
  - pandas
  - time series
last_modified_at: 2019-10-07T08:06:00-05:00
---

# 시계열 데이터 다루기

## in Python
`datetime`과 `dateutil`을 사용한다. 
```python
import datetime
datetime.datetime(2018,7,30)

from dateutil import parser
parser.parse("4th of July, 2015")
```

## in Numpy
`datetime64` dtype을 사용한다.
```python
import numpy as np
np.array('2015-07-04', dtype=np.datetime64)
```

## in Pandas
- `time stamps*는 시간의 특정 순간을 말한다.
- *time intervals* 또는 *periods*는 특정 시작과 끝 점이 있는 시간의 길이를 말한다.
- *time delta* 또는 *duration*은 정확한 시간의 길이를 말한다.

```python
import datetime
dates = pd.to_datetime([datetime.datetime(2015, 7, 3), '4th of July, 2015', '2015-Jul-6', '07-07-2015', '20150708'])

dates.to_period('D')

# 날짜의 뺄셈 시에 `TimedeltaIndex`형이 생성된다
dates - dates[0]
```

### Regular sequences
```python
pd.date_range('20180702', '20180802', freq='w')

pd.date_range('2015-07-03', periods=8)

pd.date_range('2015-07-03', periods=8, freq='T')
```

### Frequencies and Offsets

| Code   | Description         | Code   | Description          |
|--------|---------------------|--------|----------------------|
| ``D``  | Calendar day        | ``B``  | Business day         |
| ``W``  | Weekly              |        |                      |
| ``M``  | Month end           | ``BM`` | Business month end   |
| ``Q``  | Quarter end         | ``BQ`` | Business quarter end |
| ``A``  | Year end            | ``BA`` | Business year end    |
| ``H``  | Hours               | ``BH`` | Business hours       |
| ``T``  | Minutes             |        |                      |
| ``S``  | Seconds             |        |                      |
| ``L``  | Milliseonds         |        |                      |
| ``U``  | Microseconds        |        |                      |
| ``N``  | nanoseconds         |        |                      |

```python
pd.timedelta_range(0, periods=9, freq="2H30T")

# business day
from pandas.tseries.offsets import BDay
pd.date_range('2015-07-01', periods=5, freq=BDay())
```
