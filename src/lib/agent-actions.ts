// Server-side function - no "use client" directive
import { projectsStore, summarizeProject } from '@/lib/projects';

export async function handleAssistantCommand(input: string): Promise<string> {
  const text = input.toLowerCase();

  // Create project
  let m = text.match(/create (?:a )?new project called ([a-z0-9\-\s]+)/i);
  if (m) {
    const name = capitalize(m[1].trim());
    const p = projectsStore.create({ name, status: 'Planned' });
    return `Project ${p.name} created. Who should I assign as manager?`;
  }

  // Show progress
  m = text.match(/show (?:me )?(?:the )?progress of project ([a-z0-9\-\s]+)/i);
  if (m) {
    const name = m[1].trim();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const p = projectsStore.get(id);
    if (!p) return `I couldn't find a project named ${name}.`;
    return summarizeProject(p);
  }

  // Add member
  m = text.match(/add ([a-z\-\s]+) to (?:the )?project ([a-z0-9\-\s]+)(?: as ([a-z\-\s]+))?/i);
  if (m) {
    const member = capitalize(m[1].trim());
    const projectName = m[2].trim();
    const role = capitalize((m[3] || 'Member').trim());
    const id = projectName.toLowerCase().replace(/\s+/g, '-');
    const added = projectsStore.addMember(id, member, role);
    return added ? `${member} added to ${projectName} as ${role}.` : `Project ${projectName} not found.`;
  }

  // Add task
  m = text.match(/add (?:a )?task (.+) to project ([a-z0-9\-\s]+)/i);
  if (m) {
    const title = capitalize(m[1].trim());
    const projectName = m[2].trim();
    const id = projectName.toLowerCase().replace(/\s+/g, '-');
    const t = projectsStore.addTask(id, title);
    return t ? `Task "${title}" added to ${projectName}.` : `Project ${projectName} not found.`;
  }

  // Mark task done
  m = text.match(/mark task (\d+|"[^"]+") (?:as )?done in project ([a-z0-9\-\s]+)/i);
  if (m) {
    const projectName = m[2].trim();
    const id = projectName.toLowerCase().replace(/\s+/g, '-');
    const p = projectsStore.get(id);
    if (!p) return `Project ${projectName} not found.`;
    const taskRef = m[1];
    const task = findTask(p, taskRef);
    if (!task) return `Task ${taskRef} not found in ${projectName}.`;
    projectsStore.setTaskDone(id, task.id, true);
    return `Marked "${task.title}" as done in ${projectName}.`;
  }

  // Reassign task
  m = text.match(/reassign (?:task )?(\d+|"[^"]+") to ([a-z\-\s]+) in project ([a-z0-9\-\s]+)/i);
  if (m) {
    const assignee = capitalize(m[2].trim());
    const projectName = m[3].trim();
    const id = projectName.toLowerCase().replace(/\s+/g, '-');
    const p = projectsStore.get(id);
    if (!p) return `Project ${projectName} not found.`;
    const task = findTask(p, m[1]);
    if (!task) return `Task not found in ${projectName}.`;
    projectsStore.reassignTask(id, task.id, assignee);
    return `Reassigned "${task.title}" to ${assignee}.`;
  }

  // Extend deadline
  m = text.match(/extend (?:deadline )?of (?:task )?(\d+|"[^"]+") by (\d+) day(?:s)? in project ([a-z0-9\-\s]+)/i);
  if (m) {
    const days = parseInt(m[2], 10);
    const projectName = m[3].trim();
    const id = projectName.toLowerCase().replace(/\s+/g, '-');
    const p = projectsStore.get(id);
    if (!p) return `Project ${projectName} not found.`;
    const task = findTask(p, m[1]);
    if (!task) return `Task not found in ${projectName}.`;
    const base = task.dueDate ? new Date(task.dueDate) : new Date();
    base.setDate(base.getDate() + days);
    projectsStore.setTaskDueDate(id, task.id, base.toISOString());
    return `Extended deadline of "${task.title}" by ${days} day(s).`;
  }

  // Daily report
  if (/daily report|today'?s report/.test(text)) {
    const projects = (projectsStore.list() || []).map(p => summarizeProject(p)).join(' ');
    return projects || 'No projects yet.';
  }

  // List files
  m = text.match(/show (?:me )?files for project ([a-z0-9\-\s]+)/i);
  if (m) {
    const name = m[1].trim();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const p = projectsStore.get(id);
    if (!p) return `Project ${name} not found.`;
    if (p.files.length === 0) return `No files in ${name}.`;
    return `Files in ${name}: ` + p.files.map(f => f.name).join(', ');
  }

  return "I didn't understand. Try: 'Create a new project called Phoenix' or 'Show progress of Project Phoenix'.";
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function findTask(p: any, ref: string) {
  if (/^\d+$/.test(ref)) return p.tasks.find((t: any) => t.id === ref);
  const name = ref.replace(/^"|"$/g, '');
  return p.tasks.find((t: any) => t.title.toLowerCase() === name.toLowerCase());
}

/**
 * LUCA Agent Action Executor
 * Maps intents to actual actions in the platform
 */

import { AgentIntent } from '@/ai/agent/derjaAgent';

// Feedback messages in Derja
const FEEDBACK_MESSAGES: Record<AgentIntent, string> = {
  open_calendar: 'فتحت الكالندر متاعك ✅',
  open_mail: 'فتحت الإيميلات متاعك ✅',
  open_tasks: 'فتحت التسكات ✅',
  open_notes: 'فتحت النوت متاعك ✅',
  open_dashboard: 'راجعي الدشبورد ✅',
  open_team: 'فتحت صفحة الفريق ✅',
  open_reports: 'فتحت الرابورتات ✅',
  open_workspace: 'فتحت الوركسبايس ✅',
  open_documents: 'فتحت الدوكمونتات ✅',
  open_meetings: 'فتحت الاجتماعات ✅',
  create_task: 'تفتح صفحة تسك جديدة ✅',
  create_email: 'تفتح صفحة إيميل جديد ✅',
  create_note: 'تفتح صفحة نوت جديدة ✅',
  show_emails: 'راجع الإيميلات الجديدة ✅',
  show_tasks: 'راجع التسكات ✅',
  show_meetings: 'راجع الاجتماعات ✅',
  summarize_emails: 'عملت ملخص الإيميلات ✅',
  summarize_tasks: 'عملت ملخص التسكات ✅',
  search: 'شبحك على اللي تبحث عليه ✅',
  unknown: 'آسف، ما فمّتش نفهم. جرّب مرّة تانية 🤔',
};

export interface ActionResult {
  success: boolean;
  feedback: string;
  action?: string;
  error?: string;
}

/**
 * Execute intent action
 */
export async function executeIntentAction(intent: AgentIntent): Promise<ActionResult> {
  try {
    // Use dynamic navigation based on client-side
    let success = true;
    let action = '';

    switch (intent) {
      case 'open_calendar':
        action = 'navigate:calendar';
        if (typeof window !== 'undefined') {
          window.location.href = '/calendar';
        }
        break;

      case 'open_mail':
      case 'show_emails':
        action = 'navigate:mail';
        if (typeof window !== 'undefined') {
          window.location.href = '/mail';
        }
        break;

      case 'open_tasks':
      case 'show_tasks':
        action = 'navigate:tasks';
        if (typeof window !== 'undefined') {
          window.location.href = '/tasks';
        }
        break;

      case 'open_notes':
        action = 'navigate:notes';
        if (typeof window !== 'undefined') {
          window.location.href = '/notes';
        }
        break;

      case 'open_dashboard':
        action = 'navigate:dashboard';
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        break;

      case 'open_team':
        action = 'navigate:team';
        if (typeof window !== 'undefined') {
          window.location.href = '/team';
        }
        break;

      case 'open_reports':
        action = 'navigate:reports';
        if (typeof window !== 'undefined') {
          window.location.href = '/reports';
        }
        break;

      case 'open_workspace':
        action = 'navigate:workspace';
        if (typeof window !== 'undefined') {
          window.location.href = '/workspace';
        }
        break;

      case 'open_documents':
        action = 'navigate:documents';
        if (typeof window !== 'undefined') {
          window.location.href = '/documents';
        }
        break;

      case 'open_meetings':
      case 'show_meetings':
        action = 'navigate:meetings';
        if (typeof window !== 'undefined') {
          window.location.href = '/meetings';
        }
        break;

      case 'create_task':
        action = 'navigate:create_task';
        if (typeof window !== 'undefined') {
          window.location.href = '/tasks?action=create';
        }
        break;

      case 'create_email':
        action = 'navigate:create_email';
        if (typeof window !== 'undefined') {
          window.location.href = '/mail?action=compose';
        }
        break;

      case 'create_note':
        action = 'navigate:create_note';
        if (typeof window !== 'undefined') {
          window.location.href = '/notes?action=create';
        }
        break;

      case 'summarize_emails':
        action = 'api:summarize_emails';
        await fetch('/api/ai/email/summarize', { method: 'POST' });
        break;

      case 'summarize_tasks':
        action = 'api:summarize_tasks';
        await fetch('/api/ai/tasks/summarize', { method: 'POST' });
        break;

      case 'search':
        action = 'trigger:search';
        if (typeof window !== 'undefined') {
          // Trigger search modal or navigate to search
          window.dispatchEvent(new CustomEvent('luca:open-search'));
        }
        break;

      default:
        success = false;
        action = 'unknown:intent';
    }

    return {
      success,
      feedback: FEEDBACK_MESSAGES[intent],
      action,
    };
  } catch (error) {
    console.error('Action execution error:', error);
    
    return {
      success: false,
      feedback: 'آسف، وقع خطأ. جرّب مرّة تانية.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get feedback message for intent
 */
export function getFeedbackMessage(intent: AgentIntent): string {
  return FEEDBACK_MESSAGES[intent] || FEEDBACK_MESSAGES.unknown;
}

