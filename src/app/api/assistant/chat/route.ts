import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, language = 'en-US', context } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('💬 Answering question:', question);

    // Use the AI service to generate a comprehensive answer
    const response = await aiService.generateText({
      prompt: question,
      context: context,
      language: language,
      maxTokens: 2000,
      temperature: 0.7,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate answer');
    }

    console.log('✅ Answer generated:', response.content.substring(0, 100) + '...');

    return NextResponse.json({
      answer: response.content,
      success: true,
      tokens: response.tokens,
      timestamp: response.timestamp,
    });
  } catch (error: any) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process question',
        success: false,
        answer: 'Sorry, I encountered an error. Please try again.',
      },
      { status: 200 } // Return 200 to avoid breaking the flow
    );
  }
}

