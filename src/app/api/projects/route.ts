import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';

// Helper to authenticate session from cookie on the server side
async function authenticateUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('startupscout_session');
  if (!sessionCookie?.value) return null;

  const session = await serverDb.getSession(sessionCookie.value);
  if (!session) return null;

  return session.userId;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const projects = await serverDb.getProjectsByUserId(userId);
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, idea, industry, country, targetAudience, budget, stage, report } = body;

    if (!id || !name || !idea) {
      return NextResponse.json({ error: 'Project id, name, and idea are required.' }, { status: 400 });
    }

    const projectRecord = {
      id,
      userId,
      name,
      idea,
      industry: industry || 'Tech',
      country: country || 'Global',
      targetAudience: targetAudience || 'General Audience',
      budget: budget || '$0',
      stage: stage || 'Idea Stage',
      createdAt: body.createdAt || new Date().toISOString(),
      report
    };

    await serverDb.saveProject(projectRecord);
    return NextResponse.json({ success: true, project: projectRecord });
  } catch (error: any) {
    console.error('Error saving project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
