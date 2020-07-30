---

title: "git에서 변경사항을 다른 브랜치에 커밋하기"
excerpt: "git에서 변경사항을 다른 브랜치에 커밋하기"
categories:
  - TIL
tags:
  - git
last_modified_at: 2020-07-29T08:06:00+09:00
---

```bash
git stash // 커밋하지 않은 변경사항을 임시로 저장한다.
git checkout develop // develop 브랜치로 변경한다.
git stash pop // 임시로 저장한 변경사항을 복원한다.
```



# Reference

http://blog.weirdx.io/post/19504

