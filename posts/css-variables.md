---
title: CSS 변수로 테마 관리하기
date: 2026-08-23
tags: [CSS, 다크모드, 디자인]
description: CSS 변수를 활용하여 라이트/다크 모드 테마를 효율적으로 관리하는 방법을 알아봅니다.
author: 차태조
---

# CSS 변수로 테마 관리하기 🎨

CSS 변수(Custom Properties)를 활용하면 라이트 모드와 다크 모드를 효율적으로 관리할 수 있습니다.

## CSS 변수란?

CSS 변수는 `--` 접두사를 사용하여 정의하고, `var()` 함수로 사용합니다:

```css
:root {
  --primary-color: #2563eb;
  --bg-color: #ffffff;
  --text-color: #1a1a2e;
}

.element {
  color: var(--primary-color);
  background: var(--bg-color);
}
```

## 다크 모드 구현

### 방법 1: 미디어 쿼리 사용

```css
:root {
  --bg: #ffffff;
  --text: #1a1a2e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f0f1a;
    --text: #e8e8f0;
  }
}
```

### 방법 2: data 속성 사용

```css
[data-theme="light"] {
  --bg: #ffffff;
  --text: #1a1a2e;
}

[data-theme="dark"] {
  --bg: #0f0f1a;
  --text: #e8e8f0;
}
```

## JavaScript로 전환

```javascript
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
```

## 장점

1. **유지보수 용이**: 색상을 한 곳에서 관리
2. **동적 변경 가능**: JavaScript로 쉽게 변경
3. **상속 구조**: 부모 요소에서 자식으로 전달
4. **성능**: 브라우저가 효율적으로 처리

---

CSS 변수를 활용하면 테마 관리가 훨씬 쉬워집니다! 🎨
