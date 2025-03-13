# Assets and Attachments Module

This module adds asset management and file attachment capabilities to the Family Office application.

## Features

- Asset management (properties, vehicles, investments, etc.)
- File attachments for any resource type
- Supabase Storage integration for file uploads
- Responsive UI for viewing and managing assets

## Setup Instructions

Follow these steps to set up the assets and attachments functionality:

### 1. Install Dependencies

```bash
# Using pnpm
pnpm add @radix-ui/react-toast class-variance-authority

# Or using npm
npm install @radix-ui/react-toast class-variance-authority
```

### 2. Run Database Migration

The migration script will use Drizzle Kit to generate and apply migrations for the assets and attachments tables.

> **Note:** Make sure the `POSTGRES_URL` environment variable is set in your `.env.local` file.

```bash
# Run the migration script
node run-assets-migration.js
```

Alternatively, you can run the Drizzle Kit commands directly:

```bash
# Generate migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

### 3. Set Up Supabase Storage

The application requires two storage buckets in Supabase:
- 'resources' bucket - For storing document files
- 'attachments' bucket - For storing attachment files for assets and other resources

Both buckets should already be created in the Supabase GUI and share the same access policies. The setup script will verify this configuration.

```bash
# Verify Supabase Storage configuration
node setup-storage.js
```

If you need to create the buckets manually:
1. Go to Storage in the Supabase dashboard
2. Click "New Bucket" and create both "resources" and "attachments" buckets
3. Set both buckets to have the same access policies
4. Ensure public access is configured correctly for file retrieval

## Usage

### Managing Assets

1. Navigate to `/dashboard/resources/assets` to view all assets
2. Click "Add New Asset" to create a new asset
3. Click on an asset card to view details
4. Use the edit and delete buttons on the asset detail page to manage the asset

### Adding Attachments

1. Navigate to an asset's detail page
2. Use the "Add File" button in the Attachments section
3. Select a file to upload
4. The file will be uploaded to Supabase Storage and linked to the asset

### Viewing and Downloading Attachments

1. On the asset detail page, all attachments are listed
2. Click the download icon to download an attachment
3. Click the trash icon to delete an attachment

## Implementation Details

### Database Schema

The module adds two new tables to the database:

1. `assets` - Stores information about assets
2. `attachments` - Stores information about file attachments

### File Storage

Files are stored in Supabase Storage in the 'attachments' bucket. The file path follows this pattern:

```
{resourceType}/{resourceId}/{timestamp}-{filename}
```

For example: `asset/123/1647123456789-document.pdf`

### Component Structure

- `AssetCard` - Displays an asset in card format
- `AttachmentUploader` - Handles file uploads and displays attachments
- Asset detail page - Shows asset details and attachments

## Troubleshooting

### Migration Issues

If you encounter issues with the migration:

1. Check that your DATABASE_URL environment variable is set correctly
2. Ensure you have the necessary permissions to create tables
3. Check the PostgreSQL logs for more details

### Storage Issues

If you encounter issues with file uploads:

1. Check that your Supabase environment variables are set correctly
2. Ensure the 'attachments' bucket exists in Supabase Storage
3. Check that the bucket has the correct permissions

## Next Steps

- Implement asset categories and tags
- Add search and filtering capabilities
- Create reports based on asset data
- Implement file previews for common file types 