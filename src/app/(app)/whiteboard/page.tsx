import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
    Card,
    CardContent
  } from "@/components/ui/card"

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
            <div className="p-4 lg:p-6 pt-0">
                <Card className="h-[calc(100vh-10rem)]">
                    <CardContent className="p-4 h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <h3 className="text-lg font-semibold">Whiteboard coming soon</h3>
                            <p className="text-sm">Start a new board to begin visualizing your ideas.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
