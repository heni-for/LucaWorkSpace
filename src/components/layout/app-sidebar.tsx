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
  SidebarMenuSub,
  SidebarMenuSubButton,
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
    <Sidebar side="left" collapsible="icon" className="border-r border-sidebar-border/50">
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
            <Link href="/dashboard" passHref>
              <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/mail" passHref>
              <SidebarMenuButton asChild isActive={isActive('/mail')} tooltip="Mail">
                <Mail />
                <span>Mail</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/tasks" passHref>
              <SidebarMenuButton asChild isActive={isActive('/tasks')} tooltip="Tasks">
                <ListChecks />
                <span>Tasks</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/notes" passHref>
              <SidebarMenuButton asChild isActive={isActive('/notes')} tooltip="Notes">
                <FileText />
                <span>Notes</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/calendar" passHref>
              <SidebarMenuButton asChild isActive={isActive('/calendar')} tooltip="Calendar">
                <Calendar />
                <span>Calendar</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/reports" passHref>
              <SidebarMenuButton asChild isActive={isActive('/reports')} tooltip="Reports">
                <LineChart />
                <span>Reports</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton asChild tooltip="Help">
                <LifeBuoy />
                <span>Help</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="#" passHref>
              <SidebarMenuButton asChild tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
