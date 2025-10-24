'use client';

import * as React from 'react';
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
  Bot,
  Languages,
  Sparkles,
  Shield,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { emailSummaryAndReplySuggestions, classifyEmail } from '@/ai/flows';
import type { Email } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

interface MailDisplayProps {
  mail: Email | null;
}

type AIResult = {
  summary: string;
  category: string;
  priority: string;
  replySuggestions: {
    derja: string;
    french: string;
    english: string;
  };
};

export function MailDisplay({ mail }: MailDisplayProps) {
  const [aiResult, setAiResult] = React.useState<AIResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const getAIInsights = async () => {
      if (!mail) return;
      setIsLoading(true);
      setAiResult(null);

      try {
        const [summaryResult, classificationResult] = await Promise.all([
          emailSummaryAndReplySuggestions({ emailBody: mail.body }),
          classifyEmail({ emailContent: mail.body }),
        ]);

        setAiResult({
          summary: summaryResult.summary,
          category: classificationResult.category,
          priority: classificationResult.priority,
          replySuggestions: summaryResult.replySuggestions,
        });
      } catch (error) {
        console.error('Failed to get AI insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAIInsights();
  }, [mail]);

  const today = new Date();

  if (!mail) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        <p>No message selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          {['Reply', 'Reply All', 'Forward'].map(item => (
            <Tooltip key={item}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!mail}>
                  {item === 'Reply' && <Reply className="h-4 w-4" />}
                  {item === 'Reply All' && <ReplyAll className="h-4 w-4" />}
                  {item === 'Forward' && <Forward className="h-4 w-4" />}
                  <span className="sr-only">{item}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star message</DropdownMenuItem>
            <DropdownMenuItem>Add to tasks</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Separator />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-start p-4">
          <div className="flex items-start gap-4 text-sm">
            <Avatar>
              <AvatarFallback>{mail.avatar}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{mail.sender}</div>
              <div className="line-clamp-1 text-xs">{mail.subject}</div>
            </div>
          </div>
          {mail.date && (
            <div className="ml-auto text-xs text-muted-foreground">
              {mail.date}
            </div>
          )}
        </div>
        <Separator />
        <div className="whitespace-pre-wrap p-4 text-sm">{mail.body}</div>
        <Separator className="mt-auto" />
        <div className="p-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-headline">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Separator />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
              )}
              {aiResult && !isLoading && (
                <>
                <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary"><Briefcase className="mr-1 h-3 w-3" /> {aiResult.category}</Badge>
                    <Badge variant="secondary" className={
                        aiResult.priority === 'High' ? "text-destructive-foreground bg-destructive/80" : 
                        aiResult.priority === 'Medium' ? "text-amber-800 bg-amber-400/80" : ""
                    }><Shield className="mr-1 h-3 w-3" /> {aiResult.priority} Priority</Badge>
                </div>

                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /> Summary</h3>
                    <p className="text-sm text-muted-foreground">{aiResult.summary}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><Languages className="h-4 w-4 text-primary" /> Suggested Replies</h3>
                    <div className="grid gap-2 md:grid-cols-3">
                        <Button variant="outline" size="sm" className="h-auto whitespace-normal">
                           <div className="flex flex-col items-start text-left p-1">
                                <p className="font-semibold">Derja</p>
                                <p className="text-xs font-normal text-muted-foreground">{aiResult.replySuggestions.derja}</p>
                           </div>
                        </Button>
                        <Button variant="outline" size="sm" className="h-auto whitespace-normal">
                            <div className="flex flex-col items-start text-left p-1">
                                <p className="font-semibold">French</p>
                                <p className="text-xs font-normal text-muted-foreground">{aiResult.replySuggestions.french}</p>
                           </div>
                        </Button>
                        <Button variant="outline" size="sm" className="h-auto whitespace-normal">
                           <div className="flex flex-col items-start text-left p-1">
                                <p className="font-semibold">English</p>
                                <p className="text-xs font-normal text-muted-foreground">{aiResult.replySuggestions.english}</p>
                           </div>
                        </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
