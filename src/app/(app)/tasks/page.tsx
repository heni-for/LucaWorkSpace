import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { tasks } from "@/lib/data";
import { TaskList } from "./components/task-list";

export default function TasksPage() {
    return (
        <div>
            <PageHeader 
                title="Tasks"
                description="Manage your projects and to-do lists."
                action={
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                }
            />
            <div className="p-4 lg:p-6 pt-0">
               <TaskList tasks={tasks} />
            </div>
        </div>
    )
}
