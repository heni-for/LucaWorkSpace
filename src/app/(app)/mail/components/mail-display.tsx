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
  Briefcase,
  Star,
  Download,
  Printer,
  Share2,
  Copy,
  ExternalLink,
  Mail,
  AlertCircle
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
  DropdownMenuSeparator,
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
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLucaMemory } from '@/hooks/use-luca-memory';
import { memory } from '@/lib/memory';
import { useAuth } from '@/contexts/auth-context';
import { emailSummaryAndReplySuggestions, classifyEmail } from '@/ai/flows';
import type { EmailSummaryAndReplySuggestionsOutput } from '@/ai/flows/email-summary-and-reply-suggestions';
import type { ClassifyEmailOutput } from '@/ai/flows/email-classification-and-priority';
import type { Email } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MailDisplayProps {
  mail: Email | null;
  onStar?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  activeFolder?: 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash';
  onPrepareReply?: (text: string) => void;
}

type AIResult = ClassifyEmailOutput & {
  replySuggestions: EmailSummaryAndReplySuggestionsOutput['replySuggestions'];
};

export function MailDisplay({ 
  mail, 
  onStar, 
  onDelete, 
  onRestore, 
  onPermanentDelete, 
  activeFolder = 'inbox',
  onPrepareReply,
}: MailDisplayProps) {
  const { user } = useAuth();
  const [aiResult, setAiResult] = React.useState<AIResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [tone, setTone] = React.useState<'Professional' | 'Friendly' | 'Urgent'>('Professional');
  const [lengthPref, setLengthPref] = React.useState<'Short' | 'Medium' | 'Long'>('Medium');
  const { rememberFromText } = useLucaMemory();
  const [attachTextOpen, setAttachTextOpen] = React.useState(false);
  const [attachTextContent, setAttachTextContent] = React.useState<string>('');
  const [attachTextTitle, setAttachTextTitle] = React.useState<string>('');
  const [attachLoading, setAttachLoading] = React.useState(false);

  const userName = React.useMemo(() => user?.name || memory.getSnapshot().user.name || '', [user]);

  // Configure PDF.js worker globally on component mount
  React.useEffect(() => {
    const configurePDFWorker = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        if ((pdfjs as any).GlobalWorkerOptions) {
          // Force use local worker with full absolute URL (.js extension for better compatibility)
          const workerUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/pdf.worker.min.js`
            : '/pdf.worker.min.js';
          // Clear any existing config
          delete ((pdfjs as any).GlobalWorkerOptions as any).workerSrc;
          (pdfjs as any).GlobalWorkerOptions.workerSrc = workerUrl;
          console.log('PDF worker configured globally to:', workerUrl);
        }
      } catch (error) {
        console.warn('Failed to configure PDF.js worker:', error);
      }
    };
    configurePDFWorker();
  }, []);

  // Helper function to extract text from attachments (especially PDFs)
  const extractAttachmentText = React.useCallback(async (att: any): Promise<string> => {
    try {
      const res = await fetch(`/api/mail/gmail/attachment?messageId=${encodeURIComponent(att.messageId)}&attachmentId=${encodeURIComponent(att.attachmentId)}`);
      if (!res.ok) return '';
      const data = await res.json();
      const base64 = (data.data || '').replace(/_/g, '/').replace(/-/g, '+');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
      let textContent = '';
      if ((att.mimeType || '').startsWith('text/')) {
        textContent = new TextDecoder('utf-8').decode(bytes);
      } else if ((att.mimeType || '').includes('pdf')) {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          const pdfjs = pdfjsLib as any;
          
          // Force configure worker - override any existing settings
          // Must be set before getDocument is called
          if (pdfjs.GlobalWorkerOptions) {
            // Delete and reset to ensure local worker is used (.js extension for better compatibility)
            const workerUrl = typeof window !== 'undefined' 
              ? `${window.location.origin}/pdf.worker.min.js`
              : '/pdf.worker.min.js';
            
            // Verify worker is accessible
            try {
              const workerTest = await fetch(workerUrl, { method: 'HEAD' });
              if (!workerTest.ok) {
                console.error('Worker file not accessible:', workerUrl, workerTest.status);
              }
            } catch (fetchError) {
              console.error('Worker file fetch test failed:', fetchError);
            }
            
            // Clear and set worker
            delete (pdfjs.GlobalWorkerOptions as any).workerSrc;
            pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
            // Disable fake worker fallback
            (pdfjs.GlobalWorkerOptions as any).useWorkerFetch = true;
            console.log('PDF worker configured to:', pdfjs.GlobalWorkerOptions.workerSrc);
          }
          
          // Load PDF document with explicit worker options
          const loadingTask = pdfjs.getDocument({ 
            data: bytes,
            useSystemFonts: true,
            verbosity: 0, // Suppress warnings
            isEvalSupported: false, // Security: disable eval
            // Explicitly disable any fallback workers
            useWorkerFetch: true,
          });
          const pdf = await loadingTask.promise;
          
          // Extract text from all pages (up to 50 pages for comprehensive extraction)
          const maxPages = Math.min(pdf.numPages, 50);
          const pageTexts: string[] = [];
          
          for (let p = 1; p <= maxPages; p++) {
            try {
              const page = await pdf.getPage(p);
              const textContent = await page.getTextContent();
              
              // Extract text items and preserve structure
              const items = (textContent as any).items || [];
              let pageText = '';
              let lastY = null;
              
              for (const item of items) {
                const str = item.str || '';
                const y = item.transform?.[5] || 0;
                
                // Add line break if Y position changed significantly (new line)
                if (lastY !== null && Math.abs(y - lastY) > 5) {
                  pageText += '\n';
                }
                pageText += str + ' ';
                lastY = y;
              }
              
              if (pageText.trim()) {
                pageTexts.push(`--- Page ${p} ---\n${pageText.trim()}\n`);
              }
            } catch (pageError) {
              console.warn(`Error extracting page ${p}:`, pageError);
            }
          }
          
          textContent = pageTexts.join('\n');
          
          // OCR fallback only if no text extracted at all
          if (!textContent.trim()) {
            try {
              const { recognize } = await import('tesseract.js');
              // Try first 2 pages with OCR
              for (let p = 1; p <= Math.min(pdf.numPages, 2); p++) {
                try {
                  const page = await pdf.getPage(p);
                  const viewport = page.getViewport({ scale: 2.0 });
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d')!;
                  canvas.width = viewport.width;
                  canvas.height = viewport.height;
                  await page.render({ canvasContext: ctx as any, viewport }).promise;
                  const dataUrl = canvas.toDataURL('image/png');
                  const ocr = await recognize(dataUrl, 'eng', {});
                  if (ocr?.data?.text) {
                    textContent += `\n--- Page ${p} (OCR) ---\n${ocr.data.text}\n`;
                  }
                } catch (ocrError) {
                  console.warn(`OCR error on page ${p}:`, ocrError);
                }
              }
            } catch (ocrLibError) {
              console.warn('OCR library not available:', ocrLibError);
            }
          }
        } catch (pdfError) {
          console.error('PDF extraction error:', pdfError);
          throw pdfError;
        }
      } else if ((att.mimeType || '').includes('word') || /\.docx?$/.test(att.filename || '')) {
        try {
          const mammoth: any = await import('mammoth');
          const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
          textContent = (result.value || '').toString();
        } catch {}
      }
      return textContent.trim();
    } catch {
      return '';
    }
  }, []);

  const buildPrototype = React.useCallback((lang: 'Derja' | 'French' | 'English') => {
    const subject = mail ? mail.subject : '';
    const sender = mail ? mail.sender : '';
    const greeting =
      lang === 'Derja' ? 'مرحبا' : lang === 'French' ? 'Bonjour' : 'Hi';
    const sign =
      lang === 'Derja' ? 'مع الشكر،\n' : lang === 'French' ? 'Cordialement,\n' : 'Best regards,\n';
    const toneLine =
      tone === 'Urgent'
        ? (lang === 'French' ? "[Urgent]" : lang === 'Derja' ? '[مستعجل]' : '[Urgent]')
        : tone === 'Friendly'
        ? (lang === 'French' ? '[Amical]' : lang === 'Derja' ? '[ودي]' : '[Friendly]')
        : (lang === 'French' ? '[Professionnel]' : lang === 'Derja' ? '[مهني]' : '[Professional]');
    const body =
      lang === 'Derja'
        ? `
${greeting} ${sender},

${toneLine} شكراً على مراسلتك بخصوص "${subject}".

[ملخص قصير/نقطة أساسية]
- ...

[السؤال/الخطوة الجاية]
- ...

${sign}${userName || 'اسمك'}
`
        : lang === 'French'
        ? `
${greeting} ${sender},

${toneLine} Merci pour votre message concernant « ${subject} ».

[Résumé court / point clé]
- ...

[Question / prochaine étape]
- ...

${sign}${userName || 'Votre nom'}
`
        : `
${greeting} ${sender},

${toneLine} Thanks for your email regarding "${subject}".

[Short summary / key point]
- ...

[Question / next step]
- ...

${sign}${userName || 'Your Name'}
`;
    return body.trim();
  }, [mail, tone, userName]);

  React.useEffect(() => {
    const getAIInsights = async () => {
      if (!mail) return;
      setIsLoading(true);
      setAiResult(null);
      setAiError(null);

      try {
        // Automatically extract text from PDF attachments
        let enrichedBody = mail.body;
        const attachments = (mail as any)?.attachments || [];
        const pdfAttachments = attachments.filter((att: any) => (att.mimeType || '').includes('pdf'));
        let hasPdfContent = false;
        
        if (pdfAttachments.length > 0) {
          // Extract text from the first PDF (or all PDFs if small)
          const extractedTexts = await Promise.all(
            pdfAttachments.slice(0, 2).map((att: any) => extractAttachmentText(att))
          );
          const combinedPdfText = extractedTexts.filter(t => t).join('\n\n');
          if (combinedPdfText) {
            hasPdfContent = true;
            enrichedBody += `\n\n--- Content from attached PDF(s): ---\n${combinedPdfText.slice(0, 12000)}`;
          }
        }

        const [summaryResult, classificationResult] = await Promise.all([
          emailSummaryAndReplySuggestions({ 
            emailBody: enrichedBody,
            subject: mail.subject,
            sender: mail.sender,
            tone,
            length: lengthPref,
            userName,
          }),
          classifyEmail({ emailContent: mail.body }),
        ]);

        setAiResult({
          summary: classificationResult.summary,
          category: classificationResult.category,
          priority: classificationResult.priority,
          replySuggestions: summaryResult.replySuggestions,
        });

        // Automatically prepare reply with PDF content if extracted successfully
        if (hasPdfContent && summaryResult.replySuggestions.derja && onPrepareReply) {
          // Auto-prepare the Derja reply that includes PDF context
          onPrepareReply(summaryResult.replySuggestions.derja);
        }
      } catch (error) {
        console.error('Failed to get AI insights:', error);
        setAiError('Failed to load AI insights. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    getAIInsights();
  }, [mail, tone, lengthPref, extractAttachmentText, onPrepareReply, userName]);

  // Background: detect and remember project names from the email
  React.useEffect(() => {
    if (!mail) return;
    const text = `${mail.subject}\n${mail.body}`;
    rememberFromText(text, 'mail');
  }, [mail, rememberFromText]);

  const today = new Date();

  const handleCopyLink = React.useCallback(() => {
    try {
      const url = `${window.location.origin}/mail?select=${mail?.id}`;
      navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Message link copied to clipboard.' });
    } catch {}
  }, [mail, toast]);

  const handleDownload = React.useCallback(() => {
    if (!mail) return;
    const content = `From: ${mail.sender}\nSubject: ${mail.subject}\nDate: ${mail.date}\n\n${mail.body}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${mail.subject.replace(/[^a-z0-9\-\_ ]/gi, '').slice(0, 40) || 'message'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [mail]);

  const handlePrint = React.useCallback(() => {
    if (!mail) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
    if (!printWindow) return;
    const html = `<!doctype html><html><head><title>${mail.subject}</title></head><body>`+
      `<h3>${mail.subject}</h3><p><strong>From:</strong> ${mail.sender}</p><hr/>`+
      mail.body.split('\n').map(p => `<p>${p}</p>`).join('')+`</body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }, [mail]);

  const handleShare = React.useCallback(async () => {
    if (!mail) return;
    const shareData = { title: mail.subject, text: mail.body.slice(0, 200), url: `${window.location.origin}/mail?select=${mail.id}` } as any;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        toast({ title: 'Link copied', description: 'Sharing not supported; link copied instead.' });
      }
    } catch {}
  }, [mail, toast]);

  const handleArchive = React.useCallback(() => {
    if (!mail) return;
    try {
      // Simple client-side archive: move to Drafts section as a placeholder
      (mail as any).folder = 'drafts';
      toast({ title: 'Archived', description: 'Message moved to Drafts.' });
    } catch {}
  }, [mail, toast]);

  if (!mail) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center p-8 text-center"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto">
            <Mail className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No message selected</h3>
            <p className="text-sm text-muted-foreground">Choose a message from the list to view its content</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex h-full flex-col bg-background"
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {['Reply', 'Reply All', 'Forward'].map((item, index) => (
              <Tooltip key={item}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button variant="outline" size="sm">
                      {item === 'Reply' && <Reply className="h-4 w-4 mr-2" />}
                      {item === 'Reply All' && <ReplyAll className="h-4 w-4 mr-2" />}
                      {item === 'Forward' && <Forward className="h-4 w-4 mr-2" />}
                      {item}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{item}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onStar && (
                <DropdownMenuItem onClick={() => onStar(mail.id)}>
                  <Star className={cn("h-4 w-4 mr-2", mail.starred && "fill-current text-yellow-500")} />
                  {mail.starred ? 'Unstar message' : 'Star message'}
                </DropdownMenuItem>
              )}
              
              {activeFolder === 'trash' ? (
                <>
                  {onRestore && (
                    <DropdownMenuItem onClick={() => onRestore(mail.id)}>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Restore
                    </DropdownMenuItem>
                  )}
                  {onPermanentDelete && (
                    <DropdownMenuItem 
                      onClick={() => onPermanentDelete(mail.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete permanently
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(mail.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Move to trash
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          {mail.category && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {mail.category}
            </Badge>
          )}
          {mail.priority && (
            <Badge 
              variant="outline" 
              className={cn(
                "flex items-center gap-1",
                mail.priority === 'High' ? "text-red-500 border-red-200" : 
                mail.priority === 'Medium' ? "text-amber-500 border-amber-200" : 
                "text-green-500 border-green-200"
              )}
            >
              <Shield className="h-3 w-3" />
              {mail.priority}
            </Badge>
          )}

          {/* Tone and Length controls */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Select value={tone} onValueChange={(v) => setTone(v as any)}>
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lengthPref} onValueChange={(v) => setLengthPref(v as any)}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Short">Short</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Sender Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 p-6 border-b"
        >
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {mail.avatar}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-foreground">{mail.sender}</h2>
              {!mail.read && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-primary"
                />
              )}
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{mail.subject}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {mail.date}
              </span>
              <span>to me</span>
            </div>
          </div>
        </motion.div>

        {/* Message Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 p-6"
        >
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            {mail.body.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {/* AI Assistant Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 border-t bg-card/30 backdrop-blur-sm"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline text-foreground">AI Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Smart insights and reply suggestions</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Separator />
                    <Skeleton className="h-6 w-32" />
                    <div className="grid gap-2 md:grid-cols-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </motion.div>
                )}
                
                {aiError && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">AI Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{aiError}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setAiError(null);
                        setIsLoading(true);
                        // Retry AI insights
                        const getAIInsights = async () => {
                          if (!mail) return;
                          try {
                            const [summaryResult, classificationResult] = await Promise.all([
                              emailSummaryAndReplySuggestions({ emailBody: mail.body }),
                              classifyEmail({ emailContent: mail.body }),
                            ]);
                            setAiResult({
                              summary: classificationResult.summary,
                              category: classificationResult.category,
                              priority: classificationResult.priority,
                              replySuggestions: summaryResult.replySuggestions,
                            });
                          } catch (error) {
                            setAiError('Failed to load AI insights. Please try again.');
                          } finally {
                            setIsLoading(false);
                          }
                        };
                        getAIInsights();
                      }}
                    >
                      Retry
                    </Button>
                  </motion.div>
                )}
                
                {aiResult && !isLoading && !aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Category and Priority */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {aiResult.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "flex items-center gap-1",
                          aiResult.priority === 'High' ? "text-destructive-foreground bg-destructive/80" : 
                          aiResult.priority === 'Medium' ? "text-amber-800 bg-amber-400/80" : 
                          "text-green-800 bg-green-400/80"
                        )}
                      >
                        <Shield className="h-3 w-3" />
                        {aiResult.priority} Priority
                      </Badge>
                    </div>

                    {/* Summary */}
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2 text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Summary
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                        {aiResult.summary}
                      </p>
                    </div>

                    {/* Reply Suggestions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2 text-foreground">
                        <Languages className="h-4 w-4 text-primary" />
                        Suggested Replies
                      </h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          { lang: 'Derja', text: aiResult.replySuggestions.derja, flag: '🇹🇳' },
                          { lang: 'French', text: aiResult.replySuggestions.french, flag: '🇫🇷' },
                          { lang: 'English', text: aiResult.replySuggestions.english, flag: '🇺🇸' }
                        ].map((reply, index) => (
                          <motion.div
                            key={reply.lang}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                          >
                            <Card className="h-full hover:shadow-md transition-all bg-gradient-to-b from-card to-background border-border/60">
                              <CardContent className="p-0 h-full flex flex-col">
                                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg" aria-hidden>{reply.flag}</span>
                                    <span className="text-[11px] font-medium rounded-full px-2 py-1 bg-primary/10 text-primary uppercase tracking-wide">
                                      {reply.lang}
                                    </span>
                                  </div>
                                </div>
                                <div className="px-4 pb-4 flex-1">
                                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                                    {reply.text}
                                  </p>
                                </div>
                                <div className="px-4 py-3 border-t bg-card/40 flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3"
                                    onClick={() => {
                                      navigator.clipboard.writeText(reply.text);
                                      toast({ title: 'Copied', description: `${reply.lang} reply copied to clipboard.` });
                                    }}
                                    aria-label={`Copy ${reply.lang} reply`}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                  {onPrepareReply && (
                                    <Button 
                                      size="sm" 
                                      className="h-8 px-3"
                                      onClick={() => onPrepareReply(reply.text)}
                                      aria-label={`Prepare ${reply.lang} reply`}
                                    >
                                      Prepare
                                    </Button>
                                  )}
                                  {onPrepareReply && (
                                    <Button 
                                      size="sm" 
                                      variant="secondary"
                                      className="h-8 px-3"
                                      onClick={() => onPrepareReply(buildPrototype(reply.lang as 'Derja' | 'French' | 'English'))}
                                      aria-label={`Prototype ${reply.lang} reply`}
                                    >
                                      Prototype
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attachments */}
        { (mail as any)?.attachments && (mail as any).attachments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 border-t"
          >
            <h4 className="text-sm font-medium mb-2">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {(mail as any).attachments.map((att: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  disabled={attachLoading} 
                  onClick={async () => {
                    try {
                      setAttachLoading(true);
                      console.log('Extracting text from attachment:', att.filename);
                      const textContent = await extractAttachmentText(att);
                      console.log('Extracted text length:', textContent?.length || 0);
                      if (textContent && textContent.trim().length > 0) {
                        setAttachTextContent(textContent);
                        setAttachTextTitle(att.filename || `Attachment ${i+1}`);
                        setAttachTextOpen(true);
                      } else {
                        const errorMsg = (att.mimeType || '').includes('pdf') 
                          ? 'PDF appears to be image-based. Trying OCR fallback...' 
                          : 'Could not extract text from this attachment.';
                        toast({ 
                          title: 'No text found', 
                          description: errorMsg,
                          duration: 5000 
                        });
                        // If PDF, try OCR fallback one more time with better settings
                        if ((att.mimeType || '').includes('pdf')) {
                          setTimeout(async () => {
                            try {
                              const res = await fetch(`/api/mail/gmail/attachment?messageId=${encodeURIComponent(att.messageId)}&attachmentId=${encodeURIComponent(att.attachmentId)}`);
                              if (res.ok) {
                                const data = await res.json();
                                const base64 = (data.data || '').replace(/_/g, '/').replace(/-/g, '+');
                                const binary = atob(base64);
                                const bytes = new Uint8Array(binary.length);
                                for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
                                const pdfjs = await import('pdfjs-dist') as any;
                                // Force configure worker - override any existing settings
                                if (pdfjs.GlobalWorkerOptions) {
                                  const workerUrl = typeof window !== 'undefined' 
                                    ? `${window.location.origin}/pdf.worker.min.js`
                                    : '/pdf.worker.min.js';
                                  delete (pdfjs.GlobalWorkerOptions as any).workerSrc;
                                  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
                                }
                                const pdf = await pdfjs.getDocument({ data: bytes }).promise;
                                const page = await pdf.getPage(1);
                                const viewport = page.getViewport({ scale: 3.0 });
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d')!;
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                await page.render({ canvasContext: ctx as any, viewport }).promise;
                                const dataUrl = canvas.toDataURL('image/png');
                                const { recognize } = await import('tesseract.js');
                                const ocr = await recognize(dataUrl, 'eng', {});
                                if (ocr?.data?.text?.trim()) {
                                  setAttachTextContent(`--- OCR Extraction (Page 1) ---\n\n${ocr.data.text}`);
                                  setAttachTextTitle(att.filename || `Attachment ${i+1}`);
                                  setAttachTextOpen(true);
                                  toast({ title: 'Text extracted via OCR', description: 'Successfully extracted text using OCR.' });
                                }
                              }
                            } catch (ocrError) {
                              console.error('OCR fallback failed:', ocrError);
                            }
                          }, 1000);
                        }
                      }
                    } catch (error: any) {
                      console.error('Extraction error:', error);
                      toast({ 
                        title: 'Error', 
                        description: error?.message || 'Failed to extract text from attachment.',
                        variant: 'destructive'
                      });
                    } finally {
                      setAttachLoading(false);
                    }
                  }}
                >
                  {att.filename || `Attachment ${i+1}`} ({Math.round((att.size || 0)/1024)} KB) - Show Text
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Extracted Text Dialog */}
      <Dialog open={attachTextOpen} onOpenChange={setAttachTextOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
          <DialogHeader>
            <DialogTitle>Extracted Text from {attachTextTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="text-sm whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-lg border max-h-[60vh] overflow-y-auto">
              {attachTextContent || 'No text extracted.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
