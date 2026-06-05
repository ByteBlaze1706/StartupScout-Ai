import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('startupscout_session');

    if (sessionCookie?.value) {
      // Await async db function!
      await serverDb.deleteSession(sessionCookie.value);
    }

    // Clear cookie
    cookieStore.set('startupscout_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in logout API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
