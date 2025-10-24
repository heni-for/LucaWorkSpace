import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { calendarEvents } from "@/lib/data";

const eventTypeColor = {
    meeting: 'bg-primary',
    reminder: 'bg-amber-500',
    event: 'bg-green-500'
};

export default function CalendarPage() {
    return (
        <div>
            <PageHeader 
                title="Calendar"
                description="Manage your schedule and events."
                action={
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Event
                    </Button>
                }
            />
             <div className="p-4 lg:p-6 pt-0 grid gap-4 md:grid-cols-[1fr_350px]">
                <Card>
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="p-3 w-full"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>What's on your schedule today.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {calendarEvents.map(event => (
                            <div key={event.id} className="flex items-start gap-3">
                                <div className={`mt-1 h-3 w-3 rounded-full ${eventTypeColor[event.type]}`} />
                                <div className="space-y-1">
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Clock className="mr-1.5 h-3 w-3" />
                                        {event.time} ({event.duration})
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
