'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/layout/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { VoiceAssistantTrigger } from '@/components/voice/voice-assistant-trigger';

export function AppHeader() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    // Route to appropriate search based on current page
    if (pathname?.includes('/mail')) {
      // For mail, trigger mail search (could pass as URL param)
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: searchQuery, context: 'mail' } 
      }));
    } else if (pathname?.includes('/education')) {
      // For education, trigger education search
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: searchQuery, context: 'education' } 
      }));
    } else if (pathname?.includes('/documents')) {
      // For documents
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: searchQuery, context: 'documents' } 
      }));
    } else {
      // Global search - could redirect to a search results page
      window.dispatchEvent(new CustomEvent('global-search', { 
        detail: { query: searchQuery, context: 'global' } 
      }));
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
      <VoiceAssistantTrigger />
      <ThemeToggle />
      <UserNav />
    </header>
  );
}
