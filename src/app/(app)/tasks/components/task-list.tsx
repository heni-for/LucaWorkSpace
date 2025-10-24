import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import type { Task } from "@/lib/data"

type TaskListProps = {
    tasks: Task[];
}

const statusVariant = {
    "Todo": "secondary",
    "In Progress": "default",
    "Done": "outline",
} as const;

const priorityVariant = {
    "Low": "secondary",
    "Medium": "default",
    "High": "destructive",
} as const;


export function TaskList({ tasks }: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
        <CardDescription>A list of your recent tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
                <TableRow key={task.id}>
                    <TableCell>
                        <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{tasks.length}</strong> of <strong>{tasks.length}</strong> tasks
        </div>
      </CardFooter>
    </Card>
  )
}
