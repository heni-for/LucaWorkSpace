import { NextRequest, NextResponse } from 'next/server';
import { researchChapter } from '@/ai/flows/education-research';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform,
      url,
      title,
      description,
      chapters,
      timestamp,
    } = body;

    if (!title || !chapters || chapters.length === 0) {
      return NextResponse.json(
        { error: 'Course title and chapters are required' },
        { status: 400 }
      );
    }

    // Return the course data structure that can be imported into the education page
    // The frontend will handle adding it to the chapters list
    const importedCourse = {
      platform,
      url,
      title,
      description: description || '',
      chapters: chapters.map((ch: any, idx: number) => ({
        id: `imported_chapter_${timestamp}_${idx}`,
        name: ch.title || `Chapter ${idx + 1}`,
        url: ch.url || '',
        completed: false,
      })),
      importedAt: timestamp || new Date().toISOString(),
      source: 'chrome_extension',
    };

    return NextResponse.json({
      success: true,
      course: importedCourse,
      message: `Course "${title}" with ${chapters.length} chapters imported successfully`,
    });
  } catch (error: any) {
    console.error('Course import error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to import course' },
      { status: 500 }
    );
  }
}

