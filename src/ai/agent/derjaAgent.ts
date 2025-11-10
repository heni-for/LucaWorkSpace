/**
 * LUCA AI Background Agent - Derja Voice Assistant
 * Stays active in the background to listen and execute voice commands
 */

import { aiService } from '@/lib/ai-service';

// Agent Intent Types
export type AgentIntent = 
  | 'open_calendar'
  | 'open_mail'
  | 'open_tasks'
  | 'open_notes'
  | 'open_team'
  | 'open_dashboard'
  | 'open_reports'
  | 'open_workspace'
  | 'open_documents'
  | 'open_meetings'
  | 'create_task'
  | 'create_email'
  | 'create_note'
  | 'show_emails'
  | 'show_tasks'
  | 'show_meetings'
  | 'summarize_emails'
  | 'summarize_tasks'
  | 'search'
  | 'unknown';

export interface DerjaCommand {
  transcript: string;
  intent: AgentIntent;
  confidence: number;
  language: string;
  context?: string;
}

export interface AgentResponse {
  success: boolean;
  action: string;
  feedback: string;
  error?: string;
}

export class DerjaAgent {
  private isListening: boolean = false;
  private recognition: any = null; // SpeechRecognition - browser only API
  private currentTranscript: string = '';
  private lastCommandTime: number = 0;
  private commandDebounceMs: number = 2000; // Prevent duplicate processing

  constructor() {
    // Initialize agent
    this.setup();
  }

  /**
   * Setup the background agent
   */
  private setup(): void {
    if (typeof window === 'undefined') return;

    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ar-TN'; // Tunisian Arabic
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      // Event handlers
      this.recognition.onresult = this.handleSpeechResult.bind(this);
      this.recognition.onerror = this.handleSpeechError.bind(this);
      this.recognition.onend = this.handleSpeechEnd.bind(this);

      console.log('🚀 LUCA AI Agent initialized');
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }

  /**
   * Start listening for voice commands
   */
  public startListening(): void {
    if (!this.recognition || this.isListening) {
      // Check if already listening to avoid InvalidStateError
      if (this.recognition) {
        try {
          const status = (this.recognition as any).state;
          if (status === 'listening' || status === 'continuous') {
            console.log('🎤 LUCA Agent already listening...');
            this.isListening = true;
          }
        } catch (e) {
          // Ignore state check errors
        }
      }
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('🎤 LUCA Agent is now listening...');
    } catch (error: any) {
      // Handle InvalidStateError gracefully
      if (error.name === 'InvalidStateError' || error.message?.includes('already started')) {
        console.log('🎤 LUCA Agent already started');
        this.isListening = true;
      } else {
        console.error('Failed to start listening:', error);
      }
    }
  }

  /**
   * Stop listening
   */
  public stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('🔇 LUCA Agent stopped listening');
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }

  /**
   * Toggle listening state
   */
  public toggleListening(): void {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Get listening status
   */
  public getListeningStatus(): boolean {
    return this.isListening;
  }

  /**
   * Handle speech recognition results
   */
  private async handleSpeechResult(event: any): Promise<void> { // SpeechRecognitionEvent - browser only
    const now = Date.now();
    
    // Debounce to prevent duplicate processing
    if (now - this.lastCommandTime < this.commandDebounceMs) {
      return;
    }

    // Get the most recent transcript
    const results = event.results;
    const transcript = results[results.length - 1][0].transcript.trim();

    // Only process if we have a meaningful transcript
    if (!transcript || transcript.length < 3) return;

    // Check if it's a wake word or direct command
    const lowerTranscript = transcript.toLowerCase();
    const isWakeWord = lowerTranscript.includes('يا لوكا') || lowerTranscript.includes('ya luca');
    
    if (!isWakeWord && !lowerTranscript.includes('ورّيني') && !lowerTranscript.includes('ائيني')) {
      return; // Not a command for LUCA
    }

    console.log('🎯 LUCA Command detected:', transcript);

    // Process the command
    this.currentTranscript = transcript;
    this.lastCommandTime = now;

    await this.processCommand(transcript);
  }

  /**
   * Handle speech recognition errors
   */
  private handleSpeechError(event: any): void { // SpeechRecognitionErrorEvent - browser only
    // Don't log "no-speech" errors - they're normal when not speaking
    if (event.error === 'no-speech') {
      // This is normal - just silence, no speech detected
      return;
    }
    
    // Handle different error types gracefully
    if (event.error === 'audio-capture') {
      console.warn('⚠️ LUCA: Microphone not available');
    } else if (event.error === 'network') {
      // Network errors are common - just warn, don't error
      console.warn('⚠️ LUCA: Speech recognition network unavailable (will retry automatically)');
      // Don't show alert for network errors - they're transient
    } else if (event.error === 'not-allowed') {
      console.warn('⚠️ LUCA: Microphone permission denied');
      // Only show alert for permission errors
      if (typeof window !== 'undefined') {
        alert('Please allow microphone access to use LUCA voice commands');
      }
    } else if (event.error === 'aborted') {
      // Aborted is normal when stopping manually
      console.log('🔇 LUCA: Speech recognition stopped');
    } else {
      // Log other errors as warnings instead of errors
      console.warn('⚠️ LUCA Speech recognition issue:', event.error);
    }
    
    // Don't restart on errors - the continuous mode will handle it automatically
    // or the user can manually restart
  }

  /**
   * Handle speech recognition end
   */
  private handleSpeechEnd(): void {
    if (this.isListening && this.recognition) {
      // Restart to continue listening
      setTimeout(() => {
        if (this.isListening && this.recognition) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('Failed to restart after end:', error);
          }
        }
      }, 100);
    }
  }

  /**
   * Process a voice command
   */
  public async processCommand(transcript: string): Promise<AgentResponse> {
    try {
      // Analyze intent using AI
      const intent = await this.analyzeDerjaIntent(transcript);

      console.log('🧠 Intent identified:', intent);

      // Execute the action
      const result = await this.executeAction(intent);

      return {
        success: true,
        action: intent,
        feedback: result.feedback,
      };
    } catch (error) {
      console.error('Failed to process command:', error);
      
      return {
        success: false,
        action: 'unknown',
        feedback: 'آسف، ما فمّتش نفهم. جرّب مرّة تانية.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze Derja intent using AI
   */
  private async analyzeDerjaIntent(command: string): Promise<AgentIntent> {
    try {
      // Call internal API to avoid exposing API keys on the client
      const res = await fetch('/api/ai/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (!res.ok) {
        throw new Error('Intent API request failed');
      }

      const data = await res.json();
      const intent = typeof data.intent === 'string' ? (data.intent as AgentIntent) : 'unknown';

      return this.parseIntent(intent);
    } catch (error) {
      console.error('Intent analysis error:', error);
      return 'unknown';
    }
  }

  /**
   * Parse AI response to extract intent
   */
  private parseIntent(response: string): AgentIntent {
    const lowerResponse = response.toLowerCase().trim();
    
    // Map response to intent
    const intentMap: Record<string, AgentIntent> = {
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

  /**
   * Execute the intent action
   */
  private async executeAction(intent: AgentIntent): Promise<{ feedback: string }> {
    // Dynamic import to avoid circular dependencies
    const { executeIntentAction } = await import('@/lib/agent-actions');

    const result = await executeIntentAction(intent);

    return {
      feedback: result.feedback || 'تمام ✅',
    };
  }

  /**
   * Speak in Derja
   */
  public speakDerja(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-TN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopListening();
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition = null;
    }
  }
}

// Export singleton instance
export const derjaAgent = new DerjaAgent();

