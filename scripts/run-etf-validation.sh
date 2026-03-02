#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

LIMIT="${LIMIT:-5}"
MAX_CYCLES="${MAX_CYCLES:-10}"
SLEEP_SEC="${SLEEP_SEC:-900}"

for cycle in $(seq 1 "$MAX_CYCLES"); do
  echo "[cycle $cycle/$MAX_CYCLES] start"

  node scripts/validate-kr-etf-source.js \
    --input data/kr-etf-source.seed.json \
    --out data/kr-etf-validation.json \
    --cache data/kr-etf-validation.cache.json \
    --batch 5 \
    --delay 1200 \
    --batch-pause 6000 \
    --retry-only \
    --limit "$LIMIT" \
    --max-429-retries 8 \
    --min-rl-pause 20000 \
    --max-rl-pause 180000

  node -e "const r=require('./data/kr-etf-validation.json'); console.log('counts:', r.meta.counts, 'runtime:', r.meta.runtime);"

  RETRY_LEFT="$(node -e "const r=require('./data/kr-etf-validation.json'); process.stdout.write(String(r.meta?.counts?.RETRY ?? 0));")"
  PROCESSED="$(node -e "const r=require('./data/kr-etf-validation.json'); process.stdout.write(String(r.meta?.runtime?.processedThisRun ?? 0));")"

  if [[ "$RETRY_LEFT" -eq 0 ]]; then
    echo "No RETRY items left."
    break
  fi

  if [[ "$PROCESSED" -eq 0 ]]; then
    echo "No items processed this cycle (retry queue empty or blocked)."
    break
  fi

  if [[ "$cycle" -lt "$MAX_CYCLES" ]]; then
    echo "RETRY remaining: $RETRY_LEFT. Sleeping ${SLEEP_SEC}s before next cycle..."
    sleep "$SLEEP_SEC"
  fi
done
