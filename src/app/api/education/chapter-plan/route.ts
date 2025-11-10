import { NextRequest, NextResponse } from 'next/server';
import { generateChapterPlan } from '@/ai/flows/education-chapter-plan';
import type { ChapterReminder } from '@/types/memory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chapterName,
      courseName,
      researchData,
      studentLevel,
      preferredMethod,
    } = body;

    if (!chapterName || !researchData) {
      return NextResponse.json(
        { error: 'Chapter name and research data are required' },
        { status: 400 }
      );
    }

    const result = await generateChapterPlan({
      chapterName,
      courseName,
      researchData,
      studentLevel,
      preferredMethod,
    });

    // Create a chapter reminder for the memory system
    const chapterPlan = result.chapterPlan;
    const reminder: ChapterReminder = {
      id: `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      chapterName,
      courseName,
      createdAt: new Date().toISOString(),
      status: 'Not Started',
      totalHours: chapterPlan.totalHours,
      difficulty: chapterPlan.difficulty,
      nextAction: 'Bda chapitre mta3ek!',
      phaseCount: chapterPlan.learningPhases.length,
      currentPhase: 1,
      reminderMessage: `Waselna plan el chapitre "${chapterName}" mta3ek! ${chapterPlan.totalHours} se3a fi ${chapterPlan.learningPhases.length} phases. Bda taw!`,
      fullPlan: chapterPlan, // Include the complete plan
    };

    // Return the result with the reminder
    return NextResponse.json({
      ...result,
      chapterReminder: reminder,
    });
  } catch (error: any) {
    console.error('Chapter plan generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate chapter plan' },
      { status: 500 }
    );
  }
}

