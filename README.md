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
- `functions/api/quote.js`: 공공데이터포털 증권상품시세정보 기반 최근 종가 프록시 API (서버리스)
- `pages/*.html`: 소개, 개인정보 처리방침, 문의 등 정적 페이지
- `pages/about.html`: 서비스 소개
- `pages/privacy.html`: 개인정보 처리방침
- `pages/contact.html`: 문의 페이지

## 실행 방법
- 정적 페이지 자체는 브라우저에서 `index.html`을 열어 확인할 수 있습니다.
- 다만 실제 동작 확인은 `file://` 직접 열기보다 로컬 정적 서버 또는 배포 환경에서 보는 편이 안전합니다.

최근 종가 자동 조회 기능은 `/api/quote` 서버리스 프록시를 사용하므로,
로컬 파일 직접 열기(`file://`)가 아니라 서버 환경(예: Cloudflare Pages Functions)에서 실행해야 동작합니다.

`functions/api/quote.js` 는 다음 환경변수 이름을 순서대로 확인합니다.

- `DATA_GO_KR_SERVICE_KEY`
- `PUBLIC_DATA_PORTAL_SERVICE_KEY`
- `SECURITIES_PRODUCT_SERVICE_KEY`
- `SERVICE_KEY`

인증키는 공공데이터포털 증권상품시세정보 API용 일반 인증키를 사용합니다.

### 로컬 정적 서버 예시

```bash
npx --yes serve -l 4173 .
```

브라우저에서 `http://127.0.0.1:4173` 으로 접속합니다.

다만 이 방식은 정적 페이지 확인용입니다. `/api/quote` 경로를 함께 제공하지 않으므로
최근 종가 자동조회까지 보려면 `functions/api/*` 가 실제로 배포되는 서버 환경이 필요합니다.

예를 들어 Cloudflare Pages를 사용 중이라면:

- `functions/api/quote.js` 가 포함된 브랜치를 배포해야 합니다.
- 현재 보고 있는 환경(`Preview` 또는 `Production`)에 맞게 서비스키를 등록해야 합니다.
- 배포 URL에서 `/api/quote?symbol=069500` 같은 요청이 JSON으로 응답하는지 먼저 확인하는 편이 안전합니다.

로컬 개인 테스트용 비밀값은 `.env.local` 같은 별도 파일로만 관리하고 커밋하지 않습니다.

## ETF seed 갱신

수동으로 ETF를 하나씩 로컬 seed에 추가하는 대신, 공공데이터포털 ETF 목록으로
`data/kr-etf-source.seed.json` 을 갱신할 수 있습니다.

```bash
node scripts/sync-kr-etf-source-seed.js
```

환경변수는 `/api/quote` 와 동일하게 아래 이름을 순서대로 확인합니다.

- `DATA_GO_KR_SERVICE_KEY`
- `PUBLIC_DATA_PORTAL_SERVICE_KEY`
- `SECURITIES_PRODUCT_SERVICE_KEY`
- `SERVICE_KEY`

alias seed까지 같이 갱신하려면:

```bash
node scripts/sync-kr-etf-source-seed.js --refresh-alias-seed --alias-top all
```

메모:

- 기본적으로 공공데이터포털 `getETFPriceInfo` 목록을 페이지네이션으로 끝까지 읽습니다.
- 기존 `data/kr-etf-source.seed.json` 에 있던 `aliases`, `turnover5d`, `turnover20d` 값은 같은 코드 기준으로 최대한 보존합니다.
- `scripts/build-kr-etf-alias-seed.js --top 0` 또는 `--top all` 을 쓰면 상위 일부가 아니라 전체 alias seed를 만들 수 있습니다.

## Playwright 검증

### 기본 검증

이 저장소에는 system Chromium 기준 Playwright CLI 래퍼가 포함되어 있습니다.

```bash
./scripts/pwcli-local.sh open http://127.0.0.1:4173
./scripts/pwcli-local.sh snapshot
./scripts/pwcli-local.sh screenshot
./scripts/pwcli-local.sh close-all
```

- `scripts/pwcli-local.sh` 는 현재 머신에서 사용 가능한 `chromium` 또는 `google-chrome` 실행 파일을 자동으로 찾습니다.
- Playwright 결과물은 `output/playwright/` 아래에 저장됩니다.

### 모바일 검증

이 환경에서는 Playwright 번들 Chromium보다 system Chromium + CDP 연결이 더 안정적입니다.
모바일 검증은 `scripts/pwcli-mobile.sh` 를 사용합니다.

- `scripts/pwcli-mobile.sh` 는 내부적으로 `tmux` 세션을 사용해 headless Chromium CDP 브라우저를 유지합니다.
- 같은 모바일 검증 흐름에서는 `start`, `open`, `snapshot`, `screenshot`, `stop` 을 모두 이 래퍼로 실행합니다.

1. 로컬 서버를 띄웁니다.

```bash
npx --yes serve -l 4173 .
```

2. 모바일 CDP 브라우저를 시작합니다.

```bash
./scripts/pwcli-mobile.sh start
```

3. 같은 브라우저 세션으로 모바일 화면을 열고 검증합니다.

```bash
./scripts/pwcli-mobile.sh -s=mobile open http://127.0.0.1:4173
./scripts/pwcli-mobile.sh -s=mobile snapshot
./scripts/pwcli-mobile.sh -s=mobile screenshot
```

4. 검증이 끝나면 브라우저를 정리합니다.

```bash
./scripts/pwcli-mobile.sh stop
```

추가 메모:
- 기본 모바일 viewport 는 `390x844` 입니다.
- 다른 크기로 확인하려면 `PWCLI_MOBILE_VIEWPORT=430x932 ./scripts/pwcli-mobile.sh start` 처럼 실행합니다.
- 상태가 꼬이면 `./scripts/pwcli-mobile.sh reset` 으로 프로필과 프로세스를 같이 초기화합니다.
- 이 스크립트는 `http://127.0.0.1:9333` CDP 포트를 재사용하므로, 모바일 검증 명령은 같은 래퍼를 계속 사용해야 합니다.
- `tmux` 가 없는 환경에서는 이 스크립트가 동작하지 않습니다.

### 화면 캡처 검증

이 저장소에서 가장 간단하고 안정적인 모바일 시각 검증 방법은
`scripts/xvfb-shot.sh` 입니다. `Xvfb + app-mode Chromium + scrot` 조합으로
실제 작은 브라우저 창을 띄운 뒤 그대로 캡처합니다.

```bash
./scripts/xvfb-shot.sh mobile
./scripts/xvfb-shot.sh desktop
./scripts/xvfb-shot.sh mobile "http://127.0.0.1:4173/#inputSection"
./scripts/xvfb-shot.sh mobile "http://127.0.0.1:4173/#tableCard" output/playwright/mobile-table.png
```

- `desktop` 은 기본 `1280x720`, `mobile` 은 기본 `390x844` 로 캡처합니다.
- 세 번째 인자를 주지 않으면 결과물은 `output/playwright/` 아래 기본 파일명으로 저장됩니다.
- 렌더 대기 시간을 늘리려면 `XVFB_SHOT_WAIT=8 ./scripts/xvfb-shot.sh mobile` 처럼 실행합니다.
- 창 크기를 바꾸려면 `XVFB_SHOT_WIDTH=430 XVFB_SHOT_HEIGHT=932 ./scripts/xvfb-shot.sh mobile` 처럼 실행합니다.
- 이 방식은 모바일/데스크톱 레이아웃 확인용 기준 절차로 쓰고, 저장/불러오기 같은 상호작용 검증은 Playwright 래퍼를 계속 사용합니다.

## 개발 메모
- DOM id/class의 기준 파일은 `index.html`입니다.
- 셀렉터나 마크업을 바꾸기 전에는 `assets/css`, `assets/js` 연결을 함께 확인해야 합니다.
- 모바일 입력 흐름과 데스크톱 입력 흐름은 동일하게 취급하지 않고, 필요한 경우 분리해서 조정합니다.

## 참고
현재는 정적 HTML 기반 구조이며, 계산기 로직은 helper 모듈로 분리되어 있습니다.
