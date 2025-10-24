"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Download, Loader2 } from "lucide-react";
import { generateDerjaReport } from "@/ai/flows";

export function ReportGenerator() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport(null);
    try {
      // In a real app, these summaries would be dynamically generated.
      const emailSummary = "Managed 25 emails, 5 high-priority, 10 work-related.";
      const taskSummary = "Completed 3 tasks, 2 remain in progress.";

      const result = await generateDerjaReport({
        reportType,
        emailSummary,
        taskSummary,
      });
      setReport(result.report);
    } catch (error) {
      console.error("Failed to generate report:", error);
      setReport("Sorry, I couldn't generate the report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Select the type of report you want LUCA to generate in Tunisian Derja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select onValueChange={(value: "daily" | "weekly" | "monthly") => setReportType(value)} defaultValue={reportType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[200px]">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Report</CardTitle>
                <CardDescription>Your AI-powered productivity summary.</CardDescription>
            </div>
            <Button variant="outline" size="sm" disabled={!report}>
                <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && !report && (
             <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
                <p>Your report will appear here once generated.</p>
            </div>
          )}
          {report && <p className="whitespace-pre-wrap">{report}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
