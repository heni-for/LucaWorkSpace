// AI Service for Real-time Meeting Features
export class AIMeetingService {
  private static instance: AIMeetingService;
  private transcriptionBuffer: string[] = [];
  private languageDetector: Map<string, number> = new Map();
  private sentimentAnalyzer: Map<string, 'positive' | 'negative' | 'neutral'> = new Map();
  private actionItemsExtractor: string[] = [];
  private meetingAssistant: Map<string, any> = new Map();

  static getInstance(): AIMeetingService {
    if (!AIMeetingService.instance) {
      AIMeetingService.instance = new AIMeetingService();
    }
    return AIMeetingService.instance;
  }

  // Real-time Transcription
  async processTranscription(audioData: string, language: string = 'auto'): Promise<{
    text: string;
    confidence: number;
    detectedLanguage: string;
    timestamp: string;
  }> {
    try {
      // Simulate real-time transcription processing
      const detectedLanguage = await this.detectLanguage(audioData);
      const transcription = await this.transcribeAudio(audioData, detectedLanguage);
      
      this.transcriptionBuffer.push(transcription.text);
      
      return {
        text: transcription.text,
        confidence: transcription.confidence,
        detectedLanguage: detectedLanguage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to process transcription');
    }
  }

  // Multi-language Translation
  async translateText(text: string, fromLang: string, toLang: string): Promise<{
    translatedText: string;
    confidence: number;
    sourceLanguage: string;
    targetLanguage: string;
  }> {
    try {
      const translation = await this.performTranslation(text, fromLang, toLang);
      
      return {
        translatedText: translation.text,
        confidence: translation.confidence,
        sourceLanguage: fromLang,
        targetLanguage: toLang
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }

  // AI Meeting Assistant
  async processAssistantCommand(command: string, context: any): Promise<{
    response: string;
    action?: string;
    confidence: number;
  }> {
    try {
      const assistantResponse = await this.generateAssistantResponse(command, context);
      
      return {
        response: assistantResponse.text,
        action: assistantResponse.action,
        confidence: assistantResponse.confidence
      };
    } catch (error) {
      console.error('Assistant error:', error);
      throw new Error('Failed to process assistant command');
    }
  }

  // Sentiment Analysis
  async analyzeSentiment(text: string, speaker: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
    speaker: string;
  }> {
    try {
      const sentiment = await this.performSentimentAnalysis(text);
      this.sentimentAnalyzer.set(speaker, sentiment.sentiment);
      
      return {
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        emotions: sentiment.emotions,
        speaker: speaker
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  // Action Items Detection
  async detectActionItems(text: string, speaker: string): Promise<{
    actionItems: Array<{
      text: string;
      assignee: string;
      dueDate?: string;
      priority: 'high' | 'medium' | 'low';
      confidence: number;
    }>;
    speaker: string;
  }> {
    try {
      const actionItems = await this.extractActionItems(text, speaker);
      
      // Add to global action items list
      actionItems.forEach(item => {
        this.actionItemsExtractor.push(item.text);
      });
      
      return {
        actionItems: actionItems,
        speaker: speaker
      };
    } catch (error) {
      console.error('Action items detection error:', error);
      throw new Error('Failed to detect action items');
    }
  }

  // Combined AI Processing
  async processMeetingInput(input: {
    audioData?: string;
    text?: string;
    speaker: string;
    language?: string;
  }): Promise<{
    transcription?: any;
    translation?: any;
    sentiment?: any;
    actionItems?: any;
    assistantResponse?: any;
  }> {
    const results: any = {};

    try {
      // Process transcription if audio data provided
      if (input.audioData) {
        results.transcription = await this.processTranscription(input.audioData, input.language);
      }

      // Process text if provided
      if (input.text) {
        // Analyze sentiment
        results.sentiment = await this.analyzeSentiment(input.text, input.speaker);
        
        // Detect action items
        results.actionItems = await this.detectActionItems(input.text, input.speaker);
        
        // Translate if needed
        if (input.language && input.language !== 'en') {
          results.translation = await this.translateText(input.text, input.language, 'en');
        }
      }

      return results;
    } catch (error) {
      console.error('Combined processing error:', error);
      throw new Error('Failed to process meeting input');
    }
  }

  // Private helper methods
  private async detectLanguage(text: string): Promise<string> {
    // Simulate language detection
    const derjaKeywords = ['نحنا', 'ديما', 'كيفاش', 'شكون', 'وين', 'اش', 'متى', 'علاش'];
    const frenchKeywords = ['nous', 'toujours', 'comment', 'qui', 'où', 'quoi', 'quand', 'pourquoi'];
    const englishKeywords = ['we', 'always', 'how', 'who', 'where', 'what', 'when', 'why'];

    let derjaScore = 0;
    let frenchScore = 0;
    let englishScore = 0;

    derjaKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) derjaScore++;
    });

    frenchKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) frenchScore++;
    });

    englishKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) englishScore++;
    });

    if (derjaScore > frenchScore && derjaScore > englishScore) return 'ar-TN';
    if (frenchScore > englishScore) return 'fr-FR';
    return 'en-US';
  }

  private async transcribeAudio(audioData: string, language: string): Promise<{
    text: string;
    confidence: number;
  }> {
    // Simulate transcription based on language
    const mockTranscriptions = {
      'ar-TN': [
        'نحنا نحتاجو نزيدو الفريق ديما',
        'كيفاش نقدرو نطورو المنتج',
        'شكون المسؤول على المشروع',
        'وين نقدرو نلقاو المطورين',
        'اش رايك في الفكرة دي'
      ],
      'fr-FR': [
        'Nous devons recruter plus de développeurs',
        'Comment pouvons-nous améliorer le produit',
        'Qui est responsable du projet',
        'Où pouvons-nous trouver des développeurs',
        'Que pensez-vous de cette idée'
      ],
      'en-US': [
        'We need to hire more developers',
        'How can we improve the product',
        'Who is responsible for the project',
        'Where can we find developers',
        'What do you think about this idea'
      ]
    };

    const texts = mockTranscriptions[language as keyof typeof mockTranscriptions] || mockTranscriptions['en-US'];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    
    return {
      text: randomText,
      confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
    };
  }

  private async performTranslation(text: string, fromLang: string, toLang: string): Promise<{
    text: string;
    confidence: number;
  }> {
    // Simulate translation
    const translations: Record<string, Record<string, string>> = {
      'ar-TN': {
        'en-US': 'We need to expand the team, especially in the technical department',
        'fr-FR': 'Nous devons élargir l\'équipe, surtout dans le département technique'
      },
      'fr-FR': {
        'en-US': 'I agree with this proposal. We need to recruit at least 3 developers',
        'ar-TN': 'أوافق على هذا الاقتراح. نحتاج لتوظيف 3 مطورين على الأقل'
      },
      'en-US': {
        'ar-TN': 'ما رأيك في هذا الاقتراح؟',
        'fr-FR': 'Que pensez-vous de cette proposition?'
      }
    };

    const translatedText = translations[fromLang]?.[toLang] || text;
    
    return {
      text: translatedText,
      confidence: 0.88 + Math.random() * 0.08 // 88-96% confidence
    };
  }

  private async generateAssistantResponse(command: string, context: any): Promise<{
    text: string;
    action?: string;
    confidence: number;
  }> {
    // Simulate AI assistant responses
    const responses = [
      {
        text: 'I understand. Let me help you with that.',
        action: 'help',
        confidence: 0.92
      },
      {
        text: 'That\'s a great point. I\'ll note that down.',
        action: 'note',
        confidence: 0.89
      },
      {
        text: 'I can help you schedule a follow-up meeting.',
        action: 'schedule',
        confidence: 0.94
      },
      {
        text: 'Let me create an action item for that.',
        action: 'action_item',
        confidence: 0.87
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: randomResponse.text,
      action: randomResponse.action,
      confidence: randomResponse.confidence
    };
  }

  private async performSentimentAnalysis(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
  }> {
    // Simulate sentiment analysis
    const positiveWords = ['great', 'excellent', 'good', 'amazing', 'fantastic', 'perfect', 'wonderful', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'frustrating', 'annoying', 'problem'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });

    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;
    let emotions: string[] = [];

    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = 0.85 + Math.random() * 0.1;
      emotions = ['happy', 'excited', 'satisfied'];
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = 0.82 + Math.random() * 0.1;
      emotions = ['frustrated', 'concerned', 'disappointed'];
    } else {
      sentiment = 'neutral';
      confidence = 0.78 + Math.random() * 0.1;
      emotions = ['calm', 'focused', 'neutral'];
    }

    return { sentiment, confidence, emotions };
  }

  private async extractActionItems(text: string, speaker: string): Promise<Array<{
    text: string;
    assignee: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
  }>> {
    // Simulate action item extraction
    const actionPatterns = [
      /(?:I will|I'll|I need to|I should|I must)\s+(.+)/gi,
      /(?:we need to|we should|we must|we will)\s+(.+)/gi,
      /(?:please|can you|could you)\s+(.+)/gi,
      /(?:let's|let us)\s+(.+)/gi
    ];

    const actionItems: Array<{
      text: string;
      assignee: string;
      dueDate?: string;
      priority: 'high' | 'medium' | 'low';
      confidence: number;
    }> = [];

    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const actionText = match.replace(pattern, '$1').trim();
          if (actionText.length > 10) {
            actionItems.push({
              text: actionText,
              assignee: speaker,
              dueDate: this.generateDueDate(),
              priority: this.determinePriority(actionText),
              confidence: 0.80 + Math.random() * 0.15
            });
          }
        });
      }
    });

    return actionItems;
  }

  private generateDueDate(): string {
    const today = new Date();
    const days = Math.floor(Math.random() * 14) + 1; // 1-14 days
    const dueDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  }

  private determinePriority(text: string): 'high' | 'medium' | 'low' {
    const highPriorityWords = ['urgent', 'asap', 'immediately', 'critical', 'important', 'priority'];
    const lowPriorityWords = ['eventually', 'sometime', 'when possible', 'if time permits'];
    
    const lowerText = text.toLowerCase();
    
    if (highPriorityWords.some(word => lowerText.includes(word))) {
      return 'high';
    }
    
    if (lowPriorityWords.some(word => lowerText.includes(word))) {
      return 'low';
    }
    
    return 'medium';
  }

  // Get current state
  getTranscriptionBuffer(): string[] {
    return this.transcriptionBuffer;
  }

  getActionItems(): string[] {
    return this.actionItemsExtractor;
  }

  getSentimentAnalysis(): Map<string, 'positive' | 'negative' | 'neutral'> {
    return this.sentimentAnalyzer;
  }

  clearBuffer(): void {
    this.transcriptionBuffer = [];
    this.actionItemsExtractor = [];
    this.sentimentAnalyzer.clear();
    this.meetingAssistant.clear();
  }
}
