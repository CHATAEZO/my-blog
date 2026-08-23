---
title: JavaScript 비동기 프로그래밍 가이드
date: 2026-08-23
tags: [JavaScript, 비동기, 프로그래밍]
description: JavaScript의 비동기 프로그래밍 패턴을 이해하고 async/await를 마스터하는 방법을 알아봅니다.
author: 차태조
---

# JavaScript 비동기 프로그래밍 가이드 ⚡

JavaScript는 싱글 스레드 언어이지만, 비동기 프로그래밍을 통해 효율적으로 작업을 처리할 수 있습니다.

## 왜 비동기가 필요한가요?

JavaScript는 한 번에 하나의 작업만 처리할 수 있습니다. 하지만 네트워크 요청이나 파일 읽기 같은 작업은 시간이 걸리므로, 기다리는 동안 다른 작업을 처리할 수 있어야 합니다.

### 동기 vs 비동기

```javascript
// 동기 - 순서대로 실행
console.log('1');
console.log('2');
console.log('3');
// 출력: 1, 2, 3

// 비동기 - 나중에 실행
console.log('1');
setTimeout(() => console.log('2'), 1000);
console.log('3');
// 출력: 1, 3, 2
```

## 비동기 패턴

### 1. Promise

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ name: '홍길동', age: 30 });
    }, 1000);
  });
}

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### 2. async/await

```javascript
async function getData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

## 실전 예제

```javascript
async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    throw new Error('사용자를 찾을 수 없습니다');
  }
  
  return response.json();
}
```

## 정리

| 패턴 | 장점 | 단점 |
|------|------|------|
| 콜백 | 간단함 | 콜백 지옥 |
| Promise | 체이닝 가능 | 문법이 복잡 |
| async/await | 읽기 쉬움 | 에러 처리 필요 |

---

비동기 프로그래밍을 마스터하면 JavaScript 실력이 크게 향상됩니다! 🚀
