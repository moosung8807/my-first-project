#!/usr/bin/env bash
set -euo pipefail

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"

if [[ ! -x "$PWCLI" ]]; then
  echo "Playwright CLI wrapper not found: $PWCLI" >&2
  exit 1
fi

if [[ -z "${PLAYWRIGHT_MCP_EXECUTABLE_PATH:-}" ]]; then
  PLAYWRIGHT_MCP_EXECUTABLE_PATH="$(
    command -v chromium 2>/dev/null \
      || command -v chromium-browser 2>/dev/null \
      || command -v google-chrome 2>/dev/null \
      || command -v google-chrome-stable 2>/dev/null \
      || true
  )"
fi

if [[ -z "${PLAYWRIGHT_MCP_EXECUTABLE_PATH:-}" ]]; then
  for candidate in "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux*/chrome; do
    if [[ -x "$candidate" ]]; then
      PLAYWRIGHT_MCP_EXECUTABLE_PATH="$candidate"
    fi
  done
fi

if [[ -z "${PLAYWRIGHT_MCP_EXECUTABLE_PATH:-}" ]]; then
  echo "No Chromium/Chrome executable found on PATH." >&2
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${PLAYWRIGHT_MCP_OUTPUT_DIR:-$PROJECT_ROOT/output/playwright}"
mkdir -p "$OUTPUT_DIR"

export PLAYWRIGHT_MCP_BROWSER="${PLAYWRIGHT_MCP_BROWSER:-chromium}"
export PLAYWRIGHT_MCP_EXECUTABLE_PATH
export PLAYWRIGHT_MCP_HEADLESS="${PLAYWRIGHT_MCP_HEADLESS:-true}"
export PLAYWRIGHT_MCP_NO_SANDBOX="${PLAYWRIGHT_MCP_NO_SANDBOX:-true}"
export PLAYWRIGHT_MCP_OUTPUT_DIR="$OUTPUT_DIR"
export PLAYWRIGHT_MCP_TIMEOUT_ACTION="${PLAYWRIGHT_MCP_TIMEOUT_ACTION:-15000}"
export PLAYWRIGHT_MCP_TIMEOUT_NAVIGATION="${PLAYWRIGHT_MCP_TIMEOUT_NAVIGATION:-120000}"

exec "$PWCLI" "$@"
