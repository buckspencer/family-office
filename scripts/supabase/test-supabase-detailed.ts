import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

async function testSupabaseDetailed() {
  try {
    console.log('Testing Supabase connection with detailed logging...');
    
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
    
    // Create a supabase client
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('Supabase client created');
    
    // List buckets
    console.log('Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      console.log('Buckets:', buckets);
    }
    
    // Check if 'resources' bucket exists
    const resourcesBucket = buckets?.find(b => b.name === 'resources');
    
    if (resourcesBucket) {
      console.log('Resources bucket exists:', resourcesBucket);
      
      // List files in the resources bucket
      console.log('Listing files in resources bucket (root)...');
      const { data: rootFiles, error: rootFilesError } = await supabase.storage
        .from('resources')
        .list();
      
      if (rootFilesError) {
        console.error('Error listing files in root:', rootFilesError);
      } else {
        console.log('Files in resources bucket (root):', rootFiles);
      }
      
      // Try to create a test folder
      console.log('Trying to create a test folder...');
      const testFolderPath = 'test-folder/';
      const { data: folderData, error: folderError } = await supabase.storage
        .from('resources')
        .upload(testFolderPath, new Uint8Array(0), {
          contentType: 'application/x-directory',
        });
      
      if (folderError) {
        console.error('Error creating test folder:', folderError);
      } else {
        console.log('Test folder created:', folderData);
      }
      
      // Try to upload a test file
      console.log('Attempting to upload a test file...');
      
      // Create a small test file
      const testFilePath = path.resolve(process.cwd(), 'test-file.txt');
      fs.writeFileSync(testFilePath, 'This is a test file for Supabase Storage');
      
      try {
        // Upload the file
        const fileName = `test_${Date.now()}.txt`;
        const { data, error } = await supabase.storage
          .from('resources')
          .upload(fileName, fs.readFileSync(testFilePath), {
            contentType: 'text/plain',
            cacheControl: '3600',
            upsert: false,
          });
        
        if (error) {
          console.error('Error uploading test file:', error);
          
          // Try with a user folder
          console.log('Trying with a user folder...');
          const userFileName = `1/test_${Date.now()}.txt`;
          const { data: userData, error: userError } = await supabase.storage
            .from('resources')
            .upload(userFileName, fs.readFileSync(testFilePath), {
              contentType: 'text/plain',
              cacheControl: '3600',
              upsert: false,
            });
          
          if (userError) {
            console.error('Error uploading to user folder:', userError);
          } else {
            console.log('Test file uploaded to user folder successfully:', userData);
            
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from('resources')
              .getPublicUrl(userData.path);
            
            console.log('Public URL:', publicUrl);
          }
        } else {
          console.log('Test file uploaded successfully:', data);
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(data.path);
          
          console.log('Public URL:', publicUrl);
        }
      } catch (uploadError) {
        console.error('Error during upload test:', uploadError);
      } finally {
        // Clean up the local test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    } else {
      console.error('Resources bucket does not exist in the list of buckets');
      console.log('Available buckets:', buckets?.map(b => b.name) || []);
    }
    
    console.log('Supabase test completed');
  } catch (error) {
    console.error('Error testing Supabase:', error);
  }
}

testSupabaseDetailed(); 