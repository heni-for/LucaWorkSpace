import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function TeamPage() {
    return (
        <div>
            <PageHeader 
                title="Team Management"
                description="Invite and manage your workspace members."
                action={
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                }
            />
            <div className="p-4 lg:p-6 pt-0">
                <div className="h-[calc(100vh-10rem)] border rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <h3 className="text-lg font-semibold">Team management coming soon</h3>
                        <p className="text-sm">Invite your first team member to start collaborating.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
