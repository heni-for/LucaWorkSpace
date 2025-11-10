import type { UserProfileMemory, ProjectMemory, MemorySnapshot, MemoryService, ChapterReminder } from '@/types/memory';

const STORAGE_KEY = 'luca.memory.v1';

function loadSnapshot(): MemorySnapshot {
  if (typeof window === 'undefined') return { user: {}, projects: [], chapterReminders: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: {}, projects: [], chapterReminders: [] };
    const parsed = JSON.parse(raw) as MemorySnapshot;
    return {
      user: parsed.user || {},
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      chapterReminders: Array.isArray(parsed.chapterReminders) ? parsed.chapterReminders : [],
    };
  } catch {
    return { user: {}, projects: [], chapterReminders: [] };
  }
}

function saveSnapshot(snapshot: MemorySnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export const memory: MemoryService = {
  getSnapshot(): MemorySnapshot {
    return loadSnapshot();
  },

  rememberUserProfile(partial: UserProfileMemory) {
    const snap = loadSnapshot();
    snap.user = { ...snap.user, ...partial };
    saveSnapshot(snap);
  },

  listProjects(): ProjectMemory[] {
    return loadSnapshot().projects;
  },

  rememberProjects(names: string[], source?: string) {
    if (names.length === 0) return;
    const now = new Date().toISOString();
    const snap = loadSnapshot();
    const existing = new Map(snap.projects.map(p => [p.name.toLowerCase(), p] as const));
    names.forEach(name => {
      const key = name.trim();
      if (!key) return;
      const found = existing.get(key.toLowerCase());
      if (!found) {
        snap.projects.push({ name: key, firstSeenAt: now, source, status: 'Planned', progressPct: 0 });
      } else if (source && !found.source) {
        found.source = source;
      }
    });
    saveSnapshot(snap);
  },
  upsertProject(project) {
    const snap = loadSnapshot();
    const idx = snap.projects.findIndex(p => p.name.toLowerCase() === project.name.toLowerCase());
    if (idx === -1) {
      snap.projects.push({
        name: project.name,
        firstSeenAt: project.firstSeenAt || new Date().toISOString(),
        source: project.source,
        description: project.description,
        tags: project.tags || [],
        status: project.status || 'Planned',
        progressPct: project.progressPct ?? 0,
      });
    } else {
      snap.projects[idx] = { ...snap.projects[idx], ...project };
    }
    saveSnapshot(snap);
  },

  listChapterReminders(): ChapterReminder[] {
    return loadSnapshot().chapterReminders;
  },

  addChapterReminder(reminder: ChapterReminder) {
    const snap = loadSnapshot();
    // Check if reminder with same ID already exists
    const exists = snap.chapterReminders.some(r => r.id === reminder.id);
    if (!exists) {
      snap.chapterReminders.push(reminder);
      saveSnapshot(snap);
    }
  },

  updateChapterReminder(id: string, updates: Partial<ChapterReminder>) {
    const snap = loadSnapshot();
    const idx = snap.chapterReminders.findIndex(r => r.id === id);
    if (idx !== -1) {
      snap.chapterReminders[idx] = { ...snap.chapterReminders[idx], ...updates };
      saveSnapshot(snap);
    }
  },

  deleteChapterReminder(id: string) {
    const snap = loadSnapshot();
    snap.chapterReminders = snap.chapterReminders.filter(r => r.id !== id);
    saveSnapshot(snap);
  },
  
  // Extra utilities (not in interface but exported via named funcs below)
};

// Naive project extractor: finds tokens like "Project Phoenix", "Projet Atlas", or #ProjectName
const PROJECT_REGEXES: RegExp[] = [
  /(project|projet)\s+([A-Z][A-Za-z0-9_-]{2,})/gi, // Project Phoenix
  /#([A-Z][A-Za-z0-9_-]{2,})/g,                    // #Phoenix
  /\b([A-Z][A-Za-z0-9_-]{3,})\s+(initiative|program|programme)\b/gi,
];

export function extractProjectNames(text: string): string[] {
  const found = new Set<string>();
  PROJECT_REGEXES.forEach(rx => {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
      const candidate = m[m.length - 1];
      if (candidate) found.add(candidate.trim());
    }
  });
  return Array.from(found);
}

export function deleteProjectByName(name: string) {
  const snap = loadSnapshot();
  snap.projects = snap.projects.filter(p => p.name.toLowerCase() !== name.toLowerCase());
  saveSnapshot(snap);
}



