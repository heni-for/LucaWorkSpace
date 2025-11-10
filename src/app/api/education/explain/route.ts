import { NextRequest, NextResponse } from 'next/server';
import { explainInDerja } from '@/ai/flows/education-explain';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.text) return NextResponse.json({ error: 'text required' }, { status: 400 });
  const res = await explainInDerja({ text: body.text, focus: body.focus, style: body.style, depth: body.depth });
  return NextResponse.json(res);
}


