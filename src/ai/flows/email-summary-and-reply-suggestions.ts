'use server';

/**
 * @fileOverview Summarizes emails and suggests replies in Derja, French, or English.
 *
 * - emailSummaryAndReplySuggestions - A function that summarizes emails and suggests replies.
 * - EmailSummaryAndReplySuggestionsInput - The input type for the emailSummaryAndReplySuggestions function.
 * - EmailSummaryAndReplySuggestionsOutput - The return type for the emailSummaryAndReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailSummaryAndReplySuggestionsInputSchema = z.object({
  emailBody: z.string().describe('The body of the email to summarize and generate replies for.'),
});
export type EmailSummaryAndReplySuggestionsInput = z.infer<typeof EmailSummaryAndReplySuggestionsInputSchema>;

const EmailSummaryAndReplySuggestionsOutputSchema = z.object({
  summary: z.string().describe('A short summary of the email.'),
  replySuggestions: z.object({
    derja: z.string().describe('A suggested reply in Tunisian Arabic (Derja).'),
    french: z.string().describe('A suggested reply in French.'),
    english: z.string().describe('A suggested reply in English.'),
  }).describe('Suggested replies in different languages.'),
});
export type EmailSummaryAndReplySuggestionsOutput = z.infer<typeof EmailSummaryAndReplySuggestionsOutputSchema>;

export async function emailSummaryAndReplySuggestions(input: EmailSummaryAndReplySuggestionsInput): Promise<EmailSummaryAndReplySuggestionsOutput> {
  return emailSummaryAndReplySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emailSummaryAndReplySuggestionsPrompt',
  input: {schema: EmailSummaryAndReplySuggestionsInputSchema},
  output: {schema: EmailSummaryAndReplySuggestionsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing emails and generating reply suggestions in multiple languages.

  Given the following email body, provide a concise summary and suggest replies in Tunisian Arabic (Derja), French, and English.

  Email Body: {{{emailBody}}}

  Summary:
  {{output.summary}}

  Reply Suggestions:
  Derja: {{output.replySuggestions.derja}}
  French: {{output.replySuggestions.french}}
  English: {{output.replySuggestions.english}}
`,
});

const emailSummaryAndReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'emailSummaryAndReplySuggestionsFlow',
    inputSchema: EmailSummaryAndReplySuggestionsInputSchema,
    outputSchema: EmailSummaryAndReplySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
