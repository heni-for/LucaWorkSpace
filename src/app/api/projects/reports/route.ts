import { NextRequest, NextResponse } from 'next/server';
import { projectsStore, summarizeProject, projectAlerts } from '@/lib/projects';

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') || 'daily';
  const projects = projectsStore.list();
  const lines: string[] = [];
  lines.push(`Your ${range} report:`);
  for (const p of projects) {
    lines.push(summarizeProject(p));
    const alerts = projectAlerts(p);
    alerts.forEach(a => lines.push(`${a.level === 'critical' ? '!' : '-'} ${a.message}`));
  }
  const speech = lines.join(' ');
  const text = lines.join('\n');
  return NextResponse.json({ text, speech });
}


