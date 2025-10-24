'use client';

import * as React from 'react';
import { Mail, Inbox, Send, File, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MailList } from '@/app/(app)/mail/components/mail-list';
import { MailDisplay } from '@/app/(app)/mail/components/mail-display';
import { emails } from '@/lib/data';
import type { Email } from '@/lib/data';

export default function MailPage() {
  const [selected, setSelected] = React.useState<string | null>(emails[0].id);
  const selectedEmail = emails.find((item) => item.id === selected) || null;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="font-headline text-xl font-bold">Mailbox</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Add actions here */}
        </div>
      </div>
      <Separator />
      <TooltipProvider delayDuration={0}>
        <div className="grid grid-cols-[260px_1fr] flex-1">
          <div className="border-r">
            <div className="p-2">
              <form>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <nav className="grid gap-1 px-2">
                <a
                    href="#"
                    className="flex items-center rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-all hover:text-primary-foreground"
                >
                    <Inbox className="mr-3 h-4 w-4" />
                    Inbox
                    <span className="ml-auto flex h-6 w-9 items-center justify-center rounded-full bg-primary-foreground text-sm text-primary">{emails.filter(e => !e.read).length}</span>
                </a>
                 <a
                    href="#"
                    className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Star className="mr-3 h-4 w-4" />
                    Starred
                </a>
                 <a
                    href="#"
                    className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Send className="mr-3 h-4 w-4" />
                    Sent
                </a>
                 <a
                    href="#"
                    className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <File className="mr-3 h-4 w-4" />
                    Drafts
                </a>
                 <a
                    href="#"
                    className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Trash2 className="mr-3 h-4 w-4" />
                    Trash
                </a>
            </nav>
          </div>
          <div className="grid grid-cols-[minmax(300px,450px)_1fr]">
            <div className="border-r">
              <Tabs defaultValue="all" className="h-full flex flex-col">
                <TabsList className="mx-2 mt-2">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="flex-1 overflow-y-auto">
                    <MailList items={emails} onSelect={setSelected} selected={selected} />
                </TabsContent>
                <TabsContent value="unread" className="flex-1 overflow-y-auto">
                    <MailList items={emails.filter((item) => !item.read)} onSelect={setSelected} selected={selected} />
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex flex-col">
              <MailDisplay mail={selectedEmail} />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
