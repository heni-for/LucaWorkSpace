import { Bot } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="border-t bg-card">
            <div className="container mx-auto px-4 py-16 text-center">
                 <div className="mx-auto max-w-4xl">
                    <h2 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">
                        A Cultural and Technological Innovation
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        LUCA Platform is not just another productivity app — it’s a cultural and technological innovation. By merging AI automation, Tunisian linguistic localization, and enterprise-level functionality, LUCA offers an intelligent workspace that truly understands its users.
                    </p>
                    <p className="mt-4 font-semibold text-foreground">
                        LUCA stands as the first step toward a Tunisian AI ecosystem, built by Tunisians, for Tunisians — and scalable to the world.
                    </p>
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                     <div className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
                        <Bot className="h-6 w-6"/>
                        <span className="text-foreground">LUCA PLATFORM</span>
                    </div>
                    <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LUCA Platform. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
