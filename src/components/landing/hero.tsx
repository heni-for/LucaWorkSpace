import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot } from 'lucide-react';
import Image from 'next/image';

export function LandingHero() {
    return (
        <section id="overview" className="relative overflow-hidden bg-card">
            <div className="container mx-auto px-4 py-20 text-center lg:py-32">
                 <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                 <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"></div>
                 
                <div className="mx-auto max-w-4xl">
                    <h1 className="font-headline text-4xl font-extrabold tracking-tight lg:text-5xl">
                        LUCA Platform Report (2025)
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground">
                        A groundbreaking AI-powered productivity workspace designed to transform how Tunisian professionals and Arabic speakers manage daily work.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/dashboard" passHref>
                            <Button size="lg">
                                Explore The App <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <a href="#features">
                        <Button size="lg" variant="ghost">
                            Learn More
                        </Button>
                        </a>
                    </div>
                </div>

                <div className="relative mx-auto mt-16 max-w-5xl">
                     <Image 
                        src="https://picsum.photos/seed/dashboard-shot/1200/700"
                        alt="LUCA Dashboard Screenshot"
                        width={1200}
                        height={700}
                        className="rounded-xl border shadow-2xl shadow-primary/10"
                        data-ai-hint="dashboard screenshot"
                        priority
                    />
                    <div className="absolute -bottom-4 -right-4 hidden lg:block">
                        <div className="relative h-32 w-32">
                             <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                             <div className="absolute inset-4 flex items-center justify-center rounded-full bg-primary/80 text-primary-foreground backdrop-blur-sm">
                                <Bot className="h-10 w-10" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-24 max-w-2xl">
                    <h2 className="font-headline text-2xl font-bold">Mission Statement</h2>
                    <p className="mt-4 text-muted-foreground">
                        To empower Tunisian professionals with an AI-driven assistant that speaks their language, understands their culture, and helps them work smarter — not harder.
                    </p>
                </div>
            </div>
        </section>
    );
}
