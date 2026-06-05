import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('startupscout_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    // Await async db function!
    const session = await serverDb.getSession(sessionCookie.value);
    if (!session) {
      // Clear invalid/expired cookie
      cookieStore.set('startupscout_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      return NextResponse.json({ user: null });
    }

    // Await async db function!
    const user = await serverDb.getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error in session checking API:', error);
    return NextResponse.json({ user: null, error: 'Internal Server Error' }, { status: 500 });
  }
}
