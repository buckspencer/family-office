import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
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
        console.log('Please make sure the "resources" bucket exists and has the correct permissions');
      } else {
        console.log('Test file uploaded successfully:', data);
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(data.path);
        
        console.log('Public URL:', publicUrl);
        
        // Clean up the test file
        const { error: deleteError } = await supabase.storage
          .from('resources')
          .remove([data.path]);
        
        if (deleteError) {
          console.error('Error deleting test file:', deleteError);
        } else {
          console.log('Test file deleted successfully');
        }
      }
    } catch (uploadError) {
      console.error('Error during upload test:', uploadError);
    } finally {
      // Clean up the local test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
    
    console.log('Supabase test completed');
  } catch (error) {
    console.error('Error testing Supabase:', error);
  }
}

testSupabase(); 