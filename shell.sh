#!/bin/sh

DB_HOST="db"
DB_PORT="5432"
TIMEOUT=30

echo "Waiting for database at $DB_HOST:$DB_PORT..."

until nc -z -v -w 5 "$DB_HOST" "$DB_PORT"; do
  TIMEOUT=$((TIMEOUT - 1))
  if [ $TIMEOUT -le 0 ]; then
    echo "Database did not start in time!"
    exit 1
  fi
  echo "Database not ready... retrying ($TIMEOUT attempts left)"
  sleep 2
done

echo "✅ Database is ready!"

npm run drizzle:push
npm run drizzle:seed
npm run dev
