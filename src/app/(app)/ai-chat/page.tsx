'use client';

import { ChatAssistant } from '@/components/ai/chat-assistant';

export default function AIChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Ask me anything! I can answer questions in Arabic, French, or English.
          </p>
        </div>

        <ChatAssistant />
      </div>
    </div>
  );
}

