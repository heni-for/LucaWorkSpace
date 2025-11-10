/**
 * LUCA AI Intent Analysis API
 * Analyzes Derja commands and returns structured intents
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command, context } = body;

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Analyze intent using AI
    const prompt = `
      فهم هالأمر بالدرجة التونسية وعطيني أكشن واضح.
      
      الأوامر المحتملة:
      - "ورّيني الكالندر" → open_calendar
      - "ورّيني الإيميلات" → open_mail
      - "ائيني التسكات" → open_tasks
      - "ورّيني النوت" → open_notes
      - "ورّيني الدشبورد" → open_dashboard
      - "ورّيني الفريق" → open_team
      - "ورّيني الرابورت" → open_reports
      - "ورّيني الوركسبايس" → open_workspace
      - "ورّيني الدوكمونتات" → open_documents
      - "ورّيني الاجتماعات" → open_meetings
      - "زيد تاسك جديدة" → create_task
      - "ابعث ايميل" → create_email
      - "زيد نوت جديدة" → create_note
      - "شوف الإيميلات الجديدة" → show_emails
      - "شوف التسكات" → show_tasks
      - "شوف الاجتماعات" → show_meetings
      - "خلي ليّ ملخص الإيميلات" → summarize_emails
      - "خلي ليّ ملخص التسكات" → summarize_tasks
      - "دور على..." → search
      
      ${context ? `الكونتيكست: ${context}` : ''}
      
      الأمر: ${command}
      
      ردّي بالاكشن فقط بدون شرح. مثال: open_calendar
    `;

    const response = await aiService.generateText({
      prompt,
      language: 'ar-TN',
      maxTokens: 50,
      temperature: 0.3,
      context: context || undefined,
    });

    if (!response.success) {
      return NextResponse.json(
        { error: 'Failed to analyze intent', details: response.error },
        { status: 500 }
      );
    }

    // Parse intent
    const intent = parseIntent(response.content);

    return NextResponse.json({
      intent,
      originalCommand: command,
      confidence: 0.9,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Intent analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Parse AI response to extract intent
 */
function parseIntent(response: string): string {
  const lowerResponse = response.toLowerCase().trim();
  
  // Map response to intent
  const intentMap: Record<string, string> = {
    'open_calendar': 'open_calendar',
    'open_mail': 'open_mail',
    'open_tasks': 'open_tasks',
    'open_notes': 'open_notes',
    'open_dashboard': 'open_dashboard',
    'open_team': 'open_team',
    'open_reports': 'open_reports',
    'open_workspace': 'open_workspace',
    'open_documents': 'open_documents',
    'open_meetings': 'open_meetings',
    'create_task': 'create_task',
    'create_email': 'create_email',
    'create_note': 'create_note',
    'show_emails': 'show_emails',
    'show_tasks': 'show_tasks',
    'show_meetings': 'show_meetings',
    'summarize_emails': 'summarize_emails',
    'summarize_tasks': 'summarize_tasks',
    'search': 'search',
  };

  for (const [key, value] of Object.entries(intentMap)) {
    if (lowerResponse.includes(key)) {
      return value;
    }
  }

  return 'unknown';
}

