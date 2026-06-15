import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Confirming your password is required to delete the account.')
});

async function authenticateUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('startupscout_session');
  if (!sessionCookie?.value) return null;

  const session = await serverDb.getSession(sessionCookie.value);
  if (!session) return null;

  return session.userId;
}

export async function POST(req) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = deleteAccountSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Verification failed.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { password } = validation.data;

    // Fetch user email to verify password
    const user = await serverDb.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const verifyResult = await serverDb.verifyUser(user.email, password);
    if (!verifyResult.success) {
      return NextResponse.json({ error: 'Incorrect password confirmation.' }, { status: 400 });
    }

    // Cascade delete everything
    const success = await serverDb.deleteUserAccount(userId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete the account.' }, { status: 500 });
    }

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.set('startupscout_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return NextResponse.json({ success: true, message: 'Your account has been deleted.' });
  } catch (error) {
    console.error('Error in delete-account API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}