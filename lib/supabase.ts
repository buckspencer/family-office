import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Check if the environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a Supabase client for server-side operations
// This is a basic client without cookie access - should only be used for non-auth operations
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Create a client-side Supabase client that handles cookies properly
export const createBrowserClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};

// Configure S3 client for Supabase Storage
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1`,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  forcePathStyle: true,
});

// Helper function to ensure a bucket exists
export async function ensureBucketExists(bucketName: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Determine if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    // Use the appropriate client
    const client = isBrowser ? createBrowserClient() : supabase;
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: new Error(`Failed to list buckets: ${listError.message}`) };
    }
    
    // Check if our bucket exists
    const bucketExists = buckets.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist, creating it...`);
      
      // Create the bucket
      const { data, error: createError } = await client.storage.createBucket(bucketName, {
        public: true, // Make the bucket public
        fileSizeLimit: 52428800, // 50MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket '${bucketName}':`, createError);
        return { success: false, error: new Error(`Failed to create bucket: ${createError.message}`) };
      }
      
      console.log(`Bucket '${bucketName}' created successfully`);
      
      // Set up RLS policies for the bucket
      // This is a basic policy that allows authenticated users to upload files
      const { error: policyError } = await client.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: `${bucketName}_insert_policy`,
        definition: `(bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1])::boolean`,
        operation: 'INSERT'
      });
      
      if (policyError) {
        console.warn(`Error setting up RLS policy for bucket '${bucketName}':`, policyError);
        // Don't fail the operation, just log the warning
      }
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The bucket name (default: 'resources')
 * @param category The category folder (optional)
 * @param userId The user ID to use for the folder path
 * @returns The URL of the uploaded file and any error
 */
export async function uploadFile(
  file: File, 
  bucket: string = 'resources', 
  category?: string, 
  userId?: string | number
): Promise<{ url: string; error: Error | null }> {
  try {
    // Determine if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    // Use the appropriate client
    const client = isBrowser ? createBrowserClient() : supabase;
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Get the current user ID if not provided
    let userIdToUse = userId;
    if (!userIdToUse) {
      console.log('No userId provided, attempting to get current user');
      // First try to get the user from the session
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
      } else if (sessionData?.session?.user) {
        userIdToUse = sessionData.session.user.id;
        console.log('Got user ID from session:', userIdToUse);
      } else {
        // If no session, try getUser as fallback
        const { data, error: authError } = await client.auth.getUser();
        
        if (authError) {
          console.error('Error getting current user:', authError);
          return { 
            url: '', 
            error: new Error(`Authentication error: ${authError.message}`) 
          };
        }
        
        if (!data.user) {
          console.error('No authenticated user found');
          return { 
            url: '', 
            error: new Error('User ID is required for file upload but no authenticated user was found') 
          };
        }
        
        userIdToUse = data.user.id;
        console.log('Got current user ID from getUser:', userIdToUse);
      }
    }
    
    // Adjust the bucket and path based on the category
    // If category is 'asset', use the resources bucket with asset folder
    let actualBucket = bucket;
    let filePath = '';
    
    if (category === 'asset') {
      actualBucket = 'resources';
      filePath = `${userIdToUse}/asset/${fileName}`;
    } else {
      // IMPORTANT: The folder structure must match the RLS policy
      // The policy expects the first folder to be the user's ID
      filePath = `${userIdToUse}/`;
      
      if (category) {
        filePath += `${category}/`;
      }
      
      filePath += fileName;
    }
    
    console.log('Attempting to upload file to:', { bucket: actualBucket, filePath, fileSize: file.size, fileType: file.type });
    
    // Upload the file to the specified bucket with upsert:true to overwrite if exists
    const { data, error } = await client.storage
      .from(actualBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Use upsert to overwrite existing files
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      return { 
        url: '', 
        error: new Error(`Upload failed: ${error.message}`) 
      };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = client.storage
      .from(actualBucket)
      .getPublicUrl(data.path);
    
    console.log('File uploaded successfully:', { path: data.path, publicUrl });
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: '', error: error as Error };
  }
}

// Helper function to delete a file from Supabase Storage
export async function deleteFile(
  filePath: string,
  bucket: string = 'resources'
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Check if it's a full URL or just a path
    let path = filePath;
    
    // If it's a full URL, extract the path
    if (filePath.includes('storage/v1/object/public/')) {
      const urlParts = filePath.split('/storage/v1/object/public/');
      
      if (urlParts.length >= 2) {
        const pathParts = urlParts[1].split('/');
        bucket = pathParts[0];
        path = pathParts.slice(1).join('/');
      }
    } else if (filePath.includes('supabase.co')) {
      // Handle other Supabase URL formats
      try {
        const url = new URL(filePath);
        const pathSegments = url.pathname.split('/');
        
        // Look for the bucket name in the path
        const bucketIndex = pathSegments.findIndex(segment => 
          segment === 'storage' || segment === 'object' || segment === 'public'
        );
        
        if (bucketIndex >= 0 && bucketIndex + 1 < pathSegments.length) {
          bucket = pathSegments[bucketIndex + 1];
          path = pathSegments.slice(bucketIndex + 2).join('/');
        }
      } catch (urlError) {
        console.warn('Could not parse URL:', urlError);
        // Continue with the original path
      }
    }
    
    console.log('Attempting to delete file:', { bucket, path });
    
    // Check if the path is empty
    if (!path) {
      console.warn('Empty file path, cannot delete');
      return { success: false, error: new Error('Empty file path') };
    }
    
    // Attempt to delete the file
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file from storage:', error);
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error as Error };
  }
}

// Generate a presigned URL using S3 client
export async function getS3SignedUrl(bucket: string, filePath: string, expiresIn: number = 3600): Promise<{ url: string; error: Error | null }> {
  try {
    // For Supabase, we'll use their native API instead of S3 client
    // since the S3 compatibility layer has authentication issues
    console.log('Generating signed URL via Supabase API for:', { bucket, filePath });
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Error generating signed URL via Supabase API:', error);
      
      // Fall back to public URL
      const { data: publicUrlData } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      if (publicUrlData && publicUrlData.publicUrl) {
        console.log('Falling back to public URL');
        return { url: publicUrlData.publicUrl, error: null };
      }
      
      return { url: '', error: error };
    }
    
    if (!data || !data.signedUrl) {
      console.error('No signed URL returned from Supabase API');
      return { url: '', error: new Error('Failed to generate signed URL') };
    }
    
    console.log('Successfully generated signed URL via Supabase API');
    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error('Error in getS3SignedUrl:', error);
    return { url: '', error: error as Error };
  }
} 