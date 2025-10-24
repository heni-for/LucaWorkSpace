import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { VoiceAssistantProvider } from '@/components/voice/voice-assistant-provider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VoiceAssistantProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col">
          <AppHeader />
          <SidebarInset>
              <main className="flex-1">
                  {children}
              </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </VoiceAssistantProvider>
  );
}
