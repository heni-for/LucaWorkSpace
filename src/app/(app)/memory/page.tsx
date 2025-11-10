'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { memory, deleteProjectByName } from '@/lib/memory';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function MemoryPage() {
  const [snapshot, setSnapshot] = React.useState<{
    user: { name?: string; title?: string; bio?: string };
    projects: any[];
    chapterReminders: any[];
  }>({ user: {}, projects: [], chapterReminders: [] });
  
  // Load data only on client side to avoid hydration mismatch
  React.useEffect(() => {
    setSnapshot(memory.getSnapshot());
  }, []);
  
  const refresh = () => setSnapshot(memory.getSnapshot());

  const updateChapterStatus = (id: string, status: 'Not Started' | 'In Progress' | 'Completed') => {
    memory.updateChapterReminder(id, { status });
    refresh();
  };

  const deleteChapterReminder = (id: string) => {
    memory.deleteChapterReminder(id);
    refresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Not Started':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'easy':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Memory" description="Saved insights and reusable snippets for your assistant." />

      {/* Chapter Reminders Section */}
      {snapshot.chapterReminders && snapshot.chapterReminders.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chapter Reminders / Rappels de Chapitres ({snapshot.chapterReminders.length})
              </div>
              <Badge variant="outline" className="bg-white">
                Education
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {snapshot.chapterReminders.map(reminder => {
                const progressPct = reminder.currentPhase && reminder.phaseCount
                  ? Math.round(((reminder.currentPhase - 1) / reminder.phaseCount) * 100)
                  : 0;

                return (
                  <div
                    key={reminder.id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{reminder.chapterName}</h3>
                        {reminder.courseName && (
                          <p className="text-sm text-muted-foreground">{reminder.courseName}</p>
                        )}
                      </div>
                      <Badge variant={getDifficultyColor(reminder.difficulty)}>
                        {reminder.difficulty}
                      </Badge>
                    </div>

                    {/* Reminder Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm font-medium text-blue-900">
                        💡 {reminder.reminderMessage}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">Total Hours</div>
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reminder.totalHours}h
                        </div>
                      </div>
                      <div className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">Phases</div>
                        <div className="font-semibold">
                          {reminder.currentPhase || 1}/{reminder.phaseCount}
                        </div>
                      </div>
                      <div className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">Progress</div>
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {progressPct}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(reminder.status)}`} />
                      <span className="text-sm font-medium">{reminder.status}</span>
                    </div>

                    {/* Next Action */}
                    <div className="bg-muted/50 rounded-md p-2">
                      <div className="text-xs text-muted-foreground mb-1">Next Action:</div>
                      <div className="text-sm font-medium">{reminder.nextAction}</div>
                    </div>

                    {/* Due Date (if available) */}
                    {reminder.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(reminder.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(reminder.createdAt).toLocaleString()}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <select
                        className="text-xs border rounded p-1.5 bg-white"
                        value={reminder.status}
                        onChange={(e) =>
                          updateChapterStatus(
                            reminder.id,
                            e.target.value as 'Not Started' | 'In Progress' | 'Completed'
                          )
                        }
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteChapterReminder(reminder.id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>

                    {/* Link to Chapter Details */}
                    <Link href={`/education/chapter/${reminder.id}`}>
                      <Button variant="default" size="sm" className="w-full">
                        📚 View Chapter Details
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Name</div>
            <div className="text-sm">{snapshot.user.name || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Title</div>
            <div className="text-sm">{snapshot.user.title || '-'}</div>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">Bio</div>
            <div className="text-sm">{snapshot.user.bio || '-'}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects ({snapshot.projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {snapshot.projects.map(p => (
              <div key={p.name} className="flex items-center justify-between rounded-lg border p-3 bg-card/50">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">First seen {new Date(p.firstSeenAt).toLocaleString()} · {p.source || 'unknown'}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { deleteProjectByName(p.name); refresh(); }}>Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


