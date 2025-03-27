'use client';

import { useEffect, useState } from 'react';
import { verifyEmail } from '../actions';
import { ActionState } from '@/lib/auth/middleware';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function VerifyEmail({ token, error }: { token: string; error?: string }) {
  const [state, setState] = useState<ActionState>({ error: error || '', success: '' });
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setState({ error: 'No verification token provided', success: '' });
      return;
    }

    const formData = new FormData();
    formData.append('token', token);
    verifyEmail({ token }, formData).then((result) => {
      if (result.error) {
        setState({ error: result.error, success: '' });
      } else {
        setState({ error: '', success: 'Email verified successfully' });
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    });
  }, [token, router]);

  if (state.error) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>
            {state.error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/sign-in">Return to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Alert>
          <AlertTitle>Verification Successful</AlertTitle>
          <AlertDescription>
            {state.success}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
        <p className="text-muted-foreground">Please wait while we verify your email address.</p>
      </div>
    </div>
  );
} 