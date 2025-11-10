/**
 * LUCA Background Voice Assistant
 * Always listening for "Ahla Beleh" wake word
 * Understands and speaks in Tunisian Derja
 */

import { cloudTTS } from './cloud-tts';

export type LucaCommand = {
  intent: string;
  action: string;
  parameters?: Record<string, any>;
  response: string;
};

export type LucaMode = 'idle' | 'email' | 'meeting' | 'note' | 'task' | 'search';

export class LucaVoiceAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private onWakeWordCallback?: () => void;
  private onCommandCallback?: (command: string) => void;
  private onResponseCallback?: (response: string) => void;
  private onStatusChangeCallback?: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  private lastWakeWordTime: number = 0;
  private wakeWordCooldownMs: number = 1500; // Reduced to 1.5s for faster response
  private isBusy: boolean = false; // Prevent overlapping commands
  private voicesLoaded: boolean = false;
  private currentMode: LucaMode = 'idle'; // Track what mode LUCA is in
  private continuousMode: boolean = true; // Always keep listening
  
  // 🎯 ChatGPT-style streaming variables
  private silenceTimer: any = null;
  private lastSpeechTime: number = 0;
  private silenceThreshold: number = 1200; // 1.2s silence = end of phrase
  private currentInterimText: string = '';
  private isProcessingCommand: boolean = false;

  constructor() {
    this.setupRecognition();
    this.loadVoices();
  }

  private loadVoices(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Function to check and log voices
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !this.voicesLoaded) {
        this.voicesLoaded = true;
        console.log('✅ Voices loaded:', voices.length);
        console.log('🎙️ Arabic voices:', voices.filter(v => v.lang.startsWith('ar')).map(v => v.name));
      }
      return voices;
    };

    // Try loading immediately
    checkVoices();

    // Also listen for voices changed event
    window.speechSynthesis.onvoiceschanged = () => {
      checkVoices();
    };

    // Force trigger voice loading
    setTimeout(() => {
      window.speechSynthesis.getVoices();
    }, 100);
  }

  private setupRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      
      // 🎯 PROFESSIONAL SETTINGS for BEST accuracy
      this.recognition.lang = 'ar-SA'; // Standard Arabic (better recognition than ar-TN)
      this.recognition.continuous = true; // 🔁 CONTINUOUS MODE
      this.recognition.interimResults = true; // Show real-time results
      this.recognition.maxAlternatives = 5; // More alternatives for better accuracy
      
      // ✨ BOOST ACCURACY
      if ('grammars' in this.recognition) {
        // Add grammar hints for better recognition
        console.log('✅ Grammar support available');
      }

      this.recognition.onresult = this.handleSpeechResult.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      
      // 🎯 Professional audio event tracking (ChatGPT-style)
      this.recognition.onaudiostart = () => {
        console.log('🎤 Audio input started');
        this.lastSpeechTime = Date.now();
      };
      
      this.recognition.onaudioend = () => {
        console.log('🎤 Audio input ended');
      };
      
      this.recognition.onsoundstart = () => {
        console.log('🔊 Sound detected');
        this.lastSpeechTime = Date.now();
        this.clearSilenceTimer();
      };
      
      this.recognition.onsoundend = () => {
        console.log('🔇 Sound ended - starting silence detection');
        this.startSilenceTimer();
      };
      
      this.recognition.onspeechstart = () => {
        console.log('🗣️ Speech detected');
        this.lastSpeechTime = Date.now();
        this.clearSilenceTimer();
      };
      
      this.recognition.onspeechend = () => {
        console.log('🗣️ Speech ended - waiting for finalization');
      };

      console.log('🚀 LUCA Voice Assistant initialized - PROFESSIONAL MODE');
      console.log('🎯 Language: ar-SA (Standard Arabic)');
      console.log('🎯 Max alternatives: 5');
      console.log('🎯 Continuous: true');
    } catch (error) {
      console.error('Failed to setup speech recognition:', error);
    }
  }

  // 🔇 Silence detection timer (ChatGPT-style)
  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    
    // After silence threshold, we know user finished speaking
    this.silenceTimer = setTimeout(() => {
      const timeSinceSpeech = Date.now() - this.lastSpeechTime;
      console.log(`🔇 Silence detected (${timeSinceSpeech}ms) - user likely finished speaking`);
      
      // Could trigger processing here if needed
      if (this.currentInterimText && !this.isProcessingCommand) {
        console.log('💡 Could fast-track processing here for better UX');
      }
    }, this.silenceThreshold);
  }

  private async handleSpeechResult(event: any) {
    try {
      const results = event.results[event.results.length - 1];
      const isFinal = results.isFinal;
      
      // 🎯 GET BEST ALTERNATIVE with highest confidence (analyze all 5 alternatives)
      let bestTranscript = '';
      let bestConfidence = 0;
      let allAlternatives: string[] = [];
      
      for (let i = 0; i < results.length; i++) {
        const alternative = results[i];
        const confidence = alternative.confidence || 0;
        allAlternatives.push(`${alternative.transcript} (${Math.round(confidence * 100)}%)`);
        
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestTranscript = alternative.transcript;
        }
      }
      
      // Use best alternative or fallback to first one
      const transcript = (bestTranscript || results[0].transcript).toLowerCase().trim();
      const confidencePercent = Math.round(bestConfidence * 100);
      
      // Update interim text for silence detection
      if (!isFinal) {
        this.currentInterimText = transcript;
        this.lastSpeechTime = Date.now();
      }
      
      // Always log what we hear with confidence + alternatives
      if (isFinal && allAlternatives.length > 1) {
        console.log(`🎤 LUCA HEARD (FINAL) [${confidencePercent}% confidence]:`, `"${transcript}"`);
        console.log(`📋 All ${allAlternatives.length} alternatives:`, allAlternatives.join(' | '));
      } else {
        console.log(`🎤 LUCA HEARD (${isFinal ? 'FINAL' : 'interim'}) [${confidencePercent}% confidence]:`, `"${transcript}"`);
      }
      
      // Only process FINAL results to avoid partial matches
      if (!isFinal) {
        console.log('⏭️ Skipping interim result, waiting for final...');
        return;
      }
      
      // Clear silence timer on final result
      this.clearSilenceTimer();
      this.currentInterimText = '';
      
      // ⚠️ Low confidence warning with alternatives
      if (isFinal && bestConfidence < 0.7) {
        console.warn(`⚠️ Low confidence (${confidencePercent}%) - may be inaccurate`);
        if (allAlternatives.length > 1) {
          console.log(`💡 Consider these alternatives:`, allAlternatives.slice(0, 3));
        }
      }
      
      // Update last command for UI
      if (this.onCommandCallback) {
        this.onCommandCallback(transcript);
      }

      // Check for wake words (including pronunciation variations)
      const wakeWords = [
        'ahla beleh', 'ahla balah', 'ahla blek', 'ahla belek',
        'luca', 'louca', 'luka', 'lucas', 'luke',
        'ya luca', 'يا لوكا', 'لوكا', 'لوكة', 'لوك', 'لوكه',
        'hey luca', 'ok luca', 'yo luca'
      ];

      const hasWakeWord = wakeWords.some(wake => transcript.includes(wake));

      if (hasWakeWord) {
        // Check cooldown to prevent rapid re-triggering
        const now = Date.now();
        if (now - this.lastWakeWordTime < this.wakeWordCooldownMs) {
          console.log('⏳ Cooldown active, ignoring duplicate wake word');
          return;
        }
        
        // Check if already processing
        if (this.isBusy) {
          console.log('⏳ LUCA is busy, ignoring...');
          return;
        }
        
        this.lastWakeWordTime = now;
        this.isBusy = true;
        
        console.log('✅✅✅ WAKE WORD DETECTED! ✅✅✅');
        console.log('🔊 LUCA will now respond...');
        
        if (this.onWakeWordCallback) {
          this.onWakeWordCallback();
        }

        // Extract command (everything after wake word)
        let command = '';
        
        // Find which wake word was used
        let usedWakeWord = '';
        for (const wake of wakeWords) {
          if (transcript.includes(wake)) {
            usedWakeWord = wake;
            break;
          }
        }
        
        if (usedWakeWord) {
          // Find the position of the wake word
          const wakeIndex = transcript.indexOf(usedWakeWord);
          const afterWake = transcript.substring(wakeIndex + usedWakeWord.length).trim();
          command = afterWake;
          
          console.log('📍 Wake word used:', usedWakeWord);
          console.log('📋 Command extracted:', command || '(none)');
        }

        try {
          // Choose response based on wake word used
          let response = 'أني نسمع فيك'; // Default: "ani nasma3 fyk" - I'm listening to you
          
          // If they said "ahla" in any form, respond with "ahla winek"
          if (transcript.includes('ahla') || transcript.includes('أهلا')) {
            response = 'أهلا وينك'; // "ahla winek" - Hello, how are you
            console.log('👋 Detected "ahla" greeting, responding with "ahla winek"');
          }
          
          console.log('🗣️ Speaking wake word response:', response);
          await this.speak(response);
          
          if (command) {
            console.log('📋 Command extracted:', command);
            // Wait a bit before processing to let wake response finish
            await new Promise(resolve => setTimeout(resolve, 500));
            // Process the command
            await this.processCommand(command);
          } else {
            console.log('ℹ️ No command after wake word - just greeting');
          }
        } finally {
          this.isBusy = false;
        }
      } else {
        console.log('ℹ️ Not a wake word, ignoring...');
      }
    } catch (error) {
      console.error('❌ Error handling speech:', error);
    }
  }

  private handleError(event: any) {
    const errorType = event.error;
    
    switch (errorType) {
      case 'no-speech':
        console.log('🔇 No speech detected (silence)');
        break;
      case 'audio-capture':
        console.error('❌ MICROPHONE ERROR: No microphone found or not working');
        alert('🎤 Microphone error! Please check your microphone connection.');
        break;
      case 'not-allowed':
        console.error('❌ PERMISSION DENIED: Microphone access blocked');
        alert('🎤 Please allow microphone access in your browser settings!');
        break;
      case 'network':
        console.warn('⚠️ Network error - speech recognition requires internet');
        break;
      case 'aborted':
        console.log('🛑 Recognition aborted');
        break;
      case 'bad-grammar':
        console.error('❌ Grammar error in speech recognition');
        break;
      default:
        console.warn('⚠️ LUCA speech error:', errorType);
    }
  }

  private handleEnd() {
    // 🔁 Auto-restart to keep listening (CONTINUOUS MODE - ChatGPT style)
    if (this.isListening && this.continuousMode) {
      console.log('🔁 Recognition ended, restarting immediately (ChatGPT-style)...');
      
      // Restart IMMEDIATELY (no delay) for seamless experience
      setTimeout(() => {
        if (this.recognition && this.isListening) {
          try {
            this.recognition.start();
            console.log('✅ Recognition restarted - ready for next command!');
          } catch (error) {
            console.log('ℹ️ Recognition already running');
          }
        }
      }, 50); // Minimal delay (50ms) for instant restart
    } else {
      console.log('🛑 Recognition ended, not restarting');
    }
  }

  // 🎯 Main command processing with continuous listening
  // 🎯 ChatGPT-style command processing with streaming feel
  public async processCommand(command: string): Promise<void> {
    // Prevent overlapping processing
    if (this.isProcessingCommand) {
      console.log('⏳ Already processing a command, please wait...');
      return;
    }

    this.isProcessingCommand = true;
    const processingStartTime = Date.now();
    
    console.log('═══════════════════════════════════════════');
    console.log('🧠 Processing command:', command);
    console.log('🎭 Current mode:', this.currentMode);
    console.log('═══════════════════════════════════════════');
    
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('processing');
    }

    try {
      await this.analyzeAndExecuteCommand(command);
      
      const processingTime = Date.now() - processingStartTime;
      console.log(`⚡ Command processed in ${processingTime}ms`);
    } catch (error) {
      console.error('❌ Command processing error:', error);
      console.log('🗣️ Speaking fallback message...');
      await this.speak('معليش، ما فهمتش. عاود من فضلك.'); // Sorry, didn't understand
    } finally {
      this.isProcessingCommand = false;
      
      // 🔁 Keep listening (continuous mode) - ChatGPT style
      console.log('🔁 Continuing to listen for more commands...');
      console.log('═══════════════════════════════════════════');
      
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('listening');
      }
    }
  }

  // 🧩 AI-POWERED INTENT ANALYSIS - Let AI figure out what user wants!
  private async analyzeAndExecuteCommand(text: string): Promise<void> {
    const lowerCmd = text.toLowerCase();
    let response = '';
    let action = 'unknown';
    
    // ⚡ DIRECT MATCHING for simple common commands (FAST - no AI needed)
    
    // 🛑 STOP
    if (lowerCmd.includes('stop') || lowerCmd.includes('خلاص') || lowerCmd.includes('khallas') || lowerCmd.includes('وقف')) {
      response = 'باي باي، نلقاك قريب!';
      action = 'stop_listening';
      console.log('🛑 STOP - direct match');
      await this.speak(response);
      this.continuousMode = false;
      this.stop();
      return;
    }
    
    // 🕐 TIME - Direct (most common)
    else if (lowerCmd.includes('قداش') || lowerCmd.includes('وقت') || lowerCmd.includes('ساعة') || lowerCmd.includes('time') || lowerCmd.includes('heure') || lowerCmd.includes('clock')) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      response = `الوقت تو ${hours}:${minutes.toString().padStart(2, '0')}`;
      action = 'tell_time';
      console.log('⏰ TIME - direct match');
    }
    
    // 📧 EMAIL - Direct keyword check
    else if (lowerCmd.includes('ايميل') || lowerCmd.includes('إيميل') || lowerCmd.includes('ميل') || lowerCmd.includes('بريد') || lowerCmd.includes('mail') || lowerCmd.includes('email') || lowerCmd.includes('gmail')) {
      response = 'حاضر، نحلّك الإيميلات تو.';
      action = 'open_mail';
      console.log('📧 EMAIL - direct match');
    }
    
    // 📊 DASHBOARD - Direct keyword check
    else if (lowerCmd.includes('داشبورد') || lowerCmd.includes('ديسبورد') || lowerCmd.includes('داش') || lowerCmd.includes('dashboard') || lowerCmd.includes('dash') || lowerCmd.includes('لوحة') || lowerCmd.includes('home')) {
      response = 'حاضر، نحلّك dashboard تو.';
      action = 'open_dashboard';
      console.log('📊 DASHBOARD - direct match');
    }
    
    // 📅 CALENDAR - Direct keyword check
    else if (lowerCmd.includes('كالندري') || lowerCmd.includes('كالند') || lowerCmd.includes('calendrier') || lowerCmd.includes('calendar') || lowerCmd.includes('agenda') || lowerCmd.includes('موعد') || lowerCmd.includes('تقويم')) {
      response = 'حاضر، نورّيك الكالندري.';
      action = 'open_calendar';
      console.log('📅 CALENDAR - direct match');
    }
    
    // ✅ TASKS - Direct keyword check
    else if (lowerCmd.includes('تسك') || lowerCmd.includes('مهام') || lowerCmd.includes('مهمة') || lowerCmd.includes('task') || lowerCmd.includes('todo') || lowerCmd.includes('tache')) {
      response = 'نورّيك التسكات.';
      action = 'open_tasks';
      console.log('✅ TASKS - direct match');
    }
    
    // 📝 NOTES - Direct keyword check  
    else if (lowerCmd.includes('نوت') || lowerCmd.includes('ملاحظ') || lowerCmd.includes('مذكر') || lowerCmd.includes('note')) {
      response = 'حاضر، نحلّك notes.';
      action = 'open_notes';
      console.log('📝 NOTES - direct match');
    }
    
    // 📚 EDUCATION - Direct keyword check
    else if (lowerCmd.includes('دراسة') || lowerCmd.includes('تعليم') || lowerCmd.includes('درس') || lowerCmd.includes('education') || lowerCmd.includes('éducation') || lowerCmd.includes('cours')) {
      response = 'حاضر، نحلّك éducation تو.';
      action = 'open_education';
      console.log('📚 EDUCATION - direct match');
    }
    
    // 👥 MEETINGS - Direct keyword check
    else if (lowerCmd.includes('اجتماع') || lowerCmd.includes('ميتينغ') || lowerCmd.includes('لقاء') || lowerCmd.includes('meeting') || lowerCmd.includes('réunion')) {
      response = 'نحلّك صفحة الاجتماعات.';
      action = 'open_meetings';
      console.log('👥 MEETINGS - direct match');
    }
    
    // 👥 TEAM - Direct keyword check
    else if (lowerCmd.includes('فريق') || lowerCmd.includes('زملاء') || lowerCmd.includes('team') || lowerCmd.includes('équipe')) {
      response = 'نحلّك صفحة الفريق.';
      action = 'open_team';
      console.log('👥 TEAM - direct match');
    }
    
    // 📁 PROJECTS - Direct keyword check
    else if (lowerCmd.includes('مشروع') || lowerCmd.includes('مشاريع') || lowerCmd.includes('بروجيه') || lowerCmd.includes('project')) {
      response = 'نحلّك المشاريع.';
      action = 'open_projects';
      console.log('📁 PROJECTS - direct match');
    }
    
    // ❓ HELP - Direct
    else if (lowerCmd.includes('help') || lowerCmd.includes('aide') || lowerCmd.includes('مساعدة') || lowerCmd.includes('عاوني')) {
      response = 'نجم نحلّك: email، dashboard، calendar، tasks، notes، education. قلّي شنو تحب.';
      action = 'help';
      console.log('❓ HELP - direct match');
    }
    
    // 🤖 USE AI ONLY for complex/ambiguous commands or questions
    else {
      console.log('🤔 No direct match - using AI for complex analysis...');
      
      try {
        // Call AI Intent Analyzer
        const apiResponse = await fetch('/api/assistant/intent-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: text }),
        });

        if (apiResponse.ok) {
          const intent = await apiResponse.json();
          console.log('✅ AI Intent Result:', JSON.stringify(intent, null, 2));
          
          action = intent.action || 'unknown';
          response = intent.arabic_response || 'تمام!';
          
          // Fix confidence if it's not a number
          let confidenceValue = intent.confidence;
          if (typeof confidenceValue !== 'number') {
            confidenceValue = 0.85; // Default
          }
          
          const confidence = Math.round(confidenceValue * 100);
          console.log(`🎯 AI Confidence: ${confidence}%`);
          
          if (confidence < 70 && confidence > 0) {
            console.warn(`⚠️ Low AI confidence (${confidence}%) - LUCA might misunderstand`);
            // Add a confirmation in response if low confidence
            if (confidence < 50) {
              response = `${response} (فهمتش مليح؟)`; // Did I understand correctly?
            }
          }
          
          // Special handling for questions vs commands
          if (action === 'unknown') {
            // Try AI Chat for general questions
            console.log('🤔 AI says unknown, trying Q&A...');
            const chatResponse = await fetch('/api/assistant/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                question: text,
                language: 'ar-TN'
              }),
            });

            if (chatResponse.ok) {
              const data = await chatResponse.json();
              response = data.answer || 'معليش، ما فهمتش.';
              action = 'ai_answer';
            } else {
              response = 'معليش، ما فهمتش. قلّي "help" باش نورّيك الأوامر.';
            }
          }
        } else {
          console.error('❌ AI Intent API failed');
          response = 'معليش، صار مشكل. عاود من فضلك.';
        }
      } catch (error) {
        console.error('❌ AI Intent analysis error:', error);
        response = 'معليش، صار مشكل. عاود من فضلك.';
      }
    }

    // Execute the action
    if (action !== 'unknown') {
      console.log('🔧 Executing action:', action);
      await this.executeAction(action);
    }

    // Speak the response
    console.log('💬 LUCA will say:', response);
    await this.speak(response);
    
    if (this.onResponseCallback) {
      this.onResponseCallback(response);
    }

    // 🔁 Continue listening
    console.log('👂 LUCA is still listening for your next command...');
  }

  // 🎭 Set LUCA's mode
  private setMode(mode: LucaMode): void {
    this.currentMode = mode;
    console.log('🎭 LUCA Mode changed to:', mode);
  }

  // 📍 Get current mode
  public getCurrentMode(): LucaMode {
    return this.currentMode;
  }

  private async executeAction(action: string, parameters?: Record<string, any>): Promise<void> {
    console.log('🔧 Executing action:', action, parameters);

    switch (action) {
      case 'tell_time':
        console.log('⏰ Telling time');
        break;
      
      case 'stop_listening':
        console.log('🛑 Stopping LUCA by user request');
        break;
        
      case 'open_mail':
        if (typeof window !== 'undefined') {
          window.location.href = '/mail';
        }
        break;
      
      case 'open_calendar':
        if (typeof window !== 'undefined') {
          window.location.href = '/calendar';
        }
        break;
      
      case 'open_tasks':
        if (typeof window !== 'undefined') {
          window.location.href = '/tasks';
        }
        break;
      
      case 'open_notes':
        if (typeof window !== 'undefined') {
          window.location.href = '/notes';
        }
        break;
      
      case 'open_dashboard':
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        break;
      
      case 'open_education':
        if (typeof window !== 'undefined') {
          window.location.href = '/education';
        }
        break;
      
      case 'open_memory':
        if (typeof window !== 'undefined') {
          window.location.href = '/memory';
        }
        break;
      
      case 'open_meetings':
        if (typeof window !== 'undefined') {
          window.location.href = '/meetings';
        }
        break;
      
      case 'open_team':
        if (typeof window !== 'undefined') {
          window.location.href = '/team';
        }
        break;
      
      case 'open_projects':
        if (typeof window !== 'undefined') {
          window.location.href = '/projects';
        }
        break;
      
      case 'email_compose_mode':
        console.log('📧 Switching to email composition mode');
        // Stay in email mode, waiting for dictation
        break;
      
      case 'email_dictation':
        console.log('📝 Capturing email text');
        // Here you would capture and store the dictated text
        break;
      
      case 'search_mode':
        console.log('🔍 Switching to search mode');
        break;
      
      case 'perform_search':
        console.log('🔎 Performing search');
        // Trigger search functionality
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('luca:open-search'));
        }
        break;
      
      case 'help':
        console.log('❓ Showing help');
        break;
      
      case 'ai_answer':
        console.log('🤖 AI answered a question');
        break;
      
      default:
        console.warn('Unknown action:', action);
    }
  }

  public async speak(text: string): Promise<void> {
    console.log('🎯 speak() called with text:', text);
    console.log('🎙️ Current TTS Provider:', cloudTTS.getCurrentProvider());
    
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback('speaking');
    }

    try {
      // Use Cloud TTS Service (supports Azure Tunisian voice, ElevenLabs, or Browser fallback)
      console.log('🌐 Using Cloud TTS...');
      await cloudTTS.speak(text, 'ar-TN');
      console.log('✅ speak() completed successfully');
    } catch (error) {
      console.error('❌ Speech error in speak():', error);
      // Final fallback to browser TTS
      console.log('🔄 Final fallback to browser TTS');
      await this.speakWithBrowserTTS(text);
    } finally {
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('listening');
      }
    }
  }

  private async speakWithEdgeTTS(text: string): Promise<void> {
    // Call Edge TTS API
    const response = await fetch('/api/tts/edge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: 'ar-TN-HediaNeural', // Tunisian female voice
      }),
    });

    if (!response.ok) {
      throw new Error('Edge TTS failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.play();
    });
  }

  private speakWithBrowserTTS(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.error('❌ Speech synthesis not available');
        resolve();
        return;
      }

      console.log('🗣️ LUCA is speaking:', text);
      
      // Get voices and wait if not loaded
      let voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        console.warn('⏳ Voices not loaded yet, waiting...');
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          console.log('✅ Voices loaded:', voices.length);
          this.speakWithBrowserTTS(text).then(resolve); // Retry
        };
        
        // Trigger voice loading
        window.speechSynthesis.getVoices();
        
        // Timeout fallback
        setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) {
            console.error('❌ Voices still not loaded after wait, speaking anyway...');
          }
        }, 1000);
        
        return;
      }

      console.log('🎙️ Available voices:', voices.length);
      console.log('📋 Voice list:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
      
      // Create the utterance object FIRST
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find and set voice - prioritize voices that actually work
      const arabicVoice = voices.find(v => 
        v.lang.startsWith('ar') || 
        v.lang === 'ar-TN' ||
        v.lang === 'ar-SA' ||
        v.lang === 'ar-EG'
      );
      
      if (arabicVoice) {
        console.log('✅ Using Arabic voice:', arabicVoice.name, arabicVoice.lang);
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
      } else {
        // FORCE use first available voice (guaranteed to work)
        console.warn('⚠️ No Arabic voice found, using FIRST AVAILABLE voice to speak Arabic text');
        const firstVoice = voices[0];
        if (firstVoice) {
          console.log('🎙️ Forcing voice:', firstVoice.name, firstVoice.lang);
          utterance.voice = firstVoice; // This is the KEY fix!
          utterance.lang = firstVoice.lang; // Use the voice's native language
        } else {
          utterance.lang = 'en-US'; // Absolute fallback
        }
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      console.log('🔧 Utterance config:', {
        text: text.substring(0, 30) + '...',
        voice: utterance.voice?.name,
        lang: utterance.lang,
        rate: utterance.rate,
        volume: utterance.volume
      });

      utterance.onstart = () => {
        console.log('🔊 Speech started - AUDIO SHOULD BE PLAYING NOW!');
      };

      utterance.onend = () => {
        console.log('✅ Speech ended - audio finished');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event);
        console.error('❌ Error details:', {
          error: event.error,
          type: event.type
        });
        resolve();
      };

      console.log('🎤 Calling speechSynthesis.speak()...');
      console.log('🎤 Queue before speak:', window.speechSynthesis.pending);
      window.speechSynthesis.speak(utterance);
      
      // Verify it's speaking
      setTimeout(() => {
        console.log('📊 Speaking status:', window.speechSynthesis.speaking);
        console.log('📊 Pending status:', window.speechSynthesis.pending);
        console.log('📊 Paused status:', window.speechSynthesis.paused);
      }, 100);
    });
  }

  public start(): void {
    if (!this.recognition) {
      console.error('❌ Speech recognition not available in this browser');
      alert('⚠️ Speech recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (this.isListening) {
      console.log('✅ LUCA already listening');
      return;
    }

    try {
      console.log('═══════════════════════════════════════════');
      console.log('🤖 LUCA AI VOICE ASSISTANT - ChatGPT Mode');
      console.log('═══════════════════════════════════════════');
      console.log('🎤 ASR: Web Speech API (Streaming)');
      console.log('🧠 AI: Google Gemini 1.5 Flash');
      console.log('🎙️ Language: Standard Arabic (ar-SA)');
      console.log('🔁 Mode: STREAMING CONTINUOUS');
      console.log('⏱️ Silence threshold: ' + this.silenceThreshold + 'ms');
      console.log('📊 Alternatives: 5 (confidence tracking)');
      console.log('🎯 Wake words: "لوكا", "LUCA", "Ahla Beleh"');
      console.log('🛑 Stop command: "LUCA stop" / "LUCA خلاص"');
      console.log('═══════════════════════════════════════════');
      console.log('🎬 PIPELINE: Mic → ASR → AI Analysis → Action → TTS');
      console.log('═══════════════════════════════════════════');
      
      this.continuousMode = true; // Enable continuous listening
      this.recognition.start();
      this.isListening = true;
      
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('listening');
      }
      
      // Show user notification
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          console.log('✅ LUCA STREAMING MODE ACTIVE');
          console.log('💡 Speak naturally - AI understands ALL variations!');
          console.log('🎯 Say "لوكا [command]" - LUCA will respond instantly');
          console.log('⚡ Examples: "لوكا الديسبورد" "لوكا ايميل" "لوكا تسكات"');
        }, 500);
      }
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        console.log('✅ LUCA already started');
        this.isListening = true;
      } else if (error.name === 'NotAllowedError') {
        console.error('❌ MICROPHONE PERMISSION DENIED!');
        alert('🎤 CRITICAL: Please allow microphone access for LUCA to work!\n\nClick the 🔒 icon in your browser address bar and enable microphone.');
      } else {
        console.error('❌ Failed to start listening:', error);
        alert(`❌ Error starting LUCA: ${error.message}\n\nTry refreshing the page or check your microphone.`);
      }
    }
  }

  public stop(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.continuousMode = false; // Disable auto-restart
      this.recognition.stop();
      this.isListening = false;
      this.setMode('idle');
      console.log('🔇 LUCA stopped listening');
      console.log('🛑 Continuous mode disabled');
      
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback('idle');
      }
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }

  public toggle(): void {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  public getStatus(): boolean {
    return this.isListening;
  }

  // Event listeners
  public onWakeWord(callback: () => void): void {
    this.onWakeWordCallback = callback;
  }

  public onCommand(callback: (command: string) => void): void {
    this.onCommandCallback = callback;
  }

  public onResponse(callback: (response: string) => void): void {
    this.onResponseCallback = callback;
  }

  public onStatusChange(callback: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void): void {
    this.onStatusChangeCallback = callback;
  }

  public destroy(): void {
    this.clearSilenceTimer();
    this.stop();
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition.onaudiostart = null;
      this.recognition.onaudioend = null;
      this.recognition.onsoundstart = null;
      this.recognition.onsoundend = null;
      this.recognition.onspeechstart = null;
      this.recognition.onspeechend = null;
      this.recognition = null;
    }
    console.log('🗑️ LUCA destroyed and cleaned up');
  }

  // 🎯 Get performance stats
  public getStats(): {
    isListening: boolean;
    mode: LucaMode;
    lastSpeechTime: number;
    isBusy: boolean;
    continuousMode: boolean;
  } {
    return {
      isListening: this.isListening,
      mode: this.currentMode,
      lastSpeechTime: this.lastSpeechTime,
      isBusy: this.isProcessingCommand,
      continuousMode: this.continuousMode,
    };
  }
}

// Singleton instance
let lucaInstance: LucaVoiceAssistant | null = null;

export function getLucaAssistant(): LucaVoiceAssistant {
  if (!lucaInstance && typeof window !== 'undefined') {
    lucaInstance = new LucaVoiceAssistant();
  }
  return lucaInstance!;
}

