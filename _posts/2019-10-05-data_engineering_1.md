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
6. 3~5 과정을 `C`폴더에도 같이
   
```shell
mkdir -p ./test/A/ # 1,2
touch ./test/A/{a_1,a_2,a_3}.txt # 3
cp -r ./test/A ./test/B # 4
cd ./test/B/
rename a_ b_ a_?.txt # 5
```

```shell
folder_name='test_2'
mkdir -p $folder_name/A/ # 1,2
touch $folder_name/A/{a_1,a_2,a_3}.txt # 3
cp -r $folder_name/A $folder_name/B # 4
cd $folder_name/B/
rename a_ b_ a_?.txt # 5
```