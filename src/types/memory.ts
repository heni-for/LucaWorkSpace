export interface UserProfileMemory {
  name?: string;
  title?: string;
  bio?: string;
}

export type ProjectStatus = 'Planned' | 'In Progress' | 'Blocked' | 'Done';

export interface ProjectMemory {
  name: string;
  firstSeenAt: string; // ISO timestamp
  source?: string; // e.g., mail, meeting, task
  description?: string;
  tags?: string[];
  status?: ProjectStatus;
  progressPct?: number; // 0-100
}

export type ChapterReminderStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ChapterReminder {
  id: string; // unique identifier
  chapterName: string;
  courseName?: string;
  createdAt: string; // ISO timestamp
  status: ChapterReminderStatus;
  totalHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  nextAction: string; // e.g., "Start your chapter now", "Continue with Phase 2"
  phaseCount: number; // total number of learning phases
  currentPhase?: number; // which phase they're on (1-indexed)
  dueDate?: string; // optional deadline
  reminderMessage: string; // Custom message in Derja
  fullPlan?: any; // The complete chapter plan with all details
}

export interface MemorySnapshot {
  user: UserProfileMemory;
  projects: ProjectMemory[];
  chapterReminders: ChapterReminder[];
}

export interface MemoryService {
  getSnapshot(): MemorySnapshot;
  rememberUserProfile(partial: UserProfileMemory): void;
  listProjects(): ProjectMemory[];
  rememberProjects(names: string[], source?: string): void;
  upsertProject(project: ProjectMemory): void;
  listChapterReminders(): ChapterReminder[];
  addChapterReminder(reminder: ChapterReminder): void;
  updateChapterReminder(id: string, updates: Partial<ChapterReminder>): void;
  deleteChapterReminder(id: string): void;
}


