"use client";

import { BrainCircuit, Code, Database, MonitorSmartphone, Server, Settings, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const techStack = {
    frontend: {
        icon: MonitorSmartphone,
        title: "Frontend",
        items: [
            "Framework: Next.js 15.3 (App Router)",
            "Language: TypeScript 5",
            "UI Library: React 18.3",
            "Styling: Tailwind CSS + ShadCN UI",
            "State Management: Zustand",
            "Modes: Dark/Light themes",
            "Responsive: Mobile, tablet, desktop",
        ],
    },
    backend: {
        icon: Server,
        title: "Backend & Database",
        items: [
            "Cloud: Firebase (App Hosting, Functions)",
            "Database: Cloud Firestore (NoSQL)",
            "Scalability: Multi-region support",
            "Auth System: Firebase Authentication",
            "Security: Granular Firestore Security Rules",
            "Deployment: CI/CD via GitHub Actions",
        ],
    },
    ai: {
        icon: BrainCircuit,
        title: "AI & Voice Engine",
        items: [
            "Generative AI: Google Gemini Models",
            "AI Orchestration: Google Genkit",
            "Voice: Web Speech API & TTS",
            "Multilingual Support: Derja, French, English",
            "Features: Summarization, Classification, Voice",
        ],
    },
};

const devTools = {
    title: "DevOps & Tooling",
    icon: Settings,
    items: [
        "Node.js 20 LTS",
        "pnpm",
        "Visual Studio Code",
        "Firebase Local Emulator Suite",
        "Genkit Developer UI",
        "Postman for API testing",
        "Git + GitHub",
        "Figma for design collaboration",
    ],
}

const projectStructureCode = `
luca-platform/
├── src/
│   ├── app/                 # Next.js App Router (Pages & Layouts)
│   ├── components/          # Reusable UI components (ShadCN)
│   ├── lib/                 # Utilities, data, type definitions
│   ├── firebase/            # Firebase config, hooks, and services
│   ├── store/               # Zustand global state management
│   └── ai/                  # Genkit flows & AI logic
│
├── public/                  # Static assets (images, fonts)
│
├── firebase.json            # Firebase deployment config
└── backend.json             # Data structure definitions
`.trim();


export function LandingArchitecture() {
    return (
        <section id="architecture" className="container mx-auto px-4 py-16">
            <div className="text-center">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">Built for Scale, Security & Intelligence</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    A robust, enterprise-grade stack on Google Cloud, designed to serve millions of users.
                </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
                {Object.values(techStack).map((tech) => (
                    <Card key={tech.title} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                <tech.icon className="h-6 w-6" />
                            </div>
                            <CardTitle className="font-headline">{tech.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-2 text-muted-foreground">
                                {tech.items.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <devTools.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline">{devTools.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="columns-2 space-y-2 text-muted-foreground">
                            {devTools.items.map((item, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary/50"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <Code className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline">Project Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs font-code text-muted-foreground">
                            <code>{projectStructureCode}</code>
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
