# Worklog

## 2026-04-04

### 이번에 한 작업
- `functions/api/quote.js`를 Yahoo Finance 기반에서 공공데이터포털 증권상품시세정보 API 기반으로 교체함.
- `/api/quote`는 이제 `ETF`, `ETN`, `ELW`를 순서대로 조회하며 `symbol` 또는 `query`를 받아 최근 종가를 반환함.
- 환경변수는 `DATA_GO_KR_SERVICE_KEY`를 우선 사용하고, `PUBLIC_DATA_PORTAL_SERVICE_KEY`, `SECURITIES_PRODUCT_SERVICE_KEY`, `SERVICE_KEY`도 fallback으로 읽도록 구현함.
- `assets/js/core-symbols.js`에서 Yahoo 심볼 해석을 제거하고, 공공데이터포털 기준 6자리 종목코드/종목명 중심으로 `resolveSecurityQuery`를 사용하도록 변경함.
- 메인 계산기와 월 적립식 계산기에서 자동 입력 용어를 `현재가`에서 `최근 종가`로 정리함.
- 안내 문구에 `※ 최근 종가는 공공데이터포털 기준 최근 영업일 종가이며, 장중 현재가와 다를 수 있습니다.`를 추가함.
- 자동조회 성공 시 기준일이 있으면 `YYYY-MM-DD 기준 최근 종가 반영` 형태로 상태 문구가 보이도록 변경함.
- 메인 계산기에서 자동조회가 기본 OFF로 고정되던 문제를 수정해 기본 ON으로 동작하게 변경함.
- 로컬 테스트용으로 `.gitignore`에 `.env.local`을 추가함.

### 로컬에서 확인된 상태
- 로컬 서버에서 `/api/quote?symbol=069500` 호출 시 정상적으로 JSON 응답이 나왔음.
- 예시 응답:

```json
{"symbol":"069500","name":"KODEX 200","market":"ETF","price":78190,"baseDate":"20260402"}
```

- 로컬에서는 `.env.local`에 공공데이터포털 일반 인증키를 넣어 테스트 가능하게 해둠.

### Git 상태
- 작업 브랜치: `codex/public-securities-recent-close`
- push 완료
- PR 생성 링크:
  `https://github.com/moosung8807/my-first-project/pull/new/codex/public-securities-recent-close`

### 아직 남은 이슈
- 배포 환경에서 `/api/quote`가 없다고 보였음.
- 이 문제는 프론트 기본값 문제보다는 Cloudflare Pages에서 `Functions`가 실제 배포되지 않았거나, 다른 브랜치/배포를 보고 있을 가능성이 큼.
- 저장소 안에는 `wrangler.toml`, `netlify.toml`, `vercel.json`, GitHub Actions 같은 배포 설정 파일이 없어서 실제 배포 플랫폼은 확정하지 못했음.
- 코드 형태상 `export async function onRequestGet(context)`와 `functions/api/*` 구조 때문에 Cloudflare Pages Functions일 가능성이 가장 높다고 판단했음.

### 다음에 바로 확인할 것
1. Cloudflare Pages에서 현재 보고 있는 배포가 `main`인지, `codex/public-securities-recent-close` preview인지 확인
2. `Variables and Secrets`에서 `DATA_GO_KR_SERVICE_KEY`가 `Preview` 또는 `Production` 중 현재 보는 환경에 맞게 들어갔는지 확인
3. 배포 URL 뒤에 `/api/quote?symbol=069500`를 붙여 JSON이 뜨는지 확인
4. `/api/quote`가 404면 환경변수가 아니라 Functions 배포 문제로 보고, Pages의 해당 배포가 `functions/api/quote.js`를 포함하는지 확인

### 메모
- 인증키는 저장소에 커밋하지 않았음.
- `.env.local`은 로컬 전용 파일이며 `.gitignore`에 추가해둠.
- 사용자가 검증은 요청할 때만 하기로 해서, 이번 작업에서는 별도 검증 실행을 최소화함.
