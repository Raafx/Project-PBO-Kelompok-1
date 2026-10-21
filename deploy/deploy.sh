#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env.production ]]; then
  echo "File deploy/.env.production belum ada." >&2
  echo "Salin .env.production.example lalu isi domain dan secret production." >&2
  exit 1
fi

set -a
. ./.env.production
set +a

sudo docker compose --env-file .env.production up -d --build
sudo docker compose --env-file .env.production ps

echo
echo "Menunggu health check aplikasi..."
for attempt in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${HTTP_PORT:-80}/login" >/dev/null; then
    echo "MYMARKET aktif."
    exit 0
  fi
  sleep 3
done

echo "Aplikasi belum sehat. Periksa log:" >&2
echo "sudo docker compose --env-file .env.production logs --tail=200" >&2
exit 1
