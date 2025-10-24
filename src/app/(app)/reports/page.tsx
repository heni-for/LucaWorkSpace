import { PageHeader } from "@/components/page-header";
import { ReportGenerator } from "./components/report-generator";

export default function ReportsPage() {
    return (
        <div>
            <PageHeader 
                title="AI Reports"
                description="Generate productivity reports with AI-powered insights."
            />
            <div className="p-4 lg:p-6 pt-0">
                <ReportGenerator />
            </div>
        </div>
    )
}
