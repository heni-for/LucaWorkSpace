import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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
                 <div className="h-[calc(100vh-10rem)] border rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <h3 className="text-lg font-semibold">Documents feature coming soon</h3>
                        <p className="text-sm">Create your first document to start building your knowledge base.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
