#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PWCLI_LOCAL="$PROJECT_ROOT/scripts/pwcli-local.sh"
STATE_DIR="${PWCLI_MOBILE_STATE_DIR:-/tmp/pwcli-mobile-${USER}-$(basename "$PROJECT_ROOT")}"
PROFILE_DIR="$STATE_DIR/profile"
PID_FILE="$STATE_DIR/chromium.pid"
LOG_FILE="$STATE_DIR/chromium.log"
PORT="${PWCLI_MOBILE_PORT:-9333}"
VIEWPORT="${PWCLI_MOBILE_VIEWPORT:-390x844}"
WINDOW_SIZE="${VIEWPORT/x/,}"
TMUX_SESSION="${PWCLI_MOBILE_TMUX_SESSION:-pwcli-mobile-$(basename "$PROJECT_ROOT")}"
CHROMIUM_PATH="$(
  command -v chromium 2>/dev/null \
    || command -v chromium-browser 2>/dev/null \
    || command -v google-chrome 2>/dev/null \
    || command -v google-chrome-stable 2>/dev/null \
    || true
)"

if [[ -z "$CHROMIUM_PATH" ]]; then
  echo "No system Chromium/Chrome executable found on PATH." >&2
  exit 1
fi

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is required for pwcli-mobile.sh in this environment." >&2
  exit 1
fi

browser_pid() {
  if [[ -f "$PID_FILE" ]]; then
    cat "$PID_FILE"
  fi
}

find_port_pid() {
  pgrep -f -- "--remote-debugging-port=${PORT}" | head -n 1 || true
}

find_browser_pid() {
  local pid
  pid="$(pgrep -f -- "--remote-debugging-port=${PORT}.*--user-data-dir=${PROFILE_DIR}" | head -n 1 || true)"
  if [[ -n "$pid" ]]; then
    echo "$pid"
    return 0
  fi
  find_port_pid
}

browser_running() {
  local pid
  pid="$(browser_pid || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
    return 0
  fi
  pid="$(find_browser_pid)"
  [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1
}

endpoint_ready() {
  curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1
}

wait_for_endpoint() {
  local attempt
  for attempt in $(seq 1 40); do
    if endpoint_ready; then
      return 0
    fi
    sleep 0.25
  done
  echo "Chromium CDP endpoint did not become ready on port ${PORT}." >&2
  return 1
}

start_browser() {
  mkdir -p "$PROFILE_DIR"
  if browser_running && endpoint_ready; then
    return 0
  fi

  if browser_running; then
    stop_browser
  fi

  rm -f "$LOG_FILE"
  tmux kill-session -t "$TMUX_SESSION" >/dev/null 2>&1 || true
  tmux new-session -d -s "$TMUX_SESSION" \
    "exec '$CHROMIUM_PATH' --headless=new --disable-gpu --no-sandbox --remote-debugging-port='$PORT' --window-size='$WINDOW_SIZE' --user-data-dir='$PROFILE_DIR' about:blank >>'$LOG_FILE' 2>&1"
  wait_for_endpoint
  find_browser_pid >"$PID_FILE" || true
}

stop_browser() {
  local pid
  tmux kill-session -t "$TMUX_SESSION" >/dev/null 2>&1 || true
  pid="$(browser_pid || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
    wait "$pid" 2>/dev/null || true
  fi
  pid="$(find_port_pid)"
  if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
    wait "$pid" 2>/dev/null || true
  fi
  pkill -f -- "--remote-debugging-port=${PORT}.*--user-data-dir=${PROFILE_DIR}" >/dev/null 2>&1 || true
  rm -f "$PID_FILE"
}

status_browser() {
  if endpoint_ready; then
    if ! browser_running; then
      find_browser_pid >"$PID_FILE" || true
    fi
    echo "mobile-cdp: running"
    echo "port: $PORT"
    echo "viewport: $VIEWPORT"
    echo "pid: $(browser_pid || true)"
    echo "tmux: $TMUX_SESSION"
    echo "log: $LOG_FILE"
    return 0
  fi
  echo "mobile-cdp: stopped"
  return 1
}

reset_browser() {
  stop_browser
  rm -rf "$PROFILE_DIR"
}

case "${1:-}" in
  start)
    start_browser
    status_browser
    exit 0
    ;;
  stop)
    stop_browser
    echo "mobile-cdp: stopped"
    exit 0
    ;;
  status)
    status_browser
    exit 0
    ;;
  reset)
    reset_browser
    echo "mobile-cdp: reset"
    exit 0
    ;;
esac

start_browser

export PLAYWRIGHT_MCP_BROWSER=chromium
export PLAYWRIGHT_MCP_CDP_ENDPOINT="http://127.0.0.1:${PORT}"
export PLAYWRIGHT_MCP_EXECUTABLE_PATH="$CHROMIUM_PATH"
export PLAYWRIGHT_MCP_HEADLESS=true

exec "$PWCLI_LOCAL" "$@"
