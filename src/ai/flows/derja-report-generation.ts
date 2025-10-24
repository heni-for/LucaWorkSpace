'use server';

/**
 * @fileOverview A flow for generating reports in Tunisian Derja.
 *
 * - generateDerjaReport - A function that generates a productivity report in Tunisian Derja.
 * - GenerateDerjaReportInput - The input type for the generateDerjaReport function.
 * - GenerateDerjaReportOutput - The return type for the generateDerjaReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDerjaReportInputSchema = z.object({
  reportType: z
    .enum(['daily', 'weekly', 'monthly'])
    .describe('The type of report to generate (daily, weekly, monthly).'),
  emailSummary: z.string().describe('A summary of email activity for the reporting period.'),
  taskSummary: z.string().describe('A summary of task activity for the reporting period.'),
});
export type GenerateDerjaReportInput = z.infer<typeof GenerateDerjaReportInputSchema>;

const GenerateDerjaReportOutputSchema = z.object({
  report: z.string().describe('The generated productivity report in Tunisian Derja.'),
});
export type GenerateDerjaReportOutput = z.infer<typeof GenerateDerjaReportOutputSchema>;

export async function generateDerjaReport(
  input: GenerateDerjaReportInput
): Promise<GenerateDerjaReportOutput> {
  return generateDerjaReportFlow(input);
}

const derjaReportPrompt = ai.definePrompt({
  name: 'derjaReportPrompt',
  input: {schema: GenerateDerjaReportInputSchema},
  output: {schema: GenerateDerjaReportOutputSchema},
  prompt: `You are a helpful assistant that generates productivity reports in Tunisian Derja.

  Generate a {{reportType}} productivity report in Tunisian Derja based on the following summaries:

  Email Summary: {{{emailSummary}}}
  Task Summary: {{{taskSummary}}}

  Make sure the report is easy to understand for Tunisian professionals.
  `,
});

const generateDerjaReportFlow = ai.defineFlow(
  {
    name: 'generateDerjaReportFlow',
    inputSchema: GenerateDerjaReportInputSchema,
    outputSchema: GenerateDerjaReportOutputSchema,
  },
  async input => {
    const {output} = await derjaReportPrompt(input);
    return output!;
  }
);
