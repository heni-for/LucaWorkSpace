import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '@/lib/projects';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = projectsStore.get(id);
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(p);
}


