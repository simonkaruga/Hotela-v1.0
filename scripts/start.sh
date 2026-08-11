#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

if command -v docker-compose >/dev/null 2>&1; then
  echo "[start] Starting Postgres, Redis, Elasticsearch via docker-compose..."
  docker-compose up -d
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "[start] Starting Postgres, Redis, Elasticsearch via docker compose..."
  docker compose up -d
else
  echo "[start] Docker not found on this machine — skipping local Postgres/Redis/Elasticsearch."
  echo "[start] The API will still boot, but anything needing DATABASE_URL/REDIS_URL will fail until Docker (or a hosted DB) is available."
fi

exec npx concurrently -n API,WEB -c green,magenta "npm:dev:api" "npm:dev:web"
