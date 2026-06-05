import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .refine(val => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter.' })
    .refine(val => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter.' })
    .refine(val => /[0-9]/.test(val), { message: 'Password must contain at least one number.' })
    .optional()
});

async function authenticateUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('startupscout_session');
  if (!sessionCookie?.value) return null;

  const session = await serverDb.getSession(sessionCookie.value);
  if (!session) return null;

  return session.userId;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid parameters.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, currentPassword, newPassword } = validation.data;

    // 1. Handle name updates
    if (name) {
      const success = await serverDb.updateUserProfile(userId, name);
      if (!success) {
        return NextResponse.json({ error: 'Failed to update profile name.' }, { status: 400 });
      }
    }

    // 2. Handle password updates
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      // Fetch user email to verify
      const user = await serverDb.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }

      const verifyResult = await serverDb.verifyUser(user.email, currentPassword);
      if (!verifyResult.success) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
      }

      const success = await serverDb.updateUserPassword(userId, newPassword);
      if (!success) {
        return NextResponse.json({ error: 'Failed to update password.' }, { status: 400 });
      }
    }

    const updatedUser = await serverDb.getUserById(userId);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
