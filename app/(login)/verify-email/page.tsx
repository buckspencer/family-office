import { redirect } from 'next/navigation';
import { verifyEmail } from '../actions';
import { Metadata } from 'next';
import { VerifyEmail } from './verify';

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
    return <VerifyEmail token="" />;
  }

  const formData = new FormData();
  const result = await verifyEmail({ token }, formData);

  if (result.error) {
    // If verification failed, show error message
    return <VerifyEmail token={token} error={result.error} />;
  }

  // If verification succeeded, redirect to dashboard
  redirect('/dashboard');
} 