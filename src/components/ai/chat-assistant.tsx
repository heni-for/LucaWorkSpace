'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, Mic, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  className?: string;
}

export function ChatAssistant({ className }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to speak response with proper voice loading
  const speakResponse = async (text: string, language: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    console.log('🗣️ Speaking response:', text.substring(0, 50));

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Wait for voices to load
    const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        
        if (voices.length > 0) {
          console.log('✅ Voices loaded:', voices.length);
          resolve(voices);
          return;
        }

        console.log('⏳ Waiting for voices...');
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          console.log('✅ Voices loaded:', voices.length);
          resolve(voices);
        };

        window.speechSynthesis.getVoices();

        // Timeout fallback
        setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          console.log('⏱️ Voices after timeout:', voices.length);
          resolve(voices);
        }, 1000);
      });
    };

    const voices = await loadVoices();
    const utterance = new SpeechSynthesisUtterance(text);

    // Find appropriate voice based on language
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (language === 'ar-TN' || language.startsWith('ar')) {
      selectedVoice = voices.find(v => v.lang.startsWith('ar')) || null;
    } else if (language === 'fr-FR' || language.startsWith('fr')) {
      selectedVoice = voices.find(v => v.lang.startsWith('fr')) || null;
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith('en')) || null;
    }

    if (selectedVoice) {
      console.log('✅ Using voice:', selectedVoice.name, selectedVoice.lang);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else if (voices.length > 0) {
      console.log('⚠️ Using first available voice:', voices[0].name);
      utterance.voice = voices[0];
      utterance.lang = voices[0].lang;
    } else {
      utterance.lang = language;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => console.log('🔊 Speech started');
    utterance.onend = () => console.log('✅ Speech ended');
    utterance.onerror = (e) => console.error('❌ Speech error:', e);

    window.speechSynthesis.speak(utterance);

    // Verify it's speaking
    setTimeout(() => {
      console.log('📊 Speaking:', window.speechSynthesis.speaking);
    }, 100);
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        // Try to detect language
        recognitionRef.current.lang = 'ar-TN'; // Default to Tunisian Arabic
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Detect language
      const isArabic = /[\u0600-\u06FF]/.test(input);
      const isFrench = /\b(bonjour|comment|pourquoi|quoi|qui|est-ce)\b/i.test(input);
      const language = isArabic ? 'ar-TN' : isFrench ? 'fr-FR' : 'en-US';

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: input,
          language: language,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Sorry, I could not generate an answer.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response with proper voice loading
      if ('speechSynthesis' in window && data.answer) {
        speakResponse(data.answer, language);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          LUCA Assistant - Ask me anything!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/30">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ask me anything! I can help with:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• General knowledge questions</li>
                <li>• Technical explanations</li>
                <li>• Productivity advice</li>
                <li>• Tunisia-specific info</li>
                <li>• And much more!</li>
              </ul>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            className={isListening ? 'bg-red-500 text-white' : ''}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (Arabic, French, or English)"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Powered by Google Gemini AI • Supports Arabic, French & English
        </p>
      </CardContent>
    </Card>
  );
}

