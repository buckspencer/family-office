import { getUser } from '@/lib/db/queries';
import { generateVerificationToken, generateTokenExpiry } from '@/lib/auth/tokens';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '@/lib/email/service';
import { redirect } from 'next/navigation';

async function resendVerification() {
  'use server';
  
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  console.log('Current user state:', {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken
  });

  if (user.emailVerified) {
    console.log('User is already verified, redirecting to dashboard');
    redirect('/dashboard');
  }

  const verificationToken = generateVerificationToken();
  const verificationTokenExpiry = generateTokenExpiry();

  console.log('Generated new token:', verificationToken);
  console.log('For user:', user.email);

  await db
    .update(users)
    .set({
      verificationToken,
      verificationTokenExpiry,
    })
    .where(eq(users.id, user.id));

  // Verify the token was saved
  const updatedUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  console.log('Updated user state:', {
    id: updatedUser[0].id,
    email: updatedUser[0].email,
    emailVerified: updatedUser[0].emailVerified,
    verificationToken: updatedUser[0].verificationToken
  });

  await sendVerificationEmail({
    email: user.email,
    token: verificationToken,
  });
}

export default async function VerifyPromptPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  if (user.emailVerified) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Verify Your Email
        </h1>
        <div className="mb-6 text-center text-gray-600">
          <p>We sent a verification email to:</p>
          <p className="mt-2 font-medium text-gray-900">{user.email}</p>
        </div>
        <p className="mb-6 text-center text-sm text-gray-500">
          Please check your email and click the verification link to continue.
          If you don't see the email, check your spam folder.
        </p>
        <form action={resendVerification}>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Resend Verification Email
          </button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="/sign-out"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
} 