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

const LucaLogo = () => (
    <div className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
      <Bot className="h-6 w-6"/>
      <span className="text-foreground">LUCA</span>
    </div>
);

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar side="left" variant="floating" collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex h-10 items-center justify-center px-2 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:px-0">
          <div className="group-data-[collapsible=icon]:hidden">
            <LucaLogo />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <Bot className="h-6 w-6 text-primary" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
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
      <SidebarFooter className="p-2">
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
