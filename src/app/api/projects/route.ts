import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '@/lib/projects';

export async function GET() {
  return NextResponse.json({ projects: projectsStore.list() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const p = projectsStore.create(body);
  return NextResponse.json(p, { status: 201 });
}


