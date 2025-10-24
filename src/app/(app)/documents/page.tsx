import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { documents } from "@/lib/data";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DocumentsPage() {
    return (
        <div>
            <PageHeader 
                title="Documents"
                description="Create and manage your team's knowledge base."
                action={
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Document
                    </Button>
                }
            />
            <div className="p-4 lg:p-6 pt-0">
                 <Card>
                    <CardHeader>
                        <CardTitle>All Documents</CardTitle>
                        <CardDescription>A list of all documents in your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.title}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{doc.author.avatar}</AvatarFallback>
                                                </Avatar>
                                                <span>{doc.author.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-muted-foreground">{doc.createdAt}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>View</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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