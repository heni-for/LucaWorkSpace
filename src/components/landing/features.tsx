"use client";

import { BrainCircuit, Calendar, FileText, LayoutDashboard, ListChecks, Lock, Mail, Mic, BarChart3, Palette, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
        icon: LayoutDashboard,
        title: "Dashboard",
        description: "Personalized overview of tasks, emails, meetings, and AI-generated daily insights.",
    },
    {
        icon: Mic,
        title: "Voice Assistant (Derja)",
        description: "World’s first productivity assistant in Tunisian Arabic with 28+ voice commands.",
    },
    {
        icon: Mail,
        title: "Gmail Integration",
        description: "Real-time sync, smart filters, and AI summarization for your inbox.",
    },
    {
        icon: BrainCircuit,
        title: "AI-Powered Features",
        description: "Email classification, priority detection, and smart task creation from context.",
    },
    {
        icon: ListChecks,
        title: "Task Management",
        description: "Create, edit, and prioritize tasks with voice commands and progress analytics.",
    },
    {
        icon: FileText,
        title: "Notes System",
        description: "Rich text editor with Markdown support and voice note capabilities.",
    },
    {
        icon: Calendar,
        title: "Calendar Integration",
        description: "Schedule events, get reminders, and sync with external calendars like Google.",
    },
    {
        icon: BarChart3,
        title: "AI Reports",
        description: "Generate daily, weekly, or monthly productivity reports with Derja explanations.",
    },
    {
        icon: Lock,
        title: "Security & Privacy",
        description: "Firebase Authentication, Security Rules, and privacy-first data handling.",
    },
];

const colors = [
    { name: 'Primary', hex: '#E53935', className: 'bg-[#E53935]' },
    { name: 'Foreground', hex: '#1A1818', className: 'bg-[#1A1818]' },
    { name: 'Background', hex: '#F7F1EA', className: 'bg-[#F7F1EA] border' },
    { name: 'Card', hex: '#FFFCFA', className: 'bg-[#FFFCFA] border' },
    { name: 'Dark BG', hex: '#1C1917', className: 'bg-[#1C1917]' },
    { name: 'Dark Card', hex: '#221F1C', className: 'bg-[#221F1C]' },
    { name: 'Accent', hex: '#B72320', className: 'bg-[#B72320]' },
];

export function LandingFeatures() {
    return (
        <section id="features" className="container mx-auto px-4 py-16">
            <div className="text-center">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">An Intelligent Workspace</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Explore the core modules that make LUCA the ultimate productivity tool.
                </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.title} className="hover:border-primary/80 hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

             <Card className="mt-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                       <Palette className="h-7 w-7 text-primary" /> Design System
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        A clean, modern, and accessible design system inspired by Tunisian identity.
                        Features <span className="font-medium text-foreground">Plus Jakarta Sans</span> and <span className="font-medium text-foreground">Space Grotesk</span> typography.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
                        {colors.map((color) => (
                            <div key={color.name}>
                                <div className={`h-20 w-full rounded-lg ${color.className}`}></div>
                                <h4 className="mt-2 font-semibold">{color.name}</h4>
                                <p className="font-code text-sm text-muted-foreground">{color.hex}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
