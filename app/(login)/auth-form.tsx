'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, createBrowserClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const [browserClient, setBrowserClient] = useState<any>(null);
  
  useEffect(() => {
    // Initialize the browser client
    setBrowserClient(createBrowserClient());
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    if (!browserClient) {
      setError('Client not initialized. Please try again.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Validate inputs
      if (!email || !password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting to sign in with email:', email);
      
      // Attempt to sign in
      const { data, error } = await browserClient.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', JSON.stringify(data, null, 2));
      
      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email before signing in. Check your inbox for a confirmation link.');
          setMessage('If you cannot find the confirmation email, you can request a new one.');
        } else if (error.message.includes('Invalid email')) {
          setError('Invalid email address format');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else if (data.session) {
        console.log('Sign in successful, session created', {
          user: data.session.user.email,
          user_id: data.session.user.id,
          expires_at: data.session.expires_at
        });
        
        toast.success('Signed in successfully!');
        
        try {
          // Ensure the session is properly set
          await browserClient.auth.getSession();
          
          // Add a small delay to ensure cookies are set
          setTimeout(() => {
            // Redirect to dashboard
            console.log('Redirecting to dashboard...');
            router.push('/dashboard');
          }, 1000);
        } catch (sessionErr) {
          console.error('Error during redirection:', sessionErr);
          setError('Authentication successful but there was an issue redirecting you. Please try manually navigating to the dashboard.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    if (!browserClient) {
      setError('Client not initialized. Please try again.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Validate inputs
      if (!email || !password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting to sign up with email:', email);
      
      // Get the absolute URL for the callback
      const origin = window.location.origin;
      const callbackUrl = `${origin}/auth/callback?type=signup`;
      
      console.log('Using callback URL:', callbackUrl);
      
      // Attempt to sign up
      const { data, error } = await browserClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            name: email.split('@')[0], // Use part of email as name
          },
        },
      });
      
      console.log('Sign up response:', JSON.stringify(data, null, 2));
      
      if (error) {
        console.error('Sign up error:', error);
        
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('invalid')) {
          setError('Invalid email address. Please check and try again.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else if (data.user) {
        if (data.session) {
          // User is signed in immediately (email confirmation disabled)
          console.log('Session created immediately:', {
            user: data.session.user.email,
            user_id: data.session.user.id,
            expires_at: data.session.expires_at
          });
          
          toast.success('Account created successfully!');
          
          try {
            // Ensure the session is properly set
            await browserClient.auth.getSession();
            
            // Add a small delay to ensure cookies are set
            setTimeout(() => {
              // Redirect to dashboard
              console.log('Redirecting to dashboard...');
              router.push('/dashboard');
            }, 1000);
          } catch (sessionErr) {
            console.error('Error during redirection:', sessionErr);
            setError('Account created but there was an issue redirecting you. Please try manually navigating to the dashboard.');
          }
        } else {
          // Email confirmation required
          console.log('Email confirmation required for:', data.user.email);
          setMessage(`Please check your email (${data.user.email}) for a confirmation link. You need to confirm your email before you can sign in.`);
          toast.success('Sign up successful! Please check your email for a confirmation link.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!browserClient) {
      setError('Client not initialized. Please try again.');
      return;
    }
    
    setResendingEmail(true);
    setError(null);
    
    try {
      // Get the absolute URL for the callback
      const origin = window.location.origin;
      const callbackUrl = `${origin}/auth/callback?type=signup`;
      
      console.log('Using callback URL for resend:', callbackUrl);
      
      const { data, error } = await browserClient.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });
      
      if (error) {
        console.error('Error resending confirmation email:', error);
        setError(error.message);
      } else {
        setMessage(`Confirmation email resent to ${email}. Please check your inbox.`);
        toast.success('Confirmation email resent');
      }
    } catch (err) {
      console.error('Unexpected error resending confirmation:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setResendingEmail(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? 'Create an Account' : 'Sign In'}</CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'Enter your details to create a new account' 
            : 'Enter your email and password to sign in'}
        </CardDescription>
      </CardHeader>
      
      {isSignUp ? (
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-md bg-primary/10 text-primary text-sm">
                {message}
                {message.includes('confirmation') && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2"
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail}
                  >
                    {resendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend confirmation email'
                    )}
                  </Button>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account?</span>{' '}
              <Button variant="link" className="p-0" onClick={toggleMode}>
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      ) : (
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
                {error.includes('confirm your email') && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2"
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail}
                  >
                    {resendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend confirmation email'
                    )}
                  </Button>
                )}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-md bg-primary/10 text-primary text-sm">
                {message}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account?</span>{' '}
              <Button variant="link" className="p-0" onClick={toggleMode}>
                Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
} 