import { NextRequest, NextResponse } from 'next/server';
import { handleAssistantCommand } from '@/lib/agent-actions';
import { projectsStore } from '@/lib/projects';
import { aiService } from '@/lib/ai-service';

async function summarizeGmail(req: NextRequest) {
  const access = req.cookies.get('google_access_token')?.value;
  if (!access) return null;
  const res = await fetch(`${req.nextUrl.origin}/api/mail/gmail`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  const total = Array.isArray(data.messages) ? data.messages.length : 0;
  return { provider: 'Gmail', total };
}

async function summarizeOutlook(req: NextRequest) {
  const access = req.cookies.get('ms_access_token')?.value;
  if (!access) return null;
  const res = await fetch(`${req.nextUrl.origin}/api/mail/outlook`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  const total = Array.isArray(data.value) ? data.value.length : 0;
  return { provider: 'Outlook', total };
}

function derjaCountPhrase(items: { provider: string; total: number }[]) {
  if (items.length === 0) return 'ماكش مربوط بالحسابات متاع الإيميل.';
  const parts = items.map(i => `${i.total} إيميل جديد في ${i.provider}`);
  return `عندك ${parts.join(' و ')}.`;
}

function isEmailSummary(text: string) {
  return /(emails?|boite|inbox|gmail|outlook|إيميلات|boite mails|ch3andy emails)/i.test(text);
}

function isOpenMailbox(text: string) {
  return /(open|7eli|ouvrir).*(boite|inbox|gmail|outlook)/i.test(text);
}

function isOpenPage(text: string) {
  return /(open|7eli|ouvrir)\s+(calendar|tasks?|notes?|dashboard|team|reports?|education|projects?|profile|memory|documents?)/i.test(text);
}

function mapPageToUrl(match: RegExpMatchArray) {
  const key = (match[2] || '').toLowerCase();
  const map: Record<string, string> = {
    calendar: '/calendar',
    task: '/tasks', tasks: '/tasks',
    note: '/notes', notes: '/notes',
    dashboard: '/dashboard',
    team: '/team',
    report: '/reports', reports: '/reports',
    education: '/education',
    project: '/projects', projects: '/projects',
    profile: '/profile',
    memory: '/memory',
    document: '/documents', documents: '/documents',
  };
  return map[key];
}

function tasksSummary(): string {
  const projects = projectsStore.list();
  const totals = projects.reduce((acc, p) => {
    acc.total += p.tasks.length;
    acc.done += p.tasks.filter(t => t.done).length;
    return acc;
  }, { total: 0, done: 0 });
  const remaining = totals.total - totals.done;
  if (totals.total === 0) return 'ما عندكش تسكات مسجلة تاو.';
  return `عندك ${remaining} تسك باقي من مجموع ${totals.total}.`;
}

function isTasksSummary(text: string) {
  return /(tasks?|taches|تسكات|to\s*do|pending)/i.test(text) && /(show|chouf|list|qadech|how many)/i.test(text);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const text: string = (body.text || '').toString();
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  // Email intents
  if (isEmailSummary(text)) {
    const [g, o] = await Promise.all([summarizeGmail(req), summarizeOutlook(req)]);
    const items = [g, o].filter(Boolean) as { provider: string; total: number }[];
    const speech = derjaCountPhrase(items);
    return NextResponse.json({ action: 'email:summary', speech });
  }

  if (isOpenMailbox(text)) {
    // Prefer Gmail if connected, else Outlook, else Mail page
    const gmail = req.cookies.get('google_access_token');
    const outlook = req.cookies.get('ms_access_token');
    const url = gmail ? 'https://mail.google.com' : outlook ? 'https://outlook.office.com/mail' : '/mail';
    const speech = gmail
      ? 'نحلّيلك Gmail.'
      : outlook
      ? 'نحلّيلك Outlook.'
      : 'نمشي لصفحة الميل داخل LUCA.';
    return NextResponse.json({ action: 'navigate', url, speech });
  }

  // Delegate to existing project actions (create/show/add/etc.)
  if (isOpenPage(text)) {
    const m = text.match(/(open|7eli|ouvrir)\s+(calendar|tasks?|notes?|dashboard|team|reports?|education|projects?|profile|memory|documents?)/i)!;
    const url = mapPageToUrl(m);
    if (url) return NextResponse.json({ action: 'navigate', url, speech: 'تمام، نمشي للصفحة المطلوبة.' });
  }

  if (isTasksSummary(text)) {
    const speech = tasksSummary();
    return NextResponse.json({ action: 'tasks:summary', speech });
  }

  // Try project-specific commands first
  const reply = await handleAssistantCommand(text);
  
  // If it's a generic "I didn't understand" response, use AI Q&A
  if (reply.includes("didn't understand")) {
    console.log('💬 Using AI Q&A for:', text);
    
    // Detect language (simple heuristic)
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const isFrench = /\b(bonjour|comment|pourquoi|quoi|qui|est-ce)\b/i.test(text);
    const language = isArabic ? 'ar-TN' : isFrench ? 'fr-FR' : 'en-US';
    
    const aiResponse = await aiService.answerQuestion(text, language);
    
    if (aiResponse.success) {
      return NextResponse.json({ 
        action: 'ai:answer', 
        speech: aiResponse.content,
        tokens: aiResponse.tokens 
      });
    }
  }
  
  return NextResponse.json({ action: 'text', speech: reply });
}


