'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { notes } from "@/lib/data";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

export default function NotesPage() {
    return (
        <div>
            <PageHeader 
                title="Notes"
                description="Your personal space for ideas and thoughts."
                action={
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Note
                    </Button>
                }
            />
            <div className="p-4 lg:p-6 pt-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map(note => (
                    <Card key={note.id} className={note.color}>
                        <CardHeader>
                            <CardTitle>{note.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground">Last updated {note.lastUpdated}</p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
