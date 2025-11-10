import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '@/lib/projects';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = projectsStore.get(id);
  if (!p) return NextResponse.json({ error: 'project not found' }, { status: 404 });
  return NextResponse.json({ files: p.files });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body?.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const f = projectsStore.addFile(id, body.name, body.url);
  if (!f) return NextResponse.json({ error: 'project not found' }, { status: 404 });
  return NextResponse.json(f, { status: 201 });
}


