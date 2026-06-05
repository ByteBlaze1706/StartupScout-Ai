import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';
import { isRateLimited } from '@/lib/rateLimiter';
import { z } from 'zod';

// Zod Validation Schema for Registration
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  email: z.string().email('Please enter a valid email address.').transform(e => e.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .refine(val => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter.' })
    .refine(val => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter.' })
    .refine(val => /[0-9]/.test(val), { message: 'Password must contain at least one number.' })
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: Max 5 signups per 15 minutes
    const limitResult = isRateLimited(req, 5, 15 * 60 * 1000, 'signup');
    if (limitResult.limited) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // 2. Validate input with Zod
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid registration details.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // 3. Create user in database (awaited!)
    const signupResult = await serverDb.createUser(name, email, password);
    if (!signupResult.success || !signupResult.user) {
      return NextResponse.json({ error: signupResult.error || 'Registration failed.' }, { status: 400 });
    }

    // 4. Generate Session (awaited!)
    const session = await serverDb.createSession(signupResult.user.id);

    // 5. Set Cookie with strict secure settings
    const cookieStore = await cookies();
    cookieStore.set('startupscout_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: '/'
    });

    return NextResponse.json({ success: true, user: signupResult.user });
  } catch (error: any) {
    console.error('Error in signup API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
