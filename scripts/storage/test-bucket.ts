import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

async function testBucket() {
  try {
    console.log('Testing Supabase bucket access...');
    
    // Load environment variables from .env.local
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // List all buckets
    console.log('Listing all buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Error listing buckets: ${bucketsError.message}`);
    }
    
    console.log('Available buckets:', buckets);
    
    // Check if resources bucket exists
    const resourcesBucket = buckets.find(b => b.name === 'resources');
    
    if (!resourcesBucket) {
      console.log('Resources bucket does not exist. Creating it...');
      
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
      console.log('Resources bucket exists:', resourcesBucket);
      
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
      console.log('Listing files in resources bucket...');
      const { data: files, error: filesError } = await supabase.storage
        .from('resources')
        .list();
      
      if (filesError) {
        console.error('Error listing files:', filesError);
      } else {
        console.log('Files in resources bucket:', files);
        
        // List files in the user's folder if it exists
        const userId = '2acc0c4f-d97f-471e-9bb0-2ef6e33167ac';
        console.log(`Listing files in user folder (${userId})...`);
        
        const { data: userFiles, error: userFilesError } = await supabase.storage
          .from('resources')
          .list(userId);
        
        if (userFilesError) {
          console.error('Error listing user files:', userFilesError);
        } else {
          console.log(`Files in user folder (${userId}):`, userFiles);
        }
      }
    }
    
    console.log('Test completed');
  } catch (error) {
    console.error('Error testing bucket:', error);
  }
}

testBucket(); 