import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Lightbulb, Bot, CheckCircle, Mail, Calendar as CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { tasks, emails, calendarEvents } from "@/lib/data";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export default function DashboardPage() {
    const greeting = getGreeting();
    const unreadEmails = emails.filter(e => !e.read).length;
    const tasksDone = tasks.filter(t => t.status === 'Done').length;
    const taskProgress = (tasksDone / tasks.length) * 100;

  return (
    <div className="flex-1 space-y-4">
        <PageHeader 
            title={`${greeting}, Luca`}
            description="Here’s your productivity snapshot for today."
            action={<Button>
                <Bot className="mr-2 h-4 w-4" /> Ask LUCA
            </Button>}
        />
        <div className="grid gap-4 p-4 lg:p-6 pt-0 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasks Progress</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tasksDone}/{tasks.length} Done</div>
                    <Progress value={taskProgress} className="mt-2 h-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{unreadEmails}</div>
                    <p className="text-xs text-muted-foreground">
                        {unreadEmails > 0 ? `You have ${unreadEmails} new messages.` : 'Inbox is clear!'}
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Meetings</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{calendarEvents.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Next up: Daily Standup at 9:00 AM
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Daily Insight</CardTitle>
                    <Lightbulb className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-sm font-medium">Focus on Project Phoenix; you have 2 high-priority items related to it.</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 p-4 lg:p-6 pt-0 lg:grid-cols-2">
             <Card>
                 <CardHeader>
                    <CardTitle>Recent Emails</CardTitle>
                    <CardDescription>Your most recent messages at a glance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {emails.slice(0, 3).map((email) => (
                        <div key={email.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{email.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{email.sender}</p>
                                <p className="text-sm text-muted-foreground">{email.subject}</p>
                            </div>
                            <div className="ml-auto text-xs text-muted-foreground">{email.date}</div>
                        </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>High-Priority Tasks</CardTitle>
                    <CardDescription>What you should focus on next.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {tasks.filter(t => t.priority === 'High').slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-start">
                             <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary/10">
                                 <CheckCircle className="h-3 w-3 text-primary" />
                             </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{task.title}</p>
                                <p className="text-sm text-muted-foreground">Due in {task.dueDate}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto">
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
