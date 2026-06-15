import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';





async function authenticateUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('startupscout_session');
  if (!sessionCookie?.value) return null;

  const session = await serverDb.getSession(sessionCookie.value);
  if (!session) return null;

  return session.userId;
}

export async function GET(req, props) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const project = await serverDb.getProjectById(id, userId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, props) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const deleted = await serverDb.deleteProject(id, userId);

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found or delete denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req, props) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();

    if (body.action === 'duplicate') {
      const duplicated = await serverDb.duplicateProject(id, userId);
      if (!duplicated) {
        return NextResponse.json({ error: 'Project not found or duplication denied.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, project: duplicated });
    }

    // Support saving details edit
    if (body.action === 'update_comments') {
      const proj = await serverDb.getProjectById(id, userId);
      if (!proj) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

      proj.report.chatHistory = body.chatHistory || proj.report.chatHistory;
      await serverDb.saveProject(proj);
      return NextResponse.json({ success: true, project: proj });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (error) {
    console.error('Error handling project action:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req, props) {
  try {
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();

    if (body.action === 'increment_export') {
      const success = await serverDb.incrementProjectExportCount(id, userId);
      if (!success) {
        return NextResponse.json({ error: 'Project not found or update denied.' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (error) {
    console.error('Error patch project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}