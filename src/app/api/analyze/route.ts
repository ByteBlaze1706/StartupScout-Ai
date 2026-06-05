import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverDb } from '@/lib/serverDb';
import { analyzeStartupWithAI } from '@/lib/gemini';
import { isRateLimited } from '@/lib/rateLimiter';
import { z } from 'zod';

const analyzeSchema = z.object({
  name: z.string().min(1, 'Startup Name is required.').max(100),
  idea: z.string().min(10, 'Startup Idea description must be at least 10 characters long.').max(1000),
  industry: z.string().min(1, 'Industry is required.'),
  country: z.string().min(1, 'Country is required.'),
  targetAudience: z.string().min(1, 'Target audience is required.'),
  budget: z.string().min(1, 'Budget is required.'),
  stage: z.string().min(1, 'Stage is required.')
});

async function authenticateUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('startupscout_session');
  if (!sessionCookie?.value) return null;

  // Await async db function!
  const session = await serverDb.getSession(sessionCookie.value);
  if (!session) return null;

  return session.userId;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce real auth check
    const userId = await authenticateUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    // 2. Rate Limiting: Max 3 analyses per 15 minutes
    const limitResult = isRateLimited(req, 3, 15 * 60 * 1000, 'analyze');
    if (limitResult.limited) {
      return NextResponse.json(
        { error: 'Too many analysis requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 3. Validate input with Zod
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid startup parameters.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, idea, industry, country, targetAudience, budget, stage } = validation.data;

    // 4. Trigger Gemini AI analysis
    const report = await analyzeStartupWithAI(
      name,
      idea,
      industry,
      country,
      targetAudience,
      budget,
      stage
    );

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
