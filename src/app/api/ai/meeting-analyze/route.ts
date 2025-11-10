/**
 * LUCA Meeting Analysis API
 * Analyzes meeting transcript and generates Derja report
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, duration, transcript, prompt } = body;

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Build analysis prompt
    const analysisPrompt = `
      أنا عاين لقاء بعنوان "${title}" بين Tunisian professionals.
      
      المحتوى:
      ${transcript.map((line: any) => 
        `[${line.language?.toUpperCase() || 'DERJA'}] ${line.speaker}: ${line.text}`
      ).join('\n')}
      
      المدة: ${Math.round(duration / 60)} دقيقة
      المشاركين: ${[...new Set(transcript.map((line: any) => line.speaker))].join(', ')}
      
      اعمللي rapport كامل بالدرجة التونسية على:
      
      1. ملخص عام للاجتماع (في بسكت - 100 كلمة)
      2. النقاط الرئيسية (5-10 نقاط)
      3. القرارات اللي اتخذت
      4. Action items (الشغل اللي لازم يتم)
      5. Next steps (الخطوات الجاية)
      6. نصايح ومشورة للفريق
      
      ردّ بالدرجة التونسية وبشكل منظم واضح.
    `;

    // Call AI service
    const response = await aiService.generateText({
      prompt: analysisPrompt,
      language: 'ar-TN',
      maxTokens: 2000,
      temperature: 0.7,
    });

    if (!response.success) {
      return NextResponse.json(
        { error: 'Failed to analyze meeting', details: response.error },
        { status: 500 }
      );
    }

    // Parse AI response
    const content = response.content;
    
    // Extract sections
    const sections = {
      summary: extractSection(content, 'ملخص'),
      keyPoints: extractList(content, 'النقاط الرئيسية'),
      decisions: extractList(content, 'القرارات'),
      actionItems: extractList(content, 'Action items'),
      nextSteps: extractList(content, 'Next steps'),
      advice: extractList(content, 'النصايح'),
    };

    return NextResponse.json({
      success: true,
      report: {
        title,
        duration,
        participants: [...new Set(transcript.map((line: any) => line.speaker))],
        summary: sections.summary || content.split('\n')[0],
        keyPoints: sections.keyPoints || [],
        decisions: sections.decisions || [],
        actionItems: sections.actionItems || [],
        nextSteps: sections.nextSteps || [],
        advice: sections.advice || [],
        language: 'derja' as const,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Meeting analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Extract a section from the response
 */
function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=\\d+\\.|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract a list from the response
 */
function extractList(content: string, listName: string): string[] {
  const section = extractSection(content, listName);
  if (!section) return [];

  // Split by bullet points or numbers
  return section
    .split(/\n|•|–|-/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && !item.match(/^\d+[\.\)]/));
}

