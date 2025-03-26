import { randomBytes } from 'crypto';

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // Token expires in 24 hours
  return expiry;
} 