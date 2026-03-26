# my-first-project

개인 투자자를 위한 포트폴리오 리밸런싱 계산 웹페이지입니다.

## 개요
- 정적 HTML, CSS, 브라우저 JavaScript를 기반으로 동작하는 계산기 사이트입니다.
- 메인 진입점은 `index.html`입니다.
- 데스크톱과 모바일 UI를 분리해 다루며, 한쪽 수정이 다른 쪽에 번지지 않도록 유지하는 것을 기본 원칙으로 삼습니다.

## 파일 구조
- `index.html`: 메인 계산기 페이지(마크업)
- `assets/css/main.css`: 메인 스타일
- `assets/js/app.js`: 메인 계산 및 페이지 초기화 로직
- `assets/js/*-helpers.js`: 모드 전환, 모바일 표시, 요약 UI, 타깃 비중, 피드백 처리 등 보조 로직
- `assets/js/core-*.js`: 숫자 포맷, 심볼 처리, 공용 유틸리티
- `functions/api/quote.js`: Yahoo Finance 현재가 프록시 API (서버리스)
- `pages/*.html`: 소개, 개인정보 처리방침, 문의 등 정적 페이지
- `pages/about.html`: 서비스 소개
- `pages/privacy.html`: 개인정보 처리방침
- `pages/contact.html`: 문의 페이지

## 실행 방법
- 정적 페이지 자체는 브라우저에서 `index.html`을 열어 확인할 수 있습니다.
- 다만 실제 동작 확인은 `file://` 직접 열기보다 로컬 정적 서버 또는 배포 환경에서 보는 편이 안전합니다.

Yahoo Finance 현재가 자동 조회 기능은 `/api/quote` 서버리스 프록시를 사용하므로,
로컬 파일 직접 열기(`file://`)가 아니라 서버 환경(예: Cloudflare Pages Functions)에서 실행해야 동작합니다.

## 개발 메모
- DOM id/class의 기준 파일은 `index.html`입니다.
- 셀렉터나 마크업을 바꾸기 전에는 `assets/css`, `assets/js` 연결을 함께 확인해야 합니다.
- 모바일 입력 흐름과 데스크톱 입력 흐름은 동일하게 취급하지 않고, 필요한 경우 분리해서 조정합니다.

## 참고
현재는 정적 HTML 기반 구조이며, 계산기 로직은 helper 모듈로 분리되어 있습니다.
