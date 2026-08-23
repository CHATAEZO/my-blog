# CLAUDE.md

마크다운 파일을 읽어서 블로그 웹사이트로 변환하는 프로젝트입니다.

## 프로젝트 개요

- **목적**: 마크다운(.md) 파일을 깔끔한 블로그 웹사이트로 변환
- **기술 스택**: HTML, CSS, JavaScript (프레임워크 없음)
- **디자인 원칙**: 깔끔하고 읽기 좋은 타이포그래피, 다크 모드 지원, 모바일 반응형

## 디렉토리 구조

```
my-blog/
├── index.html          # 메인 페이지 (SPA)
├── css/style.css       # 스타일시트
├── js/
│   ├── app.js          # 애플리케이션 로직
│   └── markdown.js     # 마크다운 파서
├── posts/              # 마크다운 포스트
│   ├── index.json      # 포스트 목록
│   └── *.md            # 포스트 파일
└── .nojekyll           # Jekyll 비활성화
```

## 핵심 기능

- 마크다운 → HTML 변환
- 다크 모드 / 라이트 모드 전환
- 태그별 필터링 및 검색
- 목차 자동 생성
- 모바일 반응형

## 실행 방법

```bash
npx serve .
```

## GitHub Pages

https://chataezo.github.io/my-blog/
