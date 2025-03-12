import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

async function testSupabaseAuth() {
  try {
    console.log('Testing Supabase Auth...');
    
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
    
    // Test email/password sign-up
    // NOTE: This will create a real user in your Supabase project
    // Use a test email that you have access to
    const testEmail = 'test.user@gmail.com'; // Change this to a real email you own
    const testPassword = 'Password123!'; // Must be at least 6 characters with mixed case and special chars
    
    console.log(`Attempting to sign up with email: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
        }
      }
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
      
      // Try to sign in instead
      console.log('Attempting to sign in instead...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
      } else {
        console.log('Sign in successful:', signInData);
        
        // Get user
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError) {
          console.error('Error getting user:', getUserError);
        } else {
          console.log('Current user:', user);
        }
        
        // Sign out
        const { error: signOutError } = await supabase.auth.signOut();
        
        if (signOutError) {
          console.error('Sign out error:', signOutError);
        } else {
          console.log('Sign out successful');
        }
      }
    } else {
      console.log('Sign up successful:', signUpData);
      
      // If email confirmation is disabled, we'll get a session right away
      if (signUpData.session) {
        console.log('Session created:', signUpData.session);
        
        // Get user
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError) {
          console.error('Error getting user:', getUserError);
        } else {
          console.log('Current user:', user);
        }
        
        // Sign out
        const { error: signOutError } = await supabase.auth.signOut();
        
        if (signOutError) {
          console.error('Sign out error:', signOutError);
        } else {
          console.log('Sign out successful');
        }
      } else {
        console.log('Email confirmation required. Check your email for a confirmation link.');
      }
    }
    
    console.log('Supabase Auth test completed');
  } catch (error) {
    console.error('Error testing Supabase Auth:', error);
  }
}

testSupabaseAuth(); 