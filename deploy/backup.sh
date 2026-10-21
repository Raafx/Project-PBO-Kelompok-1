#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
set -a
. ./.env.production
set +a

mkdir -p backups
timestamp=$(date +%Y%m%d-%H%M%S)
sudo docker compose --env-file .env.production exec -T database \
  mariadb-dump -uroot -p"${DB_ROOT_PASSWORD}" --single-transaction "${DB_NAME}" \
  | gzip > "backups/mymarket-${timestamp}.sql.gz"

echo "Backup tersimpan: deploy/backups/mymarket-${timestamp}.sql.gz"
