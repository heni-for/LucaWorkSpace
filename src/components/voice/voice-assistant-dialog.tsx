'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mic, MicOff, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export function VoiceAssistantDialog() {
  const {
    isOpen,
    isListening,
    transcript,
    interimTranscript,
    close,
    toggleListening,
    clearTranscript,
  } = useStore(state => state.voice);

  const handleToggle = () => {
    if (isListening) {
        clearTranscript();
    }
    toggleListening();
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-primary" />
            LUCA Voice Assistant
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className='flex items-center justify-center'>
                <Button size="icon" className="h-20 w-20 rounded-full" onClick={handleToggle}>
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
            </div>
            <div className="relative min-h-[120px] rounded-lg border bg-muted/50 p-4">
                <ScrollArea className="h-full">
                    <p className="text-sm">{transcript}</p>
                    <p className="text-sm text-muted-foreground">{interimTranscript}</p>
                </ScrollArea>
                {isListening && <Badge variant="secondary" className="absolute top-2 right-2">Listening...</Badge>}
            </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={close}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
