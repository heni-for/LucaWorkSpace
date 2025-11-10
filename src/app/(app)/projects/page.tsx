'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { memory, deleteProjectByName } from '@/lib/memory';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

export default function ProjectsPage() {
  const [open, setOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [status, setStatus] = React.useState<'Planned' | 'In Progress' | 'Blocked' | 'Done'>('Planned');
  const [progressPct, setProgressPct] = React.useState(0);
  const [projects, setProjects] = React.useState(memory.listProjects());

  const refresh = () => setProjects(memory.listProjects());

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Projects" description="Track and manage your projects." />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
        <Button onClick={() => setOpen(true)}>New Project</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {projects.map(p => (
          <Card key={p.name} className="hover:shadow-md transition-all bg-gradient-to-b from-card to-background border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <Link href={`/projects/${encodeURIComponent(p.name)}`} className="hover:underline">
                    {p.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.status || 'Planned'}</Badge>
                  <Badge variant="outline">{new Date(p.firstSeenAt).toLocaleDateString()}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProjectAlerts name={p.name} />
              {p.description && (
                <div className="text-sm text-muted-foreground">{p.description}</div>
              )}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.tags.map(t => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{p.progressPct ?? 0}%</span>
                </div>
                <Progress value={p.progressPct ?? 0} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Source: {p.source || 'unknown'}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { deleteProjectByName(p.name); refresh(); }}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Project name (e.g., Phoenix)" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <div className="flex gap-3">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" min={0} max={100} placeholder="Progress %" value={progressPct} onChange={(e) => setProgressPct(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const n = projectName.trim();
              if (!n) return;
              memory.upsertProject({
                name: n,
                firstSeenAt: new Date().toISOString(),
                source: 'projects',
                description: description.trim() || undefined,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                status,
                progressPct: Math.max(0, Math.min(100, progressPct)),
              });
              setProjectName('');
              setDescription('');
              setTags('');
              setStatus('Planned');
              setProgressPct(0);
              setOpen(false);
              refresh();
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectAlerts({ name }: { name: string }) {
  const [alerts, setAlerts] = React.useState<{ level: 'info' | 'warning' | 'critical'; message: string }[]>([]);
  React.useEffect(() => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    fetch(`/api/projects/${encodeURIComponent(id)}/alerts`).then(r => r.json()).then(d => setAlerts(d.alerts || [])).catch(() => {});
  }, [name]);
  if (alerts.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {alerts.slice(0, 2).map((a, i) => (
        <Badge key={i} variant={a.level === 'critical' ? 'destructive' : 'secondary'}>{a.message}</Badge>
      ))}
    </div>
  );
}


