'use client';

import * as React from 'react';
import { getLucaAssistant } from '@/lib/luca-voice-assistant';

export type LucaStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export function useLucaVoice() {
  const [isListening, setIsListening] = React.useState(false);
  const [status, setStatus] = React.useState<LucaStatus>('idle');
  const [lastCommand, setLastCommand] = React.useState<string>('');
  const [lastResponse, setLastResponse] = React.useState<string>('');
  const lucaRef = React.useRef<ReturnType<typeof getLucaAssistant> | null>(null);

  React.useEffect(() => {
    // Initialize LUCA
    if (typeof window !== 'undefined') {
      lucaRef.current = getLucaAssistant();
      
      // Setup callbacks
      lucaRef.current.onWakeWord(() => {
        console.log('👋 Wake word detected!');
      });

      lucaRef.current.onCommand((cmd) => {
        setLastCommand(cmd);
      });

      lucaRef.current.onResponse((response) => {
        setLastResponse(response);
      });

      lucaRef.current.onStatusChange((newStatus) => {
        setStatus(newStatus);
      });

      // Update listening state
      setIsListening(lucaRef.current.getStatus());
    }

    return () => {
      if (lucaRef.current) {
        lucaRef.current.destroy();
      }
    };
  }, []);

  const toggleListening = React.useCallback(() => {
    if (lucaRef.current) {
      lucaRef.current.toggle();
      setIsListening(lucaRef.current.getStatus());
    }
  }, []);

  const start = React.useCallback(() => {
    if (lucaRef.current) {
      lucaRef.current.start();
      setIsListening(true);
    }
  }, []);

  const stop = React.useCallback(() => {
    if (lucaRef.current) {
      lucaRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = React.useCallback(async (text: string) => {
    if (lucaRef.current) {
      await lucaRef.current.speak(text);
    }
  }, []);

  return {
    isListening,
    status,
    lastCommand,
    lastResponse,
    toggleListening,
    start,
    stop,
    speak,
  };
}

