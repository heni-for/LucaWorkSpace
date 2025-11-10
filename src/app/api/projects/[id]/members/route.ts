import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '@/lib/projects';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = projectsStore.get(id);
  if (!p) return NextResponse.json({ error: 'project not found' }, { status: 404 });
  return NextResponse.json({ members: p.members });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body?.name || !body?.role) return NextResponse.json({ error: 'name and role required' }, { status: 400 });
  const m = projectsStore.addMember(id, body.name, body.role);
  if (!m) return NextResponse.json({ error: 'project not found' }, { status: 404 });
  return NextResponse.json(m, { status: 201 });
}


