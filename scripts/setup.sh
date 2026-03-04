#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PYTHON_BIN="${PYTHON:-python3}"
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

echo "==> Setting up backend (venv + deps)"
cd "$BACKEND_PATH"
if [ ! -d .venv ]; then
  "$PYTHON_BIN" -m venv .venv
fi
source .venv/bin/activate
pip install -U pip >/dev/null
pip install -r requirements.txt

if [ ! -f .env ]; then
  cat > .env <<EOF
# Create your Gemini API key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=YOUR_KEY_HERE
EOF
  echo "Created backend/.env (update GEMINI_API_KEY)."
fi

echo "==> Setting up frontend (npm install)"
cd "$FRONTEND_PATH"
if [ ! -f .env ]; then
  echo "VITE_API_BASE_URL=http://127.0.0.1:5000" > .env
  echo "Created frontend/.env with VITE_API_BASE_URL."
fi

if [ -f package.json ] && [ ! -d node_modules ]; then
  npm install
fi

cat <<NEXT

Done. Next steps:
1) Start backend:  cd $BACKEND_PATH; source .venv/bin/activate; python app.py
2) Start frontend: cd $FRONTEND_PATH; npm run dev
NEXT
