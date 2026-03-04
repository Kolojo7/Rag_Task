#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BACKEND_DIR="${BACKEND_DIR:-backend}"
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"

if [[ "$BACKEND_DIR" = /* ]]; then
  BACKEND_PATH="$BACKEND_DIR"
else
  BACKEND_PATH="$REPO_ROOT/$BACKEND_DIR"
fi

if [[ "$FRONTEND_DIR" = /* ]]; then
  FRONTEND_PATH="$FRONTEND_DIR"
else
  FRONTEND_PATH="$REPO_ROOT/$FRONTEND_DIR"
fi

if [[ ! -d "$BACKEND_PATH" ]]; then
  echo "Backend directory not found: $BACKEND_PATH" >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_PATH" ]]; then
  echo "Frontend directory not found: $FRONTEND_PATH" >&2
  exit 1
fi

if [[ ! -d "$BACKEND_PATH/.venv" || ! -f "$BACKEND_PATH/.env" || ! -d "$FRONTEND_PATH/node_modules" || ! -f "$FRONTEND_PATH/.env" ]]; then
  "$SCRIPT_DIR/setup.sh"
else
  echo "==> Setup already present; skipping setup"
fi

echo "==> Starting Backend and Frontend (this shell controls both)"

(
  cd "$BACKEND_PATH"
  source .venv/bin/activate
  python app.py
) &
BACK_PID=$!

trap 'echo "Stopping backend..."; kill $BACK_PID 2>/dev/null || true' EXIT INT TERM

(
  cd "$FRONTEND_PATH"
  npm run dev
)

wait $BACK_PID || true
