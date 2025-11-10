'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { projectsStore } from '@/lib/projects';
import { Input } from '@/components/ui/input';

export default function ProjectDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const project = React.useMemo(() => {
    const decodedName = decodeURIComponent(name);
    return projectsStore.list().find(p => p.name.toLowerCase() === decodedName.toLowerCase() || p.id.toLowerCase() === decodedName.toLowerCase());
  }, [name]);

  const title = project?.name || decodeURIComponent(name);
  const status = project?.status || 'Planned';
  const pct = project?.progressPct ?? 0;
  const startDate = project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-';

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={title} description="Project overview and collaboration hub." />

      {/* 1. Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Project Name</div>
            <div className="text-sm font-medium">{title}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="flex items-center gap-2"><Badge variant="secondary">{status}</Badge></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="flex items-center gap-2">
              <span className="text-xs">{pct}%</span>
            </div>
            <Progress value={pct} className="mt-1" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Start Date</div>
            <div className="text-sm">{startDate}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">End Date</div>
            <div className="text-sm">-</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Project Manager</div>
            <div className="text-sm">-</div>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">Description</div>
            <div className="text-sm text-muted-foreground">{project?.description || 'No description yet.'}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[{ name: 'Heni', role: 'Manager' }, { name: 'Sara', role: 'Designer' }, { name: 'Ali', role: 'Developer' }].map(m => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{m.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Contact</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Tasks Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Stat label="Total" value={String(project?.tasks?.length || 0)} />
              <Stat label="Completed" value={String(project?.tasks?.filter(t => (t as any).done).length || 0)} />
              <Stat label="Remaining" value={String((project?.tasks?.length || 0) - (project?.tasks?.filter(t => (t as any).done).length || 0))} />
            </div>
            <div className="space-y-2">
              {(project?.tasks || []).map(t => (
                <div key={(t as any).id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={(t as any).done} onChange={async (e) => {
                      await fetch(`/api/projects/${title.toLowerCase().replace(/\s+/g, '-')}/tasks/${(t as any).id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: e.target.checked }) });
                      location.reload();
                    }} />
                    <span className={(t as any).done ? 'line-through text-muted-foreground' : ''}>{(t as any).title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="date" className="h-8" onChange={async (e) => {
                      await fetch(`/api/projects/${title.toLowerCase().replace(/\s+/g, '-')}/tasks/${(t as any).id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }) });
                    }} />
                    <Input placeholder="Assign to" className="h-8 w-32" onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const v = (e.target as HTMLInputElement).value;
                        if (!v) return;
                        await fetch(`/api/projects/${title.toLowerCase().replace(/\s+/g, '-')}/tasks/${(t as any).id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignee: v }) });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 4. Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Gantt/calendar view placeholder with milestones.</div>
            <ul className="mt-3 text-sm list-disc pl-5 space-y-1">
              <li>Design sign-off — 12/04</li>
              <li>Beta release — 12/18</li>
              <li>Go-live — 01/08</li>
            </ul>
          </CardContent>
        </Card>

        {/* 5. Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">Report_v2.pdf</div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">Roadmap.xlsx</div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            <Button variant="outline">Upload</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 6. Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Heni updated Task #14</div>
            <div>Sara uploaded Design.docx</div>
            <div>Ali commented on Bug #223</div>
          </CardContent>
        </Card>

        {/* 7. Comments / Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-3 text-sm text-muted-foreground">Add discussion and internal notes here.</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Link href="/projects"><Button variant="outline">Back to Projects</Button></Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string; }) {
  return (
    <div className="rounded-md border p-3 bg-card/50">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}


