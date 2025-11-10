'use client';

/**
 * LUCA AI Background Agent Provider
 * Provides the agent to the entire application
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DerjaAgent, derjaAgent, AgentIntent, AgentResponse } from '@/ai/agent/derjaAgent';

interface AgentContextType {
  agent: DerjaAgent;
  isListening: boolean;
  isEnabled: boolean;
  toggleListening: () => void;
  processCommand: (transcript: string) => Promise<AgentResponse>;
  speak: (text: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Initialize the agent
    const agent = derjaAgent;
    let isMounted = true;

    // Add keyboard shortcut to toggle (Ctrl/Cmd + Shift + L)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        agent.toggleListening();
        if (isMounted) {
          setIsListening(agent.getListeningStatus());
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Start listening after a short delay to ensure everything is mounted
    const timer = setTimeout(() => {
      if (isEnabled && !agent.getListeningStatus()) {
        agent.startListening();
        if (isMounted) {
          setIsListening(true);
        }
      }
    }, 100);

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyPress);
      if (agent.getListeningStatus()) {
        agent.stopListening();
      }
    };
  }, [isEnabled]);

  const toggleListening = () => {
    derjaAgent.toggleListening();
    setIsListening(derjaAgent.getListeningStatus());
  };

  const processCommand = async (transcript: string): Promise<AgentResponse> => {
    return await derjaAgent.processCommand(transcript);
  };

  const speak = (text: string) => {
    derjaAgent.speakDerja(text);
  };

  return (
    <AgentContext.Provider
      value={{
        agent: derjaAgent,
        isListening,
        isEnabled,
        toggleListening,
        processCommand,
        speak,
      }}
    >
      {children}
      
      {/* Visual indicator when listening */}
      {isListening && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-sm font-medium">🎤 LUCA يستمع...</span>
          </div>
        </div>
      )}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}

