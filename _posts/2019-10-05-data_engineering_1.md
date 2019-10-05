---
title: "DE 스터디(1) - 리눅스 커맨드"
excerpt: "data engineering 스터디 정리입니다."

categories:
  - db
tags:
  - study
  - linux
  - system
last_modified_at: 2019-10-05T08:06:00-05:00
---

# 리눅스 커맨드

## 기본 파일 다루기
- 파일 생성 : `touch`, `cat`
- 파일 복사 : `cp <파일경로>/<복사할 파일명> <복사할 경로>/<저장할 파일명>`
  - `cp a* ../B/` : a로 시작하는 파일명을 가진 파일들을 상위 폴더 내의 B 폴더로 복사해라
  - `cp -r ./B ./D` : B폴더 전부를 D폴더로 복사(`-r` : recursive)
- pwd : 현재 폴더의 절대경로
- 이름변경 : `rename <공통부분> <변경양식> <참조파일의 형식>`
  - `rename a_ b_ a_?.txt` : 'a_?.txt'와 같은 형식의 파일의 'a_'를 'b_'로 바꿔라
- 파일이동 : `mv <from> <to>` 
  - `mv ./d_?.txt ../C` : 현재 `d_?.txt` 형식의 파일을 C폴더로 옮긴다.
  - `mv -r <from> <to>` : 폴더 이동

## yum
RPM 기반의 시스템을 위한 자동 업데이터 겸 패키지 설치/제거 도구이다
- `sudo yum instll wget`
> wget : 특정 url에 있는 파일을 가져온다.
  
## shell script
```shell
name="chan"
echo $name
echo "Hello world ${name}"
```

### 실습
1. `test` 폴더 만들기
2. `A` 폴더 만들기
3. `A` 폴더 안에 `a_1.txt` ~ `a_4.txt` 만들기
4. `A` 폴더를 `B`폴더로 복사
5. `B` 폴더 내 파일명 변경 : `a_` -> `b_`
   
```shell
mkdir -p ./test/A/ # 1,2
touch ./test/A/{a_1,a_2,a_3}.txt # 3
cp -r ./test/A ./test/B # 4
cd ./test/B/
rename a_ b_ a_?.txt # 5
```

```shell
folder_name='test_2'
mkdir -p $folder_name/A/
touch $folder_name/A/{a_1,a_2,a_3}.txt
cp -r $folder_name/A $folder_name/B
cd $folder_name/B/
rename a_ b_ a_?.txt
```

### 환경 변수
`echo $HOME` : 홈 디렉토리를 출력한다

`export` : 환경 변수들을 보여준다.

환경 변수 추가하기 : `export folder_name = 'test_1000'`

다시 쉘 스크립트 실행하면 환경 변수를 그대로 가져와서 `test_1000` 폴더를 생성한다.

### 인자  전달하기
```shell
folder_name=$1 # 첫 번째 positional argment
mkdir -p $folder_name/A/
touch $folder_name/A/{a_1,a_2,a_3}.txt
cp -r $folder_name/A $folder_name/B
cd $folder_name/B/
rename a_ b_ a_?.txt
```
`sh test.sh test_args`로 커맨드를 하면 `test_args`가 `folder_name`이 된다.

## 파이썬 파일과 연동하기
파이썬 파일을 쉘 스크립트에서 실행할 수 있다. --> 무한 응용 가능~~!!