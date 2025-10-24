'use client';

import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useVoiceAssistant } from './voice-assistant-provider';


export function VoiceAssistantTrigger() {
  const { isListening, open, toggleListening } = useVoiceAssistant();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={open}
            className={`relative ${isListening ? 'text-primary' : ''}`}
          >
            <Bot className="h-5 w-5" />
            {isListening && (
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/80"></span>
                </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'LUCA is listening...' : 'Ask LUCA'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
