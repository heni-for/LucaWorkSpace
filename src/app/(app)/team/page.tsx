import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, UserPlus } from "lucide-react";
import { teamMembers } from "@/lib/data";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeamPage() {
    return (
        <div>
            <PageHeader 
                title="Team"
                description="Invite and manage your workspace members."
                action={
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                }
            />
            <div className="p-4 lg:p-6 pt-0">
                 <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage who has access to this workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamMembers.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{member.avatar}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={member.role === 'Owner' ? 'default' : 'secondary'}>{member.role}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                             <Badge variant={member.status === 'Active' ? 'outline' : 'secondary'}>{member.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>Manage permissions</DropdownMenuItem>
                                                    <DropdownMenuItem>Resend invitation</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Remove from team</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
}