'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { VoiceAssistantDialog } from './voice-assistant-dialog';
import { useStore } from '@/store';

interface VoiceAssistantContextType {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  open: () => void;
  close: () => void;
  toggleListening: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export function useVoiceAssistant() {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
}

export function VoiceAssistantProvider({ children }: { children: React.ReactNode }) {
  const { 
    isOpen, 
    isListening, 
    transcript, 
    interimTranscript, 
    open, 
    close, 
    toggleListening, 
    setTranscript, 
    setInterimTranscript, 
    setIsListening,
  } = useStore(state => state.voice);

  const recognitionRef = useRef<any>(null);

  const handleResult = useCallback((event: any) => {
    let finalTranscript = '';
    let interim = '';
    for (let i = 0; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    setInterimTranscript(interim);
    if (finalTranscript) {
      setTranscript(useStore.getState().voice.transcript + finalTranscript);
    }
  }, [setInterimTranscript, setTranscript, useStore.getState]);

  const handleEnd = useCallback(() => {
    setIsListening(false);
  }, [setIsListening]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-TN'; // Tunisian Arabic

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    
    recognitionRef.current = recognition;
  }, [handleResult, handleEnd]);

  useEffect(() => {
    if (isListening) {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
  }, [isListening]);


  const value = {
    isOpen,
    isListening,
    transcript,
    interimTranscript,
    open,
    close,
    toggleListening,
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
      <VoiceAssistantDialog />
    </VoiceAssistantContext.Provider>
  );
}
