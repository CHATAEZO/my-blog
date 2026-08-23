---
title: 오늘 배운 것
date: 2026-08-23
tags: [HTML, CSS, JavaScript, 학습]
description: 클로드 코드로 블로그를 만들면서 배운 HTML, CSS, JavaScript의 역할을 정리합니다.
author: 차태조
---

# 오늘 배운 것 📚

클로드 코드를 활용해서 마크다운 블로그를 만들면서, 웹 개발의 세 가지 핵심 기술에 대해 배웠습니다.

## HTML — 뼈대를 만드는 언어

HTML은 웹 페이지의 **구조**를 담당합니다.

```html
<nav>
  <a href="/">홈</a>
</nav>

<article>
  <h1>제목</h1>
  <p>내용</p>
</article>
```

### 배운 핵심

- `<nav>`, `<article>`, `<footer>` 같은 **시맨틱 태그**는 검색 엔진과 스크린 리더가 페이지를 이해하는 데 도움을 줍니다
- HTML만으로는 예쁜 페이지를 만들 수 없습니다 — 구조만 정의할 뿐입니다

## CSS — 옷을 입히는 언어

CSS는 웹 페이지의 **디자인**을 담당합니다.

```css
body {
  font-family: 'Pretendard', sans-serif;
  background: #fafafa;
  color: #1a1a2e;
}

.card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 배운 핵심

- **CSS 변수**를 활용하면 다크 모드 같은 테마 전환을 쉽게 구현할 수 있습니다
- `@media (prefers-color-scheme: dark)`로 사용자의 시스템 설정을 자동 감지할 수 있습니다
- `display: flex`와 `display: grid`로 복잡한 레이아웃을 간단하게 만들 수 있습니다

## JavaScript — 움직임을 만드는 언어

JavaScript는 웹 페이지의 **동작**을 담당합니다.

```javascript
// 마크다운을 HTML로 변환
function parseMarkdown(text) {
  return text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
}

// 다크 모드 토글
function toggleTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

### 배운 핵심

- JavaScript로 마크다운 파일을 읽어서 HTML로 변환하는 파서를 만들 수 있습니다
- `fetch` API로 서버에서 데이터를 가져올 수 있습니다
- `addEventListener`로 사용자의 클릭, 입력 같은 이벤트를 처리할 수 있습니다

## 세 기술의 관계

| 기술 | 역할 | 비유 |
|------|------|------|
| HTML | 구조 | 건물의 뼈대 |
| CSS | 디자인 | 건물의 인테리어 |
| JavaScript | 동작 | 건물의 전기·설비 |

## 느낀 점

클로드 코드와 함께하니, 프레임워크 없이도 순수 HTML, CSS, JavaScript만으로 충분히 멋진 블로그를 만들 수 있었습니다.

가장 인상 깊었던 부분은 **CSS 변수**를 활용한 다크 모드 구현이었습니다. 색상을 변수로 정의해두면 한 곳만 바꿔서 전체 테마를 변경할 수 있다는 것이 정말 효율적이었습니다.

---

다음에는 더 많은 기능을 추가해보고 싶습니다! 🚀
