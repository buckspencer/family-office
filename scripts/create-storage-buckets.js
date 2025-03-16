// This script creates the necessary storage buckets in Supabase
// Run with: node scripts/create-storage-buckets.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check if the environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// Create a Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBucket(bucketName) {
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    // Check if our bucket exists
    const bucketExists = buckets.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist, creating it...`);
      
      // Create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make the bucket public
        fileSizeLimit: 52428800, // 50MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket '${bucketName}':`, createError);
        return false;
      }
      
      console.log(`Bucket '${bucketName}' created successfully`);
      
      // Create RLS policies for the bucket
      await createBucketPolicies(bucketName);
      
      return true;
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
      return true;
    }
  } catch (error) {
    console.error('Error creating bucket:', error);
    return false;
  }
}

async function createBucketPolicies(bucketName) {
  try {
    // Create a policy for reading files (public access)
    const { error: selectError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_select_policy`,
      definition: `bucket_id = '${bucketName}'`,
      operation: 'SELECT'
    });
    
    if (selectError) {
      console.warn(`Error creating SELECT policy for bucket '${bucketName}':`, selectError);
    } else {
      console.log(`Created SELECT policy for bucket '${bucketName}'`);
    }
    
    // Create a policy for inserting files (authenticated users only, in their own folder)
    const { error: insertError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_insert_policy`,
      definition: `(bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1])::boolean`,
      operation: 'INSERT'
    });
    
    if (insertError) {
      console.warn(`Error creating INSERT policy for bucket '${bucketName}':`, insertError);
    } else {
      console.log(`Created INSERT policy for bucket '${bucketName}'`);
    }
    
    // Create a policy for updating files (authenticated users only, in their own folder)
    const { error: updateError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_update_policy`,
      definition: `(bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1])::boolean`,
      operation: 'UPDATE'
    });
    
    if (updateError) {
      console.warn(`Error creating UPDATE policy for bucket '${bucketName}':`, updateError);
    } else {
      console.log(`Created UPDATE policy for bucket '${bucketName}'`);
    }
    
    // Create a policy for deleting files (authenticated users only, in their own folder)
    const { error: deleteError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: `${bucketName}_delete_policy`,
      definition: `(bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1])::boolean`,
      operation: 'DELETE'
    });
    
    if (deleteError) {
      console.warn(`Error creating DELETE policy for bucket '${bucketName}':`, deleteError);
    } else {
      console.log(`Created DELETE policy for bucket '${bucketName}'`);
    }
    
  } catch (error) {
    console.error('Error creating bucket policies:', error);
  }
}

async function main() {
  console.log('Creating storage buckets...');
  
  // Create the resources bucket
  const resourcesSuccess = await createBucket('resources');
  
  if (resourcesSuccess) {
    console.log('Resources bucket setup completed successfully');
  } else {
    console.error('Failed to set up resources bucket');
  }
  
  // Add more buckets here if needed
  
  console.log('Storage bucket setup completed');
}

main().catch(console.error); 