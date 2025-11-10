/**
 * Advanced Voice Assistant Component
 * The most powerful voice assistant for Tunisian professionals
 */

"use client";

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
}

interface SpeechSynthesisEvent extends Event {
  charIndex: number;
  charLength: number;
  elapsedTime: number;
  name: string;
}

interface SpeechSynthesisErrorEvent extends Event {
  error: string;
}

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var SpeechSynthesisUtterance: {
  prototype: SpeechSynthesisUtterance;
  new(text?: string): SpeechSynthesisUtterance;
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  X, 
  Send,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Languages,
  Zap,
  Brain,
  MessageSquare,
  Headphones,
  Speaker
} from 'lucide-react';
import { trackVoiceCommand, trackEvent } from '@/lib/analytics';
import { aiService } from '@/lib/ai-service';

// Voice Assistant Types
interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language: string;
  confidence?: number;
  processing?: boolean;
  error?: string;
}

interface VoiceCommand {
  id: string;
  command: string;
  response: string;
  timestamp: string;
  success: boolean;
  language: string;
  category: 'task' | 'email' | 'calendar' | 'general' | 'settings';
}

interface VoiceSettings {
  language: string;
  speed: number;
  volume: number;
  autoListen: boolean;
  wakeWord: string;
  continuous: boolean;
  noiseReduction: boolean;
  echoCancellation: boolean;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  currentLanguage: string;
  confidence: number;
  volume: number;
  error: string | null;
}

const languages = [
  { code: 'ar-TN', name: 'العربية التونسية', flag: '🇹🇳' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ar-SA', name: 'العربية السعودية', flag: '🇸🇦' },
];

const voiceCommands = [
  {
    category: 'task',
    commands: [
      'Create a new task',
      'Show my tasks',
      'Mark task as complete',
      'Set task priority',
    ],
  },
  {
    category: 'email',
    commands: [
      'Read my emails',
      'Compose new email',
      'Reply to email',
      'Mark email as important',
    ],
  },
  {
    category: 'calendar',
    commands: [
      'Show my schedule',
      'Schedule a meeting',
      'What meetings do I have today?',
      'Cancel my next meeting',
    ],
  },
  {
    category: 'general',
    commands: [
      'What time is it?',
      'What\'s the weather?',
      'Search for something',
      'Open dashboard',
    ],
  },
];

export function AdvancedVoiceAssistant() {
  const { voiceAssistant, updateVoiceAssistant, language } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    language: language,
    speed: 1.0,
    volume: 0.8,
    autoListen: false,
    wakeWord: 'LUCA',
    continuous: false,
    noiseReduction: true,
    echoCancellation: true,
  });
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    isConnected: false,
    currentLanguage: language,
    confidence: 0,
    volume: 0,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = settings.continuous;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = settings.language;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.onstart = () => {
          setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
          updateVoiceAssistant({ isListening: true });
        };
        
        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            const command = result[0].transcript;
            const confidence = result[0].confidence;
            
            setVoiceState(prev => ({ ...prev, confidence }));
            handleVoiceCommand(command, confidence);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          setVoiceState(prev => ({ 
            ...prev, 
            error: event.error, 
            isListening: false 
          }));
          updateVoiceAssistant({ isListening: false });
        };
        
        recognitionRef.current.onend = () => {
          setVoiceState(prev => ({ ...prev, isListening: false }));
          updateVoiceAssistant({ isListening: false });
        };
      }
    }
  }, [settings, updateVoiceAssistant]);

  // Initialize audio context for volume visualization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new (window as any).AudioContext();
    }
  }, []);

  // Handle voice command
  const handleVoiceCommand = useCallback(async (command: string, confidence: number) => {
    const messageId = Date.now().toString();
    
    // Add user message
    const userMessage: VoiceMessage = {
      id: messageId,
      type: 'user',
      content: command,
      timestamp: new Date().toISOString(),
      language: settings.language,
      confidence,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setVoiceState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Process command with AI
      const response = await aiService.processVoiceCommand({
        command,
        language: settings.language,
        context: 'voice_assistant',
      });
      
      if (response.success) {
        // Add assistant response
        const assistantMessage: VoiceMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.text,
          timestamp: new Date().toISOString(),
          language: settings.language,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Add to commands history
        const voiceCommand: VoiceCommand = {
          id: messageId,
          command,
          response: response.text,
          timestamp: new Date().toISOString(),
          success: true,
          language: settings.language,
          category: 'general', // This would be determined by AI
        };
        
        setCommands(prev => [...prev, voiceCommand]);
        
        // Speak response
        speak(response.text);
        
        // Track voice command
        trackVoiceCommand(command, true, settings.language);
        
      } else {
        throw new Error(response.error || 'Command processing failed');
      }
      
    } catch (error) {
      console.error('Voice command error:', error);
      
      const errorMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I couldn\'t process that command. Please try again.',
        timestamp: new Date().toISOString(),
        language: settings.language,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      trackVoiceCommand(command, false, settings.language);
      
    } finally {
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [settings.language, updateVoiceAssistant]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language;
      utterance.rate = settings.speed;
      utterance.volume = settings.volume;
      
      utterance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };
      
      utterance.onend = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };
      
      speechSynthesis.speak(utterance as any);
      synthesisRef.current = utterance;
    }
  }, [settings]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start();
      trackEvent('voice_assistant_start_listening');
    }
  }, [voiceState.isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
      trackEvent('voice_assistant_stop_listening');
    }
  }, [voiceState.isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    trackEvent('voice_assistant_clear_messages');
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    trackEvent('voice_assistant_update_settings', newSettings);
  }, []);

  return (
    <>
      {/* Voice Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={`h-16 w-16 rounded-full shadow-lg ${
            voiceState.isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          <Mic className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Voice Assistant Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Voice Assistant</h2>
                    <p className="text-sm text-muted-foreground">
                      Speak naturally in {languages.find(l => l.code === settings.language)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, language: 'ar-TN' }))}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    {languages.find(l => l.code === settings.language)?.flag}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMessages}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex">
                {/* Messages */}
                <div className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                            <Mic className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                          <p className="text-muted-foreground mb-6">
                            Click the microphone button or say "{settings.wakeWord}" to begin
                          </p>
                          
                          {/* Voice Commands Help */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {voiceCommands.map((category, index) => (
                              <Card key={index} className="p-4">
                                <h4 className="font-medium mb-2 capitalize">{category.category}</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  {category.commands.slice(0, 3).map((command, cmdIndex) => (
                                    <li key={cmdIndex}>• {command}</li>
                                  ))}
                                </ul>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${
                              message.type === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className={`flex gap-3 max-w-[80%] ${
                              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <div className={`p-2 rounded-full ${
                                message.type === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : message.type === 'assistant'
                                  ? 'bg-muted'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {message.type === 'user' && <User className="h-4 w-4" />}
                                {message.type === 'assistant' && <Bot className="h-4 w-4" />}
                                {message.type === 'system' && <AlertCircle className="h-4 w-4" />}
                              </div>
                              <div className={`p-3 rounded-lg ${
                                message.type === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                  <Clock className="h-3 w-3" />
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                  {message.confidence && (
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(message.confidence * 100)}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Voice Controls */}
                  <div className="p-6 border-t">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={toggleListening}
                        disabled={voiceState.isProcessing}
                        className={`h-16 w-16 rounded-full ${
                          voiceState.isListening 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {voiceState.isProcessing ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : voiceState.isListening ? (
                          <MicOff className="h-6 w-6" />
                        ) : (
                          <Mic className="h-6 w-6" />
                        )}
                      </Button>
                      
                      {voiceState.isSpeaking && (
                        <Button
                          onClick={() => speechSynthesis.cancel()}
                          variant="outline"
                          size="sm"
                        >
                          <VolumeX className="h-4 w-4 mr-2" />
                          Stop Speaking
                        </Button>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          voiceState.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-muted-foreground">
                          {voiceState.isListening ? 'Listening...' : 'Ready'}
                        </span>
                      </div>
                      
                      {voiceState.confidence > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <Progress value={voiceState.confidence * 100} className="w-20 h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Settings Panel */}
                <div className="w-80 border-l p-6">
                  <h3 className="font-semibold mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Language */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Language</label>
                      <div className="grid grid-cols-2 gap-2">
                        {languages.map((lang) => (
                          <Button
                            key={lang.code}
                            variant={settings.language === lang.code ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSettings({ language: lang.code })}
                            className="justify-start"
                          >
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Speed */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Speech Speed: {settings.speed}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.speed}
                        onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Volume */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Volume: {Math.round(settings.volume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.volume}
                        onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.autoListen}
                          onChange={(e) => updateSettings({ autoListen: e.target.checked })}
                        />
                        <span className="text-sm">Auto-listen</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.continuous}
                          onChange={(e) => updateSettings({ continuous: e.target.checked })}
                        />
                        <span className="text-sm">Continuous listening</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.noiseReduction}
                          onChange={(e) => updateSettings({ noiseReduction: e.target.checked })}
                        />
                        <span className="text-sm">Noise reduction</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
