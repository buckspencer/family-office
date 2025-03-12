import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';
import { 
  signInWithSupabase, 
  signUpWithSupabase, 
  signOutFromSupabase,
  getCurrentSupabaseUser,
  getSupabaseSession
} from './supabase';
import { supabase } from '@/lib/supabase';

const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const key = new TextEncoder().encode(secretKey);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getSession() {
  // First try to get the Supabase session
  const { data: { session: supabaseSession } } = await supabase.auth.getSession();
  
  if (supabaseSession) {
    return {
      user: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email || '',
        name: supabaseSession.user.user_metadata?.name || supabaseSession.user.email?.split('@')[0] || '',
      }
    };
  }
  
  // Fall back to the custom session
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setSession(user: NewUser) {
  // Set both our custom session and sign in with Supabase
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: any = {
    user: {
      id: user.id!,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  
  // We don't await this because we don't want to block the response
  // This is just to keep Supabase in sync
  try {
    if (user.email && user.passwordHash) {
      // This is a simplified approach - in a real app, you'd need to handle this differently
      // since we can't recover the plain text password
      // For now, we'll just sign in if the user already exists
      await signInWithSupabase(user.email, user.passwordHash);
    }
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    // We don't throw here because we still want to set our custom session
  }
}
