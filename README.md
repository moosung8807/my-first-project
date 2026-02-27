# my-first-project

개인 투자자를 위한 포트폴리오 리밸런싱 계산 웹페이지입니다.

## 파일 구조
- `index.html`: 메인 계산기 페이지(마크업)
- `assets/css/main.css`: 메인 스타일
- `assets/js/app.js`: 계산 및 UI 로직
- `functions/api/quote.js`: Yahoo Finance 현재가 프록시 API (서버리스)
- `pages/about.html`: 서비스 소개
- `pages/privacy.html`: 개인정보 처리방침
- `pages/contact.html`: 문의 페이지

## 실행 방법
별도 설치 없이 브라우저에서 `index.html`을 열면 됩니다.

Yahoo Finance 현재가 자동 조회 기능은 `/api/quote` 서버리스 프록시를 사용하므로,
로컬 파일 직접 열기(`file://`)가 아니라 서버 환경(예: Cloudflare Pages Functions)에서 실행해야 동작합니다.

## 참고
현재는 정적 HTML 기반 구조이며, 1차 리팩토링으로 CSS/JS 분리 및 페이지 디렉터리 정리를 완료했습니다.
