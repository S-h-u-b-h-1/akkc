#!/usr/bin/env bash
set -euo pipefail

# Helper script to backup the production DB and deploy Prisma migrations.
# Usage (in Render shell or any environment with access to production DB):
#   export DATABASE_URL="postgresql://user:pass@host:port/dbname?schema=public"
#   ./prisma/run_migrations_render.sh

TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="db_backup_${TIMESTAMP}.dump"

echo "Backing up DATABASE_URL to ${BACKUP_FILE} (custom format)"
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is not installed or not in PATH. Install psql client tools first." >&2
  exit 2
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL must be set in the environment." >&2
  exit 3
fi

pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_FILE"
echo "Backup written to $BACKUP_FILE"

echo "Deploying Prisma migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Migrations deployed. If you still see issues, consider running the fallback SQL: prisma/add_username_fallback.sql"
