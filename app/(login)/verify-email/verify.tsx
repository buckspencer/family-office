'use client';

import { useEffect } from 'react';
import { verifyEmail } from '../actions';
import { ActionState } from '@/lib/auth/middleware';

export function VerifyEmail({ token }: { token: string }) {
  useEffect(() => {
    const formData = new FormData();
    formData.append('token', token);
    verifyEmail({ error: '', success: '' }, formData);
  }, [token]);

  return null;
} 