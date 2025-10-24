'use server';

/**
 * @fileOverview Classifies emails into categories (Work, Personal, Promotions) and detects their priority (High, Medium, Low).
 *
 * - classifyEmail - A function that handles the email classification and priority detection process.
 * - ClassifyEmailInput - The input type for the classifyEmail function.
 * - ClassifyEmailOutput - The return type for the classifyEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyEmailInputSchema = z.object({
  emailContent: z
    .string()
    .describe('The content of the email to be classified.'),
});
export type ClassifyEmailInput = z.infer<typeof ClassifyEmailInputSchema>;

const ClassifyEmailOutputSchema = z.object({
  category: z
    .enum(['Work', 'Personal', 'Promotions'])
    .describe('The category of the email.'),
  priority: z
    .enum(['High', 'Medium', 'Low'])
    .describe('The priority of the email.'),
  summary: z.string().describe('A short summary of the email content.'),
});
export type ClassifyEmailOutput = z.infer<typeof ClassifyEmailOutputSchema>;

export async function classifyEmail(input: ClassifyEmailInput): Promise<ClassifyEmailOutput> {
  return classifyEmailFlow(input);
}

const classifyEmailPrompt = ai.definePrompt({
  name: 'classifyEmailPrompt',
  input: {schema: ClassifyEmailInputSchema},
  output: {schema: ClassifyEmailOutputSchema},
  prompt: `You are an AI assistant specializing in email classification and priority detection. Analyze the email content provided and determine its category (Work, Personal, or Promotions) and priority (High, Medium, or Low). Also, provide a short summary of the email content.\n\nEmail Content: {{{emailContent}}}\n\nCategory: {{output.category}}\nPriority: {{output.priority}}\nSummary: {{output.summary}}`,
});

const classifyEmailFlow = ai.defineFlow(
  {
    name: 'classifyEmailFlow',
    inputSchema: ClassifyEmailInputSchema,
    outputSchema: ClassifyEmailOutputSchema,
  },
  async input => {
    const {output} = await classifyEmailPrompt(input);
    return output!;
  }
);
