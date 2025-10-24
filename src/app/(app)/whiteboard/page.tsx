import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { whiteboards } from "@/lib/data";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WhiteboardPage() {
    return (
        <div>
            <PageHeader 
                title="Whiteboard"
                description="Your creative canvas for ideas, diagrams, and collaboration."
                action={
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Board
                    </Button>
                }
            />
            <div className="p-4 lg:p-6 pt-0 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {whiteboards.map((board) => (
                    <Card key={board.id}>
                        <CardHeader className="p-0">
                           <Image 
                             src={board.thumbnailUrl}
                             alt={board.title}
                             width={600}
                             height={400}
                             className="rounded-t-lg object-cover aspect-[3/2]"
                             data-ai-hint="whiteboard abstract"
                           />
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="text-lg">{board.title}</CardTitle>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center p-4 pt-0">
                            <p className="text-sm text-muted-foreground">
                                Modified {board.lastModified}
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Rename</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}