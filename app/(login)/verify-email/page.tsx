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
  formData.append('token', token);
  await verifyEmail({ error: '', success: '' }, formData);
  return null;
} 