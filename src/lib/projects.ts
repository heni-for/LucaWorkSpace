export type ProjectId = string;

export interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string; // ISO
  assignee?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url?: string;
  uploadedAt: string;
}

export interface ProjectRecord {
  id: ProjectId;
  name: string;
  description?: string;
  status: 'Planned' | 'In Progress' | 'Blocked' | 'Done';
  progressPct: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  manager?: string;
  tags?: string[];
  tasks: ProjectTask[];
  members: ProjectMember[];
  files: ProjectFile[];
  activity: string[]; // simple log strings
}

// In-memory local-first store (demo). Replace with DB later.
const STORAGE_KEY = 'luca.projects.v1';

function load(): { projects: ProjectRecord[] } {
  if (typeof window === 'undefined') return { projects: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { projects: [] };
  } catch { return { projects: [] }; }
}

function save(s: { projects: ProjectRecord[] }) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const store: { projects: ProjectRecord[] } = load();

export const projectsStore = {
  list(): ProjectRecord[] { return store.projects; },
  get(id: ProjectId): ProjectRecord | undefined { return store.projects.find(p => p.id === id); },
  create(input: Partial<ProjectRecord> & { name: string }): ProjectRecord {
    const id = (input.name || '').toLowerCase().replace(/\s+/g, '-');
    const now = new Date().toISOString();
    const rec: ProjectRecord = {
      id,
      name: input.name,
      description: input.description || '',
      status: (input.status as any) || 'Planned',
      progressPct: input.progressPct ?? 0,
      createdAt: now,
      startDate: input.startDate,
      endDate: input.endDate,
      manager: input.manager,
      tags: input.tags || [],
      tasks: [],
      members: [],
      files: [],
      activity: [`Project ${input.name} created @ ${now}`],
    };
    store.projects.push(rec);
    save(store);
    return rec;
  },
  addTask(projectId: ProjectId, title: string, dueDate?: string): ProjectTask | undefined {
    const p = this.get(projectId);
    if (!p) return undefined;
    const t: ProjectTask = { id: `${Date.now()}`, title, done: false, dueDate };
    p.tasks.push(t);
    p.activity.push(`Task added: ${title}`);
    recalcProgress(p);
    save(store);
    return t;
  },
  addMember(projectId: ProjectId, name: string, role: string): ProjectMember | undefined {
    const p = this.get(projectId);
    if (!p) return undefined;
    const m: ProjectMember = { id: `${Date.now()}`, name, role };
    p.members.push(m);
    p.activity.push(`Member added: ${name} (${role})`);
    save(store); return m;
  },
  addFile(projectId: ProjectId, name: string, url?: string): ProjectFile | undefined {
    const p = this.get(projectId);
    if (!p) return undefined;
    const f: ProjectFile = { id: `${Date.now()}`, name, url, uploadedAt: new Date().toISOString() };
    p.files.push(f);
    p.activity.push(`File uploaded: ${name}`);
    save(store); return f;
  },
  setTaskDone(projectId: ProjectId, taskId: string, done: boolean): ProjectTask | undefined {
    const p = this.get(projectId);
    if (!p) return undefined;
    const t = p.tasks.find(t => t.id === taskId);
    if (!t) return undefined;
    t.done = done;
    p.activity.push(`Task ${done ? 'completed' : 'reopened'}: ${t.title}`);
    recalcProgress(p);
    save(store); return t;
  },
  setTaskDueDate(projectId: ProjectId, taskId: string, dueDate?: string): ProjectTask | undefined {
    const p = this.get(projectId);
    if (!p) return undefined;
    const t = p.tasks.find(t => t.id === taskId);
    if (!t) return undefined;
    t.dueDate = dueDate;
    p.activity.push(`Task due date updated: ${t.title} → ${dueDate || 'unset'}`);
    save(store); return t;
  },
  reassignTask(projectId: ProjectId, taskId: string, assignee: string): ProjectTask | undefined {
    const p = this.get(projectId);
    if (!p) return undefined;
    const t = p.tasks.find(t => t.id === taskId);
    if (!t) return undefined;
    t.assignee = assignee;
    p.activity.push(`Task reassigned: ${t.title} → ${assignee}`);
    save(store); return t;
  },
};

export function summarizeProject(p: ProjectRecord): string {
  const total = p.tasks.length;
  const done = p.tasks.filter(t => t.done).length;
  const remaining = total - done;
  const delayed = p.tasks.filter(t => !t.done && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const todayUploads = p.files.filter(f => new Date(f.uploadedAt).toDateString() === new Date().toDateString()).length;
  return `Project ${p.name} is ${p.progressPct}% done, ${delayed} task(s) delayed, ${todayUploads} new file(s) today. ${done}/${total} tasks completed, ${remaining} remaining.`;
}

export function projectAlerts(p: ProjectRecord) {
  const now = new Date();
  const alerts: { level: 'info' | 'warning' | 'critical'; message: string; taskId?: string }[] = [];
  p.tasks.forEach(t => {
    if (!t.dueDate || t.done) return;
    const due = new Date(t.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) alerts.push({ level: 'critical', message: `Task "${t.title}" is overdue by ${Math.abs(diffDays)} day(s).`, taskId: t.id });
    else if (diffDays <= 1) alerts.push({ level: 'warning', message: `Task "${t.title}" due ${diffDays === 0 ? 'today' : 'tomorrow'}.`, taskId: t.id });
  });
  return alerts;
}

function recalcProgress(p: ProjectRecord) {
  const total = p.tasks.length || 1;
  const done = p.tasks.filter(t => t.done).length;
  p.progressPct = Math.round((done / total) * 100);
}


