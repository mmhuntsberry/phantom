#!/bin/bash
# Run migrations against production database
# Usage: ./migrate-production.sh

cd "$(dirname "$0")/.."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set"
  echo "Please set it to your production database URL:"
  echo "export DATABASE_URL='postgresql://user:pass@host:port/db?sslmode=require'"
  exit 1
fi

echo "Running migrations against production database..."
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/run-migrations-production.ts
