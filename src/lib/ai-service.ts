/**
 * LUCA Platform AI Service
 * Enterprise-grade AI integration for 1M+ users
 */

import { config } from './config';
import { trackAIUsage, trackVoiceCommand } from './analytics';

// AI Service Types
interface AIRequest {
  prompt: string;
  context?: string;
  language?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

interface AIResponse {
  content: string;
  tokens: number;
  model: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

interface VoiceCommand {
  command: string;
  language: string;
  context?: string;
}

interface VoiceResponse {
  text: string;
  audio?: Blob;
  success: boolean;
  confidence: number;
  language: string;
  error?: string;
}

interface EmailAnalysis {
  classification: 'work' | 'personal' | 'promotion' | 'spam';
  priority: 'high' | 'medium' | 'low';
  summary: string;
  suggestedReply: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
  keyTopics: string[];
}

interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category: string;
  estimatedDuration: number;
}

// AI Service Class
class AIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    // Get API key from environment - it should be available server-side
    this.apiKey = process.env.GEMINI_API_KEY || 
                  process.env.GOOGLE_API_KEY || 
                  process.env.GOOGLE_GENAI_API_KEY || 
                  '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = config.ai.model;
    
    // Log for debugging (only in dev)
    if (process.env.NODE_ENV === 'development' && !this.apiKey) {
      console.warn('⚠️ Warning: No AI API key found in environment variables');
    }
  }

  // Text Generation
  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('No AI API key configured. Please set GEMINI_API_KEY in your .env.local file.');
      }

      // Use correct Gemini API endpoint (model name should be like 'gemini-1.5-pro')
      const modelName = this.model.replace('models/', '');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: this.buildPrompt(request)
            }]
          }],
          generationConfig: {
            maxOutputTokens: request.maxTokens || config.ai.maxTokens,
            temperature: request.temperature || config.ai.temperature,
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'AI request failed');
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const tokens = this.estimateTokens(request.prompt + content);

      // Track usage
      trackAIUsage('text_generation', tokens, request.language);

      return {
        content,
        tokens,
        model: this.model,
        timestamp: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: '',
        tokens: 0,
        model: this.model,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Voice Command Processing
  async processVoiceCommand(command: VoiceCommand): Promise<VoiceResponse> {
    try {
      const response = await this.generateText({
        prompt: `Process this voice command in ${command.language}: "${command.command}"`,
        context: command.context,
        language: command.language,
        maxTokens: 500,
      });

      if (!response.success) {
        throw new Error(response.error || 'Voice command processing failed');
      }

      // Track voice command
      trackVoiceCommand(command.command, response.success, command.language);

      return {
        text: response.content,
        success: response.success,
        confidence: 0.9, // This would be calculated by the speech recognition service
        language: command.language,
      };
    } catch (error) {
      console.error('Voice Command Error:', error);
      return {
        text: '',
        success: false,
        confidence: 0,
        language: command.language,
      };
    }
  }

  // Email Analysis
  async analyzeEmail(emailContent: string, language: string = 'ar-TN'): Promise<EmailAnalysis> {
    try {
      const prompt = `
        Analyze this email and provide:
        1. Classification: work, personal, promotion, or spam
        2. Priority: high, medium, or low
        3. Summary in ${language}
        4. Suggested reply in ${language}
        5. Sentiment: positive, neutral, or negative
        6. Key topics (comma-separated)
        
        Email content: ${emailContent}
      `;

      const response = await this.generateText({
        prompt,
        language,
        maxTokens: 1000,
      });

      if (!response.success) {
        throw new Error(response.error || 'Email analysis failed');
      }

      // Parse the response (in a real implementation, you'd use structured output)
      const lines = response.content.split('\n');
      const classification = this.extractValue(lines, 'Classification:') as EmailAnalysis['classification'];
      const priority = this.extractValue(lines, 'Priority:') as EmailAnalysis['priority'];
      const summary = this.extractValue(lines, 'Summary:') || '';
      const suggestedReply = this.extractValue(lines, 'Suggested reply:') || '';
      const sentiment = this.extractValue(lines, 'Sentiment:') as EmailAnalysis['sentiment'];
      const keyTopics = this.extractValue(lines, 'Key topics:')?.split(',').map(t => t.trim()) || [];

      return {
        classification,
        priority,
        summary,
        suggestedReply,
        sentiment,
        language,
        keyTopics,
      };
    } catch (error) {
      console.error('Email Analysis Error:', error);
      return {
        classification: 'personal',
        priority: 'low',
        summary: 'Analysis failed',
        suggestedReply: 'Unable to generate reply',
        sentiment: 'neutral',
        language,
        keyTopics: [],
      };
    }
  }

  // Task Suggestions
  async suggestTasks(context: string, language: string = 'ar-TN'): Promise<TaskSuggestion[]> {
    try {
      const prompt = `
        Based on this context, suggest 3-5 relevant tasks:
        Context: ${context}
        
        For each task, provide:
        - Title in ${language}
        - Description in ${language}
        - Priority: high, medium, or low
        - Category
        - Estimated duration in minutes
      `;

      const response = await this.generateText({
        prompt,
        language,
        maxTokens: 1500,
      });

      if (!response.success) {
        throw new Error(response.error || 'Task suggestion failed');
      }

      // Parse suggestions (in a real implementation, you'd use structured output)
      const suggestions: TaskSuggestion[] = [];
      const lines = response.content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Title:')) {
          suggestions.push({
            title: this.extractValue(lines, 'Title:', i) || '',
            description: this.extractValue(lines, 'Description:', i) || '',
            priority: this.extractValue(lines, 'Priority:', i) as TaskSuggestion['priority'] || 'medium',
            category: this.extractValue(lines, 'Category:', i) || 'general',
            estimatedDuration: parseInt(this.extractValue(lines, 'Duration:', i) || '30'),
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Task Suggestion Error:', error);
      return [];
    }
  }

  // Report Generation
  async generateReport(data: any, type: 'daily' | 'weekly' | 'monthly', language: string = 'ar-TN'): Promise<string> {
    try {
      const prompt = `
        Generate a ${type} productivity report in ${language} based on this data:
        ${JSON.stringify(data, null, 2)}
        
        Include:
        - Executive summary
        - Key metrics
        - Achievements
        - Areas for improvement
        - Recommendations
        - Next period goals
      `;

      const response = await this.generateText({
        prompt,
        language,
        maxTokens: 2000,
      });

      return response.success ? response.content : 'Report generation failed';
    } catch (error) {
      console.error('Report Generation Error:', error);
      return 'Report generation failed';
    }
  }

  // Derja Intent Analysis
  async analyzeDerjaIntent(command: string): Promise<string> {
    try {
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
        
        الأمر: ${command}
        
        ردّي بالاكشن فقط بدون شرح. مثال: open_calendar
      `;

      const response = await this.generateText({
        prompt,
        language: 'ar-TN',
        maxTokens: 50,
        temperature: 0.3,
      });

      if (!response.success) {
        throw new Error('Failed to analyze intent');
      }

      return response.content.trim().toLowerCase();
    } catch (error) {
      console.error('Derja Intent Analysis Error:', error);
      return 'unknown';
    }
  }

  // General Q&A - Answer any question
  async answerQuestion(question: string, language: string = 'en-US', context?: string): Promise<AIResponse> {
    try {
      const systemPrompt = `You are LUCA, an intelligent AI assistant that helps users with any questions they have.
You are knowledgeable, helpful, and provide clear, accurate answers.
When you don't know something, you admit it honestly.
You can help with:
- General knowledge questions
- Weather information (note: you don't have real-time data, explain this)
- Technical explanations
- Productivity advice
- Tunisia-specific information
- Language help (especially Arabic, French, and English)
- And much more!

${context ? `Context: ${context}\n\n` : ''}User question: ${question}`;

      return await this.generateText({
        prompt: systemPrompt,
        language,
        maxTokens: 2000,
        temperature: 0.7,
      });
    } catch (error) {
      console.error('Q&A Error:', error);
      return {
        content: 'Sorry, I encountered an error. Please try again.',
        tokens: 0,
        model: this.model,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Helper Methods
  private buildPrompt(request: AIRequest): string {
    let prompt = request.prompt;
    
    if (request.context) {
      prompt = `Context: ${request.context}\n\n${prompt}`;
    }
    
    if (request.language && request.language !== 'en-US') {
      prompt = `Please respond in ${request.language}.\n\n${prompt}`;
    }
    
    return prompt;
  }

  private extractValue(lines: string[], key: string, startIndex: number = 0): string | null {
    for (let i = startIndex; i < lines.length; i++) {
      if (lines[i].includes(key)) {
        return lines[i].split(key)[1]?.trim() || null;
      }
    }
    return null;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export type {
  AIRequest,
  AIResponse,
  VoiceCommand,
  VoiceResponse,
  EmailAnalysis,
  TaskSuggestion,
};
