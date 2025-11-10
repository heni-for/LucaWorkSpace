import { NextRequest, NextResponse } from 'next/server';
import { researchChapter } from '@/ai/flows/education-research';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chapterName,
      courseName,
      currentLevel,
      language = 'derja',
      enableWebSearch = true,
      additionalContext,
    } = body;

    if (!chapterName) {
      return NextResponse.json({ error: 'Chapter name is required' }, { status: 400 });
    }

    const result = await researchChapter({
      chapterName,
      courseName,
      currentLevel,
      language,
      enableWebSearch,
      additionalContext,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chapter research error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to research chapter' },
      { status: 500 }
    );
  }
}

