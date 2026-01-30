#!/usr/bin/env bash
set -eo pipefail

cd "$(dirname "$0")/.."

ROOT="$(pwd)"
ROOT_VERCEL_DIR="$ROOT/.vercel"
ROOT_PROJECT_JSON="$ROOT_VERCEL_DIR/project.json"
SRC_PROJECT_JSON="$ROOT/apps/portfolio/.vercel/project.json"

if [ ! -f "$SRC_PROJECT_JSON" ]; then
  echo "Missing $SRC_PROJECT_JSON. Run: cd apps/portfolio && vercel link" >&2
  exit 1
fi

if command -v vercel >/dev/null 2>&1; then
  mkdir -p "$ROOT_VERCEL_DIR"
  BACKUP=""
  if [ -f "$ROOT_PROJECT_JSON" ]; then
    BACKUP="$ROOT_PROJECT_JSON.bak"
    cp "$ROOT_PROJECT_JSON" "$BACKUP"
  fi

  cp "$SRC_PROJECT_JSON" "$ROOT_PROJECT_JSON"

  if [ "$#" -gt 0 ]; then
    vercel deploy "$@"
  else
    vercel deploy
  fi

  if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
    mv "$BACKUP" "$ROOT_PROJECT_JSON"
  else
    rm -f "$ROOT_PROJECT_JSON"
  fi
else
  echo "Missing 'vercel' CLI. Install with: npm i -g vercel" >&2
  exit 1
fi
