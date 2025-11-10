import { NextResponse } from 'next/server';
import { projectsStore, projectAlerts } from '@/lib/projects';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = projectsStore.get(id);
  if (!p) return NextResponse.json({ error: 'project not found' }, { status: 404 });
  return NextResponse.json({ alerts: projectAlerts(p) });
}


