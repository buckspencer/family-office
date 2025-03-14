#!/bin/bash

# Load environment variables
source .env.local

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
  echo "Error: POSTGRES_URL environment variable is not set"
  exit 1
fi

echo "Resetting database..."

# Run the SQL script to reset the database
psql "$POSTGRES_URL" -f scripts/db/reset-db.sql

# Check if the reset was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to reset database"
  exit 1
fi

echo "Database reset successful"

echo "Pushing new schema with UUID support..."

# Push the new schema with the database URL
npx drizzle-kit push --url="$POSTGRES_URL" --dialect=postgresql --schema=./lib/db/schema.ts --verbose

# Check if the push was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to push schema"
  exit 1
fi

echo "Schema push successful"

echo "Database has been reset and new schema with UUID support has been applied"
echo "You can now create new users with Supabase Auth and they will be synced with the database" 