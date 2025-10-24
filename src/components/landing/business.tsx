"use client";

import { Award, Cloud, LineChart, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const scalabilityPhases = [
  {
    value: 'phase1',
    title: 'Phase 1 – MVP (0–2,000 users)',
    items: [
      'Host web app on Vercel',
      'MongoDB Atlas (free or shared tier)',
      'Azure TTS (limited usage)',
      'Gmail API for email operations',
      'Cost ≈ 20–30 DT / user / month (max)',
    ],
  },
  {
    value: 'phase2',
    title: 'Phase 2 – Growth (2,000–10,000 users)',
    items: [
      'Migrate backend to DigitalOcean / Hetzner VPS',
      'Use Docker containers & implement caching (Redis)',
      'API Gateway for load balancing',
      'Cost ≈ 10–15 DT / user',
    ],
  },
  {
    value: 'phase3',
    title: 'Phase 3 – Scale (10,000–1M users)',
    items: [
      'Microservices architecture (Node.js / Go)',
      'Scalable databases (MongoDB Cluster, Redis)',
      'CDN (Cloudflare) for static assets',
      'Edge compute for TTS and AI caching',
      'Cost ≈ <5 DT / user with optimized hosting',
    ],
  },
];

const costBreakdown = [
    { component: 'Server (VPS)', description: '8-core / 16GB RAM', cost: '220 DT' },
    { component: 'MongoDB Atlas', description: 'Shared cluster', cost: '80 DT' },
    { component: 'Azure TTS', description: '50 hrs Derja voice', cost: '100 DT' },
    { component: 'Gmail API (Free)', description: 'OAuth access', cost: '0 DT' },
    { component: 'Domain & SSL', description: 'luca.tn', cost: '40 DT' },
    { component: 'Backup + Security', description: 'Daily snapshots', cost: '30 DT' },
];

const differentiators = [
    {
        icon: (props: any) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.32 7.56c0-4.39 3.58-7.96 7.96-7.96 4.38 0 7.96 3.57 7.96 7.96 0 2.65-1.3 5.03-3.32 6.52-.4.3-1.28.13-1.53-.3l-1.3-2.26c-.25-.43-.82-.5-1.14-.13l-1.8 1.57c-1.32.73-2.97.22-3.7-.93L7.1 9.4c-.25-.4-.73-.55-1.14-.35l-1.46.79c-.18.1-.28.3-.28.52z" /><path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /><path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /><path d="M19.23 15.23a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /><path d="M19.23 15.23a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>,
        title: 'Native Tunisian Derja Voice Assistant',
        description: 'World\'s first productivity assistant that understands local dialect.',
    },
    {
        icon: Award,
        title: 'AI-Powered Workflow Automation',
        description: 'Intelligent email and task management that learns from your habits.',
    },
    {
        icon: ShieldCheck,
        title: 'Enterprise Security Standards',
        description: 'Built with data privacy and protection as a core principle.',
    },
    {
        icon: Cloud,
        title: 'Scalable Cloud-Ready Architecture',
        description: 'Designed to grow from a small team to millions of users seamlessly.',
    },
];

export function LandingBusiness() {
    return (
        <section id="business" className="container mx-auto px-4 py-16">
            <div className="text-center">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">Business & Strategy</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Our roadmap for growth, cost efficiency, and market differentiation.
                </p>
            </div>

            <Card className="mt-12">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                        <LineChart className="h-6 w-6 text-primary" /> Scalability Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="phase1" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            {scalabilityPhases.map(phase => (
                                <TabsTrigger key={phase.value} value={phase.value}>Phase {phase.value.slice(-1)}</TabsTrigger>
                            ))}
                        </TabsList>
                        {scalabilityPhases.map(phase => (
                            <TabsContent key={phase.value} value={phase.value}>
                                <Card className="border-0 shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{phase.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-muted-foreground">
                                            {phase.items.map((item, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            <div className="mt-8 grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Estimated Cost Breakdown</CardTitle>
                            <p className="text-sm text-muted-foreground">Per 2,000 users per month.</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Component</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Est. Monthly Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {costBreakdown.map((item) => (
                                        <TableRow key={item.component}>
                                            <TableCell className="font-medium">{item.component}</TableCell>
                                            <TableCell className="text-muted-foreground">{item.description}</TableCell>
                                            <TableCell className="text-right font-medium">{item.cost}</TableCell>
                                        </TableRow>
                                    ))}
                                     <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell className="text-right">≈ 470 DT/month</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Key Differentiators</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {differentiators.slice(0, 2).map((item) => (
                                <div key={item.title} className="flex items-start gap-4">
                                    <div className="mt-1 text-primary"><item.icon /></div>
                                    <div>
                                        <h4 className="font-semibold">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
