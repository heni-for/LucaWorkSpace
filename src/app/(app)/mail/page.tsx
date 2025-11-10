'use client';

import * as React from 'react';
import { Mail, Inbox, Send, File, Star, Trash2, Plus, Search, Filter, MoreHorizontal, RefreshCw, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MailList } from '@/app/(app)/mail/components/mail-list';
import { MailDisplay } from '@/app/(app)/mail/components/mail-display';
import { emails } from '@/lib/data';
import type { Email } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';

export default function MailPage() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [activeFolder, setActiveFolder] = React.useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showCompose, setShowCompose] = React.useState(false);
  const [composeBody, setComposeBody] = React.useState('');
  const [composeSubject, setComposeSubject] = React.useState('');
  const [isConnectingGoogle, setIsConnectingGoogle] = React.useState(false);
  const [isConnectingMicrosoft, setIsConnectingMicrosoft] = React.useState(false);
  const [googleConnected, setGoogleConnected] = React.useState(false);
  const [microsoftConnected, setMicrosoftConnected] = React.useState(false);
  const [remoteEmails, setRemoteEmails] = React.useState<Email[] | null>(null);
  const selectedEmail = React.useMemo(() => {
    const source = remoteEmails ?? emails;
    return source.find((item) => item.id === selected) || null;
  }, [selected, remoteEmails]);

  // Check connection status on mount and from URL params
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'google_connected') {
      setGoogleConnected(true);
    }
    if (auth === 'ms_connected') {
      setMicrosoftConnected(true);
    }
    // Also check cookie directly
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/mail/gmail', { cache: 'no-store' });
        if (res.ok || res.status === 401) {
          if (res.status !== 401) setGoogleConnected(true);
        }
      } catch {}
    };
    checkConnection();
  }, []);

  // Fetch real Gmail messages when connected
  React.useEffect(() => {
    const loadGmail = async () => {
      if (!googleConnected) return;
      try {
        const res = await fetch('/api/mail/gmail', { cache: 'no-store' });
        if (!res.ok) {
          console.error('Gmail fetch failed:', res.status, await res.text().catch(() => ''));
          if (res.status === 401) setGoogleConnected(false);
          return;
        }
        const data = await res.json();
        console.log('Gmail data received:', data);
        const mapped: Email[] = (data.messages || []).map((m: any, idx: number) => ({
          id: m.id || `gmail-${idx}`,
          sender: m.sender || 'Unknown',
          avatar: (m.sender || '?').split(' ')[0]?.[0]?.toUpperCase() || 'U',
          subject: m.subject || '(no subject)',
          body: m.snippet || m.body || '',
          date: m.date || new Date().toISOString(),
          read: true,
          starred: false,
          folder: 'inbox',
          category: 'Work',
          priority: 'Medium',
          // @ts-ignore - augmenting shape with attachments
          attachments: m.attachments || [],
        }));
        if (mapped.length > 0) {
          setRemoteEmails(mapped);
          setSelected(prev => prev || mapped[0]?.id || null);
        }
      } catch (e) {
        console.error('Gmail load error:', e);
      }
    };
    loadGmail();
  }, [googleConnected]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (googleConnected) {
      try {
        const res = await fetch('/api/mail/gmail', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const mapped: Email[] = (data.messages || []).map((m: any, idx: number) => ({
            id: m.id || `gmail-${idx}`,
            sender: m.sender || 'Unknown',
            avatar: (m.sender || '?').split(' ')[0]?.[0]?.toUpperCase() || 'U',
            subject: m.subject || '(no subject)',
            body: m.snippet || m.body || '',
            date: m.date || new Date().toISOString(),
            read: true,
            starred: false,
            folder: 'inbox',
            category: 'Work',
            priority: 'Medium',
          }));
          setRemoteEmails(mapped);
        }
      } catch {}
    }
    setIsRefreshing(false);
  };

  const handleCompose = () => {
    setComposeSubject(selectedEmail ? `Re: ${selectedEmail.subject}` : 'New Message');
    setComposeBody('');
    setShowCompose(true);
  };

  const handleFilter = () => {
    // TODO: Implement filter modal
    console.log('Filter clicked');
  };

  const handlePrepareReply = (text: string) => {
    setComposeSubject(selectedEmail ? `Re: ${selectedEmail.subject}` : 'Reply');
    setComposeBody(text);
    setShowCompose(true);
  };

  const handleConnectGoogle = async () => {
    try {
      setIsConnectingGoogle(true);
      window.location.href = '/api/auth/google';
    } finally {
      // Flag will reset after redirect; this is just for UX in case of SPA navigation
      setTimeout(() => setIsConnectingGoogle(false), 2000);
    }
  };

  const handleConnectMicrosoft = async () => {
    try {
      setIsConnectingMicrosoft(true);
      window.location.href = '/api/auth/microsoft';
    } finally {
      setTimeout(() => setIsConnectingMicrosoft(false), 2000);
    }
  };

  const handleEmailSelect = (id: string) => {
    setSelected(id);
    // Mark email as read when selected
    const source = remoteEmails ?? emails;
    const email = source.find(e => e.id === id);
    if (email && !email.read) {
      email.read = true;
      if (remoteEmails) {
        setRemoteEmails([...remoteEmails]);
      }
    }
  };

  const handleStarEmail = (id: string) => {
    const source = remoteEmails ?? emails;
    const email = source.find(e => e.id === id);
    if (email) {
      email.starred = !email.starred;
      if (remoteEmails) {
        setRemoteEmails([...remoteEmails]);
      }
    }
  };

  const handleDeleteEmail = (id: string) => {
    const source = remoteEmails ?? emails;
    const email = source.find(e => e.id === id);
    if (email) {
      email.folder = 'trash';
      if (remoteEmails) {
        setRemoteEmails([...remoteEmails]);
      }
      // If the deleted email was selected, clear selection
      if (selected === id) {
        setSelected(null);
      }
    }
  };

  const handleRestoreEmail = (id: string) => {
    const source = remoteEmails ?? emails;
    const email = source.find(e => e.id === id);
    if (email) {
      email.folder = 'inbox';
      if (remoteEmails) {
        setRemoteEmails([...remoteEmails]);
      }
    }
  };

  const handlePermanentDelete = (id: string) => {
    if (remoteEmails) {
      const filtered = remoteEmails.filter(e => e.id !== id);
      setRemoteEmails(filtered);
    } else {
      const emailIndex = emails.findIndex(e => e.id === id);
      if (emailIndex !== -1) {
        emails.splice(emailIndex, 1);
      }
    }
    // If the deleted email was selected, clear selection
    if (selected === id) {
      setSelected(null);
    }
  };

  const filteredEmails = React.useMemo(() => {
    let source = remoteEmails ?? emails;
    let filtered = source;
    
    // If searching, search across ALL folders (global search)
    if (searchQuery) {
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Only filter by folder when NOT searching
      if (activeFolder === 'starred') {
        filtered = filtered.filter(email => email.starred);
      } else if (activeFolder !== 'inbox') {
        filtered = filtered.filter(email => email.folder === activeFolder);
      } else {
        filtered = filtered.filter(email => email.folder === 'inbox');
      }
    }
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(email => !email.read);
    }
    
    return filtered;
  }, [searchQuery, activeTab, activeFolder, remoteEmails]);

  // Auto-select first email when emails load
  React.useEffect(() => {
    if (!selected && filteredEmails.length > 0) {
      setSelected(filteredEmails[0].id);
    }
  }, [filteredEmails.length]);

  // Listen for global search events from header
  React.useEffect(() => {
    const handleGlobalSearch = (event: any) => {
      const { query, context } = event.detail || {};
      
      if (context === 'mail' && query) {
        setSearchQuery(query);
      }
    };

    window.addEventListener('global-search', handleGlobalSearch as EventListener);
    
    return () => {
      window.removeEventListener('global-search', handleGlobalSearch as EventListener);
    };
  }, []);

  const sourceEmails = remoteEmails ?? emails;
  const unreadCount = sourceEmails.filter(e => !e.read && e.folder === 'inbox').length;
  const starredCount = sourceEmails.filter(e => e.starred).length;
  const sentCount = sourceEmails.filter(e => e.folder === 'sent').length;
  const draftsCount = sourceEmails.filter(e => e.folder === 'drafts').length;
  const trashCount = sourceEmails.filter(e => e.folder === 'trash').length;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold">Mailbox</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <Button
              variant={googleConnected ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
            >
              <Globe className="h-4 w-4 mr-2" />
              {googleConnected ? 'Gmail Connected' : isConnectingGoogle ? 'Connecting…' : 'Connect Gmail'}
            </Button>
            <Button
              variant={microsoftConnected ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleConnectMicrosoft}
              disabled={isConnectingMicrosoft}
            >
              <Globe className="h-4 w-4 mr-2" />
              {microsoftConnected ? 'Outlook Connected' : isConnectingMicrosoft ? 'Connecting…' : 'Connect Outlook'}
            </Button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh mailbox</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </TooltipTrigger>
            <TooltipContent>Filter messages</TooltipContent>
          </Tooltip>
          
          <Button size="sm" onClick={handleCompose}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </motion.div>

      <TooltipProvider delayDuration={0}>
        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-64 border-r bg-card/30 backdrop-blur-sm flex flex-col"
          >
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search messages..." 
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <motion.button
                onClick={() => setActiveFolder('inbox')}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all group w-full text-left ${
                  activeFolder === 'inbox' 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Inbox className="h-5 w-5" />
                <span className="font-medium">Inbox</span>
                <Badge variant="secondary" className={`ml-auto ${
                  activeFolder === 'inbox' 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {unreadCount}
                </Badge>
              </motion.button>
              
              {[
                { icon: Star, label: 'Starred', count: starredCount, folder: 'starred' as const },
                { icon: Send, label: 'Sent', count: sentCount, folder: 'sent' as const },
                { icon: File, label: 'Drafts', count: draftsCount, folder: 'drafts' as const },
                { icon: Trash2, label: 'Trash', count: trashCount, folder: 'trash' as const }
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => setActiveFolder(item.folder)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all group w-full text-left ${
                    activeFolder === item.folder 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.count > 0 && (
                    <Badge variant="outline" className={`ml-auto ${
                      activeFolder === item.folder 
                        ? 'bg-primary-foreground text-primary border-primary-foreground' 
                        : ''
                    }`}>
                      {item.count}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex flex-1">
            {/* Email List */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-80 border-r bg-card/20 backdrop-blur-sm flex flex-col"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      All
                      <Badge variant="outline" className="text-xs">
                        {(remoteEmails ?? emails).length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="flex items-center gap-2">
                      Unread
                      <Badge variant="outline" className="text-xs">
                        {unreadCount}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="flex-1 overflow-hidden">
                  <MailList 
                    items={filteredEmails} 
                    onSelect={handleEmailSelect} 
                    selected={selected}
                    onStar={handleStarEmail}
                    onDelete={handleDeleteEmail}
                    onRestore={handleRestoreEmail}
                    onPermanentDelete={handlePermanentDelete}
                    activeFolder={activeFolder}
                  />
                </TabsContent>
                <TabsContent value="unread" className="flex-1 overflow-hidden">
                  <MailList 
                    items={filteredEmails.filter((item) => !item.read)} 
                    onSelect={handleEmailSelect} 
                    selected={selected}
                    onStar={handleStarEmail}
                    onDelete={handleDeleteEmail}
                    onRestore={handleRestoreEmail}
                    onPermanentDelete={handlePermanentDelete}
                    activeFolder={activeFolder}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Email Display */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <AnimatePresence mode="wait">
                <MailDisplay 
                  key={selected} 
                  mail={selectedEmail}
                  onStar={handleStarEmail}
                  onDelete={handleDeleteEmail}
                  onRestore={handleRestoreEmail}
                  onPermanentDelete={handlePermanentDelete}
                  activeFolder={activeFolder}
                  onPrepareReply={handlePrepareReply}
                />
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </TooltipProvider>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compose</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Subject"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />
            <Textarea
              placeholder="Write your message..."
              className="min-h-[200px]"
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={() => { setShowCompose(false); }}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
