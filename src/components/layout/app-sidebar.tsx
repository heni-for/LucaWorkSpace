'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Mail,
  ListChecks,
  FileText,
  Calendar,
  LineChart,
  Settings,
  Bot,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '../ui/button';

const LucaLogo = () => (
    <div className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
      <Bot className="h-6 w-6"/>
      <span className="text-foreground">LUCA</span>
    </div>
);

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <Sidebar side="left" variant="inset" collapsible="icon" className="group/sidebar">
      <SidebarHeader className='p-4'>
        <div className="flex h-10 items-center justify-between">
          <div className="group-data-[collapsible=icon]:hidden">
            <LucaLogo />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
             <Bot className="h-7 w-7 text-primary" />
          </div>
           <SidebarTrigger asChild className="group-data-[collapsible=icon]:hidden">
            <Button variant="ghost" size="icon" className='h-7 w-7' />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarRail />
      <SidebarContent className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard" isActive={isActive('/dashboard')} tooltip="Dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/mail" isActive={isActive('/mail')} tooltip="Mail">
              <Mail />
              <span>Mail</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/tasks" isActive={isActive('/tasks')} tooltip="Tasks">
              <ListChecks />
              <span>Tasks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/notes" isActive={isActive('/notes')} tooltip="Notes">
              <FileText />
              <span>Notes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/calendar" isActive={isActive('/calendar')} tooltip="Calendar">
              <Calendar />
              <span>Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/reports" isActive={isActive('/reports')} tooltip="Reports">
              <LineChart />
              <span>Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Help">
              <LifeBuoy />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
