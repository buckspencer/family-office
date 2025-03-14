// Simple script to test Supabase bucket access
// Run with: node test-bucket.js

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    process.env[key.trim()] = value.trim();
    envVars[key.trim()] = value.trim();
  }
});

// Import Supabase after setting environment variables
const { createClient } = require('@supabase/supabase-js');

async function testBucket() {
  try {
    console.log('Testing Supabase bucket access...');
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey.substring(0, 5) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // List all buckets
    console.log('\nListing all buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Error listing buckets: ${bucketsError.message}`);
    }
    
    console.log('Available buckets:', buckets);
    
    // Check if resources bucket exists
    const resourcesBucket = buckets.find(b => b.name === 'resources');
    
    if (!resourcesBucket) {
      console.log('\nResources bucket does not exist. Creating it...');
      
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(
        'resources',
        { public: true }
      );
      
      if (createError) {
        throw new Error(`Error creating bucket: ${createError.message}`);
      }
      
      console.log('Resources bucket created:', newBucket);
    } else {
      console.log('\nResources bucket exists:', resourcesBucket);
      
      // Update bucket to be public
      const { error: updateError } = await supabase.storage.updateBucket(
        'resources',
        { public: true }
      );
      
      if (updateError) {
        console.error('Error updating bucket:', updateError);
      } else {
        console.log('Resources bucket updated to be public');
      }
      
      // List files in the resources bucket
      console.log('\nListing files in resources bucket root...');
      const { data: files, error: filesError } = await supabase.storage
        .from('resources')
        .list();
      
      if (filesError) {
        console.error('Error listing files:', filesError);
      } else {
        console.log('Files in resources bucket root:', files);
        
        // List files in the user's folder if it exists
        const userId = '2acc0c4f-d97f-471e-9bb0-2ef6e33167ac';
        console.log(`\nListing files in user folder (${userId})...`);
        
        const { data: userFiles, error: userFilesError } = await supabase.storage
          .from('resources')
          .list(userId);
        
        if (userFilesError) {
          console.error('Error listing user files:', userFilesError);
        } else {
          console.log(`Files in user folder (${userId}):`, userFiles);
          
          // If user folder has files, try to get a public URL for the first file
          if (userFiles && userFiles.length > 0) {
            const firstFile = userFiles[0];
            console.log(`\nGetting public URL for file: ${firstFile.name}`);
            
            const { data: { publicUrl } } = supabase.storage
              .from('resources')
              .getPublicUrl(`${userId}/${firstFile.name}`);
            
            console.log('Public URL:', publicUrl);
            console.log('Try accessing this URL in your browser');
          }
        }
      }
    }
    
    console.log('\nTest completed');
  } catch (error) {
    console.error('Error testing bucket:', error);
  }
}

testBucket(); 