'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Show success message
    toast.success('Email confirmed successfully!', {
      description: 'You can now sign in with your credentials',
    });
    
    // Redirect to login page after a short delay
    const timer = setTimeout(() => {
      router.push('/auth');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Email Confirmed!
          </h2>
          
          <div className="mt-4 p-4 bg-primary/10 text-primary rounded-md">
            <p>Your email has been successfully confirmed.</p>
            <p className="mt-2">Redirecting you to the login page...</p>
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 