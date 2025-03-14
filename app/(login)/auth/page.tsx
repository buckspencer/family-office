'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '../auth-form';
import { toast } from 'sonner';

function AuthContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">
          Family Office
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or create an account to continue
        </p>
      </div>
      
      <AuthForm />
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Family Office
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading...
            </p>
          </div>
        </div>
      }>
        <AuthContent />
      </Suspense>
    </div>
  );
} 