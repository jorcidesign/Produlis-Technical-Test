#!/bin/sh
set -e

echo "Waiting for MySQL and applying migrations..."
attempt=0
max_attempts=30
until npx prisma migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "MySQL did not become ready after $max_attempts attempts. Exiting."
    exit 1
  fi
  echo "Migration attempt $attempt failed, retrying in 2s..."
  sleep 2
done

echo "Migrations applied. Starting server..."
exec node dist/main.js
