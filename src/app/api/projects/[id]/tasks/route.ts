import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '@/lib/projects';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body?.title) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const t = projectsStore.addTask(id, body.title, body.dueDate);
  if (!t) return NextResponse.json({ error: 'project not found' }, { status: 404 });
  return NextResponse.json(t, { status: 201 });
}


