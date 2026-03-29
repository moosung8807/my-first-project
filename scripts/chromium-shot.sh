#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MODE="${1:-desktop}"
URL="${2:-http://127.0.0.1:4173}"
OUTPUT_PATH="${3:-}"

case "$MODE" in
  desktop)
    WINDOW_SIZE="${CHROMIUM_SHOT_WINDOW_SIZE:-1280,720}"
    DEFAULT_OUTPUT="$PROJECT_ROOT/output/playwright/chromium-desktop-shot.png"
    ;;
  mobile)
    WINDOW_SIZE="${CHROMIUM_SHOT_WINDOW_SIZE:-390,844}"
    DEFAULT_OUTPUT="$PROJECT_ROOT/output/playwright/chromium-mobile-shot.png"
    ;;
  *)
    echo "Usage: $0 [desktop|mobile] [url] [output-path]" >&2
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

VIRTUAL_TIME_BUDGET="${CHROMIUM_SHOT_VIRTUAL_TIME_BUDGET:-5000}"
CAPTURE_TIMEOUT="${CHROMIUM_SHOT_TIMEOUT:-30}"

CMD=("$CHROMIUM_PATH" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --run-all-compositor-stages-before-draw \
  "--virtual-time-budget=$VIRTUAL_TIME_BUDGET" \
  "--window-size=$WINDOW_SIZE" \
  "--screenshot=$OUTPUT_PATH" \
  "$URL")

if command -v timeout >/dev/null 2>&1; then
  timeout "${CAPTURE_TIMEOUT}s" "${CMD[@]}"
else
  "${CMD[@]}"
fi
