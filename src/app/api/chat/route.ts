import { NextRequest, NextResponse } from 'next/server';
import { runCopilotChat } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { report, chatHistory, message } = body;

    if (!report || !message) {
      return NextResponse.json({ error: 'Report and message are required' }, { status: 400 });
    }

    const reply = await runCopilotChat(report, chatHistory || [], message);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
