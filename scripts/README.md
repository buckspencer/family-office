# Scripts Directory

This directory contains various utility scripts for managing the application.

## Database Scripts (`db/`)

- `reset-db.sql` - SQL script to drop all tables and reset the database
- `reset-and-push.sh` - Shell script to reset the database and push the new schema
- `reset-db-with-uuid.ts` - TypeScript script to reset the database with UUID support
- `apply-migration.ts` - Apply a specific migration file
- `apply-assets-migration.ts` - Apply the assets migration
- `run-assets-migration.js` - Run the assets migration (JavaScript version)
- `check-tables.ts` - Check the tables in the database
- `check-table-structure.ts` - Check the structure of tables in the database
- `test-crud.ts` - Test CRUD operations on the database
- `migrate-to-uuid.ts` - Migrate the database to use UUIDs for user IDs

## Supabase Scripts (`supabase/`)

- `test-supabase.ts` - Test basic Supabase functionality
- `test-supabase-auth.ts` - Test Supabase authentication
- `test-supabase-detailed.ts` - Detailed tests for Supabase functionality

## Storage Scripts (`storage/`)

- `setup-storage.js` - Set up Supabase storage
- `setup-storage-bucket.ts` - Set up a Supabase storage bucket
- `test-bucket.ts` - Test Supabase storage bucket functionality
- `test-bucket.js` - Test Supabase storage bucket functionality (JavaScript version)

## Document Scripts (`documents/`)

- `check-documents.ts` - Check documents in the database
- `update-document-url.ts` - Update document URLs

## Usage

Most scripts can be run with `npx ts-node scripts/path/to/script.ts` or `node scripts/path/to/script.js` for JavaScript files.

For the shell script, make it executable first:

```bash
chmod +x scripts/db/reset-and-push.sh
```

Then run it:

```bash
./scripts/db/reset-and-push.sh
``` 