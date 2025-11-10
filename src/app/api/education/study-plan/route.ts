import { NextRequest, NextResponse } from 'next/server';
import { educationStudyPlan } from '@/ai/flows/education-study-plan';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseName,
      courseContent,
      examDate,
      studyHoursPerWeek,
      preferredMethod,
      currentLevel,
    } = body;

    if (!courseName) {
      return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    }

    const result = await educationStudyPlan({
      courseName,
      courseContent,
      examDate,
      studyHoursPerWeek: studyHoursPerWeek ? Number(studyHoursPerWeek) : undefined,
      preferredMethod,
      currentLevel,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Study plan generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate study plan' },
      { status: 500 }
    );
  }
}

