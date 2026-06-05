import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { isRateLimited } from '@/lib/rateLimiter';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .refine(val => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter.' })
    .refine(val => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter.' })
    .refine(val => /[0-9]/.test(val), { message: 'Password must contain at least one number.' })
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 password reset attempts per 15 minutes
    const limitResult = isRateLimited(req, 5, 15 * 60 * 1000, 'reset');
    if (limitResult.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = resetSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid parameters.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, newPassword } = validation.data;
    const result = await serverDb.verifyAndResetPassword(token, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Password reset failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Your password has been successfully reset.' });
  } catch (error: any) {
    console.error('Error in reset password API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
