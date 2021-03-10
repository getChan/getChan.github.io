---
title: "Directionality 문자"
excerpt: "자바에서 0x202A ~ 0x202E 유니코드 문자표현"

categories:
  - TIL
tags:
  - java
  - character
last_modified_at: 2021-03-11T08:06:00-05:00
---

문자열 중간에 다음과 같은 유니코드가 끼여 있는 경우가 있다
- `0x202A` - DIRECTIONALITY_LEFT_TO_RIGHT_EMBEDDING
- `0x202E` - POP_DIRECTIONAL_FORMAT
- 등등..

이런 유니코드는 문자의 방향성을 나타내는 코드다. 아랍어, 히브리어는 문장을 `왼쪽->오른쪽`, `오른쪽->왼쪽` 두 방향으로 다 쓴다고 한다.

코드는 String 내에 보이지 않게 숨어있어서 의도한 문자열 처리를 방해할수 있다.

```java
import static java.lang.Character.*;

/**
* Directional 유니코드를 제거한다 (WCRW-785)
*/
public static String removeLTRUnicode(String text) {
    if (text == null) {
        return null;
    }

    StringBuilder removedText = new StringBuilder();

    for (int i = 0, n = text.length(); i < n; ++i) {
        byte d = getDirectionality(text.charAt(i));
        switch (d) {
            case DIRECTIONALITY_LEFT_TO_RIGHT_EMBEDDING:
            case DIRECTIONALITY_POP_DIRECTIONAL_FORMAT:
            ...
                continue;
        }
        removedText.append(text.charAt(i));
    }

    return removedText.toString();
}
```

`java.lang.Character` 클래스에는 해당 코드를 상수값으로 반환하는 `getDirectionality(char ch)` 메서드가 존재한다.

`java.lang.CharacterData` 추상 클래스를 상속받는 클래스들에서 실제 메서드가 구현되어 있다. 다음 코드는 `CharacterData00` 클래스의 구현부이다.(java 1.8)

```java
byte getDirectionality(int ch) {
    int val = getProperties(ch);
    byte directionality = (byte)((val & 0x78000000) >> 27);
    if (directionality == 0xF ) {
        switch(ch) {
            case 0x202A :
                // This is the only char with LRE
                directionality = Character.DIRECTIONALITY_LEFT_TO_RIGHT_EMBEDDING;
                break;
            case 0x202B :
                // This is the only char with RLE
                directionality = Character.DIRECTIONALITY_RIGHT_TO_LEFT_EMBEDDING;
                break;
            case 0x202C :
                // This is the only char with PDF
                directionality = Character.DIRECTIONALITY_POP_DIRECTIONAL_FORMAT;
                break;
            case 0x202D :
                // This is the only char with LRO
                directionality = Character.DIRECTIONALITY_LEFT_TO_RIGHT_OVERRIDE;
                break;
            case 0x202E :
                // This is the only char with RLO
                directionality = Character.DIRECTIONALITY_RIGHT_TO_LEFT_OVERRIDE;
                break;
            default :
                directionality = Character.DIRECTIONALITY_UNDEFINED;
                break;
        }
    }
    return directionality;
}
```