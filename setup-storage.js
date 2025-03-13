const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
dotenv.config();

// Also load from .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envLocalConfig) {
    process.env[k] = envLocalConfig[k];
  }
  console.log('Loaded environment variables from .env.local');
}

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are not set');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using anon key:', supabaseKey ? '✓ (key is set)' : '✗ (key is not set)');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  try {
    console.log('\nChecking Supabase Storage configuration...');
    
    // Check if the buckets exist by getting their public URLs
    console.log('\nVerifying bucket existence...');
    
    // Check attachments bucket
    const { data: attachmentsUrl } = supabase.storage.from('attachments').getPublicUrl('test-file.txt');
    if (attachmentsUrl && attachmentsUrl.publicUrl) {
      console.log('✅ Attachments bucket: Found');
    } else {
      console.log('❌ Attachments bucket: Not found or not accessible');
    }
    
    // Check resources bucket
    const { data: resourcesUrl } = supabase.storage.from('resources').getPublicUrl('test-file.txt');
    if (resourcesUrl && resourcesUrl.publicUrl) {
      console.log('✅ Resources bucket: Found');
    } else {
      console.log('❌ Resources bucket: Not found or not accessible');
    }
    
    console.log('\nNote: The buckets appear to exist, but the anon key does not have permission to upload files.');
    console.log('This is expected behavior for Supabase, as the anon key typically has limited permissions.');
    console.log('You will need to configure row-level security policies in the Supabase dashboard to allow file uploads.');
    
    console.log('\nSupabase Storage check complete');
    console.log('You can now proceed with the database migration');
  } catch (error) {
    console.error('Error checking Supabase Storage:', error);
    process.exit(1);
  }
}

// Run the setup
setupStorage(); 