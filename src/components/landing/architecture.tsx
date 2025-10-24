"use client";

import { BrainCircuit, Code, Database, MonitorSmartphone, Server, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const techStack = {
    frontend: {
        icon: MonitorSmartphone,
        title: "Frontend",
        items: [
            "Framework: Next.js 15.3 (App Router)",
            "Language: TypeScript 5",
            "UI Library: React 18.3",
            "Styling: Tailwind CSS + Radix UI",
            "Design System: Plus Jakarta Sans",
            "Modes: Dark/Light themes",
            "Responsive: Mobile, tablet, desktop",
        ],
    },
    backend: {
        icon: Server,
        title: "Backend",
        items: [
            "Database: MongoDB (Mongoose)",
            "API Type: RESTful with Express",
            "Auth System: NextAuth.js",
            "Security: JWT, bcrypt, rate limiting",
            "AI Layer: Google Genkit 1.20",
        ],
    },
    ai: {
        icon: BrainCircuit,
        title: "AI & Voice",
        items: [
            "Speech-to-Text: Web Speech API",
            "Text-to-Speech: Azure Speech Services",
            "Local Voice Option: Microsoft Edge TTS",
            "Language Support: Derja, French, English",
        ],
    },
};

const devTools = {
    title: "Development Environment",
    icon: Settings,
    items: [
        "Node.js 20 LTS",
        "pnpm",
        "Visual Studio Code",
        "MongoDB Community Edition",
        "MongoDB Compass",
        "Postman",
        "Git + GitHub",
        "Figma",
        "Python + Edge TTS",
    ],
}

const projectStructureCode = `
luca-platform/
├── frontend/                # Next.js app
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI elements
│   ├── contexts/            # App contexts (auth, AI)
│   ├── hooks/               # Custom React hooks
│   └── public/              # Static assets
│
├── backend/                 # API & services
│   ├── routes/              # API routes
│   ├── models/              # MongoDB models
│   ├── controllers/         # Logic layers
│   └── services/            # Gmail, AI, TTS services
│
├── ai/                      # AI and Derja processing
│   ├── genkit/              # Google Genkit pipelines
│   ├── models/              # AI logic (summaries, etc)
│   └── voice/               # Voice assistant
│
└── docs/                    # Documentation
`.trim();


export function LandingArchitecture() {
    return (
        <section id="architecture" className="container mx-auto px-4 py-16">
            <div className="text-center">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">Architecture & Technology</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    A robust, scalable, and modern stack built for performance and intelligence.
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
