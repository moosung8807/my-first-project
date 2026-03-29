#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MODE="${1:-mobile}"
URL="${2:-http://127.0.0.1:4173}"
OUTPUT_PATH="${3:-}"

case "$MODE" in
  mobile)
    WINDOW_WIDTH="${XVFB_SHOT_WIDTH:-390}"
    WINDOW_HEIGHT="${XVFB_SHOT_HEIGHT:-844}"
    DEFAULT_OUTPUT="$PROJECT_ROOT/output/playwright/xvfb-mobile-shot.png"
    ;;
  desktop)
    WINDOW_WIDTH="${XVFB_SHOT_WIDTH:-1280}"
    WINDOW_HEIGHT="${XVFB_SHOT_HEIGHT:-720}"
    DEFAULT_OUTPUT="$PROJECT_ROOT/output/playwright/xvfb-desktop-shot.png"
    ;;
  *)
    echo "Usage: $0 [mobile|desktop] [url] [output-path]" >&2
    exit 1
    ;;
esac

CHROMIUM_PATH="$(
  command -v chromium 2>/dev/null \
    || command -v chromium-browser 2>/dev/null \
    || command -v google-chrome 2>/dev/null \
    || command -v google-chrome-stable 2>/dev/null \
    || true
)"

if [[ -z "$CHROMIUM_PATH" ]]; then
  echo "No Chromium/Chrome executable found on PATH." >&2
  exit 1
fi

OUTPUT_PATH="${OUTPUT_PATH:-$DEFAULT_OUTPUT}"
mkdir -p "$(dirname "$OUTPUT_PATH")"

WAIT_SECONDS="${XVFB_SHOT_WAIT:-5}"
PROFILE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/xvfb-shot-profile.XXXXXX")"

cleanup() {
  rm -rf "$PROFILE_DIR"
}
trap cleanup EXIT

XVFB_CMD=$(cat <<EOF
xvfb-run -a --server-args="-screen 0 ${WINDOW_WIDTH}x${WINDOW_HEIGHT}x24" bash -lc '
  set -euo pipefail
  "${CHROMIUM_PATH}" \
    --app="${URL}" \
    --no-sandbox \
    --test-type \
    --disable-gpu \
    --disable-dev-shm-usage \
    --disable-extensions \
    --disable-sync \
    --disable-background-networking \
    --disable-component-update \
    --disable-default-apps \
    --disable-search-engine-choice-screen \
    --lang=ko \
    --disable-features=Translate,OptimizationGuideModelDownloading,OptimizationHints,ChromeWhatsNewUI \
    --no-first-run \
    --user-data-dir="${PROFILE_DIR}" \
    --window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT} \
    --window-position=0,0 \
    >/tmp/xvfb-shot-chromium.log 2>&1 &
  CHPID=\$!
  sleep "${WAIT_SECONDS}"
  scrot "${OUTPUT_PATH}"
  kill "\$CHPID" >/dev/null 2>&1 || true
  wait "\$CHPID" 2>/dev/null || true
'
EOF
)

exec nix-shell -p xorg.xorgserver scrot --run "$XVFB_CMD"
