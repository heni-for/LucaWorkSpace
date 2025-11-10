import { NextResponse } from 'next/server';
import { projectsStore, summarizeProject, projectAlerts } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lines: string[] = [];
  for (const p of projectsStore.list()) {
    lines.push(summarizeProject(p));
    for (const a of projectAlerts(p)) lines.push(`- ${a.message}`);
  }
  return NextResponse.json({ text: lines.join('\n') });
}


