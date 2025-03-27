import { redirect } from 'next/navigation';
import { verifyEmail } from '../actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = params.token;
  
  if (!token || Array.isArray(token)) {
    redirect('/sign-in');
  }

  const formData = new FormData();
  const result = await verifyEmail({ token }, formData);

  if (result.error) {
    // If verification failed, redirect to sign in
    redirect('/sign-in');
  }

  // If verification succeeded, redirect to dashboard
  redirect('/dashboard');
} 