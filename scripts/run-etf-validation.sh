#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

node scripts/validate-kr-etf-source.js \
  --input data/kr-etf-source.seed.json \
  --out data/kr-etf-validation.json \
  --cache data/kr-etf-validation.cache.json \
  --delay 900 \
  --batch 5 \
  --batch-pause 2500

node -e "const r=require('./data/kr-etf-validation.json'); console.log('counts:', r.meta.counts);"
