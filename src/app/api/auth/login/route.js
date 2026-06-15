import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';
import { isRateLimited } from '@/lib/rateLimiter';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required.')
});

export async function POST(req) {
  try {
    // 1. Rate Limiting: Max 5 login attempts per 15 minutes
    const limitResult = isRateLimited(req, 5, 15 * 60 * 1000, 'login');
    if (limitResult.limited) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Validate input with Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid credentials.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = validation.data;

    // 3. Verify user credentials (awaited!)
    const loginResult = await serverDb.verifyUser(email, password);
    if (!loginResult.success || !loginResult.user) {
      return NextResponse.json({ error: loginResult.error || 'Invalid credentials.' }, { status: 401 });
    }

    // 4. Generate Session (awaited!)
    const session = await serverDb.createSession(loginResult.user.id);

    // 5. Set Cookie with strict settings
    const cookieStore = await cookies();
    cookieStore.set('startupscout_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: '/'
    });

    return NextResponse.json({ success: true, user: loginResult.user });
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}