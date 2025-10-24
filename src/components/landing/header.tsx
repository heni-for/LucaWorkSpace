"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { Bot, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
    { name: 'Overview', href: '#overview' },
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Strategy', href: '#business' },
];

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                isScrolled ? "border-b bg-background/80 backdrop-blur-sm" : "bg-transparent"
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
                    <Bot className="h-7 w-7 text-primary" />
                    <span className="text-foreground">LUCA</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => handleLinkClick(e, item.href)}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {item.name}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Link href="/dashboard" passHref>
                        <Button>Go to App</Button>
                    </Link>
                </div>

                <div className="md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex h-full flex-col p-6">
                                <div className="flex items-center justify-between">
                                    <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
                                        <Bot className="h-7 w-7 text-primary" />
                                        <span>LUCA</span>
                                    </Link>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <X className="h-6 w-6" />
                                        </Button>
                                    </SheetTrigger>
                                </div>
                                <nav className="mt-8 flex flex-col gap-4">
                                    {navItems.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            onClick={(e) => handleLinkClick(e, item.href)}
                                            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {item.name}
                                        </a>
                                    ))}
                                </nav>
                                <div className="mt-auto">
                                    <Link href="/dashboard" passHref>
                                        <Button className="w-full">Go to App</Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
