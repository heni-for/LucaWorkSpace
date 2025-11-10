import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '@/lib/projects';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const body = await req.json().catch(() => ({}));
  const { done, dueDate, assignee } = body as { done?: boolean; dueDate?: string; assignee?: string };
  if (done !== undefined) {
    const t = projectsStore.setTaskDone(id, taskId, !!done);
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(t);
  }
  if (dueDate !== undefined) {
    const t = projectsStore.setTaskDueDate(id, taskId, dueDate);
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(t);
  }
  if (assignee !== undefined) {
    const t = projectsStore.reassignTask(id, taskId, assignee);
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(t);
  }
  return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
}


