import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { ActionState } from '@/lib/auth/middleware';

export const metadata: Metadata = {
  title: 'Verify Email',
};

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function verifyEmail(token: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);

  if (!user) {
    redirect('/sign-in?error=invalid-token');
  }

  if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
    redirect('/verify-prompt?error=token-expired');
  }

  await db
    .update(users)
    .set({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    })
    .where(eq(users.id, user.id));

  redirect('/dashboard');
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;
  
  if (!token || Array.isArray(token)) {
    redirect('/sign-in');
  }

  await verifyEmail(token);
  
  return null;
} 