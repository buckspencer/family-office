import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

async function setupStorageBucket() {
  try {
    console.log('Setting up Supabase storage bucket...');
    
    // Read .env.local file
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log('Reading env file from:', envPath);
    
    if (!fs.existsSync(envPath)) {
      throw new Error(`.env.local file not found at ${envPath}`);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars: Record<string, string> = {};
    
    // Parse environment variables
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        envVars[key.trim()] = value.trim();
      }
    });
    
    // Check if the environment variables are defined
    if (!envVars.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL in .env.local');
    }

    if (!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    }
    
    console.log('Supabase URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...');
    
    // Create a supabase client with service role key if available, otherwise use anon key
    const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey
    );
    
    console.log('Supabase client created');
    
    // Check if the bucket already exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Error listing buckets: ${bucketsError.message}`);
    }
    
    const resourcesBucketName = 'resources';
    const resourcesBucket = buckets?.find(bucket => bucket.name === resourcesBucketName);
    
    if (resourcesBucket) {
      console.log(`Bucket '${resourcesBucketName}' already exists`);
    } else {
      // Create the bucket
      console.log(`Creating bucket '${resourcesBucketName}'...`);
      
      const { data: newBucket, error: createBucketError } = await supabase.storage.createBucket(
        resourcesBucketName,
        {
          public: false,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        }
      );
      
      if (createBucketError) {
        throw new Error(`Error creating bucket: ${createBucketError.message}`);
      }
      
      console.log(`Bucket '${resourcesBucketName}' created successfully:`, newBucket);
    }
    
    // Set up RLS policies for the bucket
    console.log('Setting up RLS policies for the bucket...');
    
    // Note: Setting up RLS policies requires the Supabase dashboard or SQL
    console.log(`
To set up RLS policies for the '${resourcesBucketName}' bucket, you need to run the following SQL in the Supabase dashboard:

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read any object in the resources bucket
CREATE POLICY "Authenticated users can read resources"
ON storage.objects
FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  bucket_id = 'resources'
);

-- Policy for authenticated users to insert objects into the resources bucket
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND 
  bucket_id = 'resources'
);

-- Policy for users to update their own objects
CREATE POLICY "Users can update their own resources"
ON storage.objects
FOR UPDATE
USING (
  auth.uid() = owner AND 
  bucket_id = 'resources'
);

-- Policy for users to delete their own objects
CREATE POLICY "Users can delete their own resources"
ON storage.objects
FOR DELETE
USING (
  auth.uid() = owner AND 
  bucket_id = 'resources'
);
`);
    
    console.log('Supabase storage bucket setup completed');
  } catch (error) {
    console.error('Error setting up Supabase storage bucket:', error);
  }
}

setupStorageBucket(); 