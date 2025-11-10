/**
 * LUCA Meeting Report Service
 * Records meetings and generates comprehensive Derja reports
 */

'use client';

export interface MeetingRecording {
  id: string;
  meetingId: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  participants: string[];
  transcript: MeetingTranscriptLine[];
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  decisions?: string[];
  nextSteps?: string[];
  advice?: string[];
  language: 'derja' | 'french' | 'english' | 'mixed';
}

export interface MeetingTranscriptLine {
  id: string;
  timestamp: Date;
  speaker: string;
  text: string;
  language: 'derja' | 'french' | 'english';
  sentiment?: 'positive' | 'neutral' | 'negative';
  importance?: 'high' | 'medium' | 'low';
}

export class MeetingReportService {
  private recording: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentTranscript: MeetingTranscriptLine[] = [];
  private meetingStartTime: Date | null = null;
  private isRecording = false;

  /**
   * Start recording a meeting
   */
  async startRecording(meetingId: string, title: string): Promise<void> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.meetingStartTime = new Date();
      this.audioChunks = [];
      this.currentTranscript = [];
      this.isRecording = true;

      // Create MediaRecorder with proper mimeType support
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/webm;codecs=opus'];
      const mimeType = mimeTypes.find(mt => MediaRecorder.isTypeSupported(mt)) || undefined;
      
      this.recording = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      this.recording.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.recording.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      this.recording.start(1000); // Collect data every second

      console.log('🎙️ Started recording meeting:', title);

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<Blob> {
    if (!this.recording) {
      throw new Error('No active recording');
    }

    this.isRecording = false;

    return new Promise((resolve) => {
      this.recording!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      this.recording!.stop();
    });
  }

  /**
   * Add a transcript line
   */
  addTranscriptLine(speaker: string, text: string, language: 'derja' | 'french' | 'english'): void {
    const line: MeetingTranscriptLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      speaker,
      text,
      language,
      sentiment: this.analyzeSentiment(text),
      importance: this.estimateImportance(text),
    };

    this.currentTranscript.push(line);
    
    // Log to console for debugging
    console.log(`[${line.language.toUpperCase()}] ${speaker}: ${text}`);
  }

  /**
   * Generate comprehensive meeting report
   */
  async generateReport(meetingId: string, title: string): Promise<MeetingRecording> {
    const audioBlob = await this.stopRecording();
    const duration = this.meetingStartTime ? (Date.now() - this.meetingStartTime.getTime()) / 1000 : 0;

    // Call AI service to analyze and generate report
    const report = await this.analyzeWithAI(title, this.currentTranscript, duration);

    const meetingRecording: MeetingRecording = {
      id: meetingId,
      meetingId,
      title,
      startTime: this.meetingStartTime || new Date(),
      endTime: new Date(),
      duration,
      participants: this.extractParticipants(),
      transcript: this.currentTranscript,
      summary: report.summary,
      keyPoints: report.keyPoints,
      actionItems: report.actionItems,
      decisions: report.decisions,
      nextSteps: report.nextSteps,
      advice: report.advice,
      language: report.language,
    };

    return meetingRecording;
  }

  /**
   * Analyze meeting with AI to generate report
   */
  private async analyzeWithAI(
    title: string,
    transcript: MeetingTranscriptLine[],
    duration: number
  ) {
    try {
      const transcriptText = transcript.map(line => 
        `[${line.language.toUpperCase()}] ${line.speaker}: ${line.text}`
      ).join('\n');

      const prompt = `
        أنا عاين لقاء بعنوان "${title}" بين Tunisian professionals.
        
        المحتوى:
        ${transcriptText}
        
        المدة: ${Math.round(duration / 60)} دقيقة
        
        اعمللي rapport كامل بالدرجة التونسية على:
        
        1. ملخص عام للاجتماع
        2. النقاط الرئيسية (اللي داروا فيه النقاش)
        3. القرارات اللي اتخذت
        4. Action items (الشغل اللي لازم يتم)
        5. Next steps (الخطوات الجاية)
        6. نصايح ومشورة للفريق
        
        عطني كلشي بالدرجة التونسية وبشكل واضح ومنظم.
      `;

      const response = await fetch('/api/ai/meeting-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, transcript, title, duration }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze meeting');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Fallback to local analysis
      return {
        summary: this.generateFallbackSummary(transcript),
        keyPoints: this.extractKeyPoints(transcript),
        actionItems: this.extractActionItems(transcript),
        decisions: [],
        nextSteps: [],
        advice: [],
        language: 'derja' as const,
      };
    }
  }

  /**
   * Generate fallback summary if AI fails
   */
  private generateFallbackSummary(transcript: MeetingTranscriptLine[]): string {
    const speakers = new Set(transcript.map(line => line.speaker));
    const topics = transcript.filter(line => line.importance === 'high').length;
    
    return `لقاء بين ${speakers.size} مشارك، ناقشوا حوالي ${Math.ceil(transcript.length / 10)} مواضيع مختلفة. 
    المحادثة كانت ${this.getAverageSentiment(transcript)}. 
    تم تسجيل ${transcript.length} سطر من النقاش.`;
  }

  /**
   * Extract key points from transcript
   */
  private extractKeyPoints(transcript: MeetingTranscriptLine[]): string[] {
    return transcript
      .filter(line => line.importance === 'high')
      .slice(0, 5)
      .map(line => `${line.speaker}: ${line.text}`);
  }

  /**
   * Extract action items from transcript
   */
  private extractActionItems(transcript: MeetingTranscriptLine[]): string[] {
    const keywords = ['خلي', 'قبل', 'نعمّل', 'نحقق', 'ننجز', 'كامل', 'نحاول'];
    return transcript
      .filter(line => 
        keywords.some(keyword => line.text.toLowerCase().includes(keyword))
      )
      .slice(0, 5)
      .map(line => `${line.speaker}: ${line.text}`);
  }

  /**
   * Estimate importance of a line
   */
  private estimateImportance(text: string): 'high' | 'medium' | 'low' {
    const highPriorityKeywords = ['مهم', 'ضروري', 'عاجل', 'قرار', 'ميزانية', 'deadline', 'urgence'];
    const mediumPriorityKeywords = ['ناقش', 'نشوف', 'نحاول', 'نخطط', 'اقتراح', 'suggestion'];
    
    const lowerText = text.toLowerCase();
    
    if (highPriorityKeywords.some(kw => lowerText.includes(kw))) {
      return 'high';
    }
    
    if (mediumPriorityKeywords.some(kw => lowerText.includes(kw))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['ممتاز', 'حلو', 'ماشي', 'تمام', 'راضي', 'excellent', 'bon', 'parfait'];
    const negativeWords = ['مشكلة', 'صعبة', 'معقدة', 'محرج', 'problème', 'difficile', 'embarrassant'];
    
    const lowerText = text.toLowerCase();
    
    if (positiveWords.some(word => lowerText.includes(word))) {
      return 'positive';
    }
    
    if (negativeWords.some(word => lowerText.includes(word))) {
      return 'negative';
    }
    
    return 'neutral';
  }

  /**
   * Extract participants
   */
  private extractParticipants(): string[] {
    return Array.from(new Set(this.currentTranscript.map(line => line.speaker)));
  }

  /**
   * Get average sentiment
   */
  private getAverageSentiment(transcript: MeetingTranscriptLine[]): string {
    const sentiments = transcript.map(line => line.sentiment);
    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;
    
    if (positive > negative) return 'إيجابية';
    if (negative > positive) return 'سلبية';
    return 'متوازنة';
  }

  /**
   * Get recording status
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get transcript
   */
  getTranscript(): MeetingTranscriptLine[] {
    return this.currentTranscript;
  }

  /**
   * Get duration
   */
  getDuration(): number {
    if (!this.meetingStartTime) return 0;
    return (Date.now() - this.meetingStartTime.getTime()) / 1000;
  }
}

// Export singleton instance
export const meetingReportService = new MeetingReportService();

