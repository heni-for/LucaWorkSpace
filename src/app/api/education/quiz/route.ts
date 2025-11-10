import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/ai/flows/education-quiz';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.text) return NextResponse.json({ error: 'text required' }, { status: 400 });
  const res = await generateQuiz({ text: body.text, count: body.count });
  return NextResponse.json(res);
}


