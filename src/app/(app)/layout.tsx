import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { VoiceAssistantProvider } from '@/components/voice/voice-assistant-provider';
// import { AgentProvider } from '@/components/ai/agent-provider'; // DISABLED - Using new LUCA voice assistant to prevent conflicts

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // AgentProvider DISABLED to prevent old derjaAgent conflicts with new LUCA system
    <VoiceAssistantProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <div className="flex flex-col">
              <AppHeader />
              <main className="flex-1">
                  {children}
              </main>
            </div>
        </SidebarInset>
      </SidebarProvider>
    </VoiceAssistantProvider>
  );
}
