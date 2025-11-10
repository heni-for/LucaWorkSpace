'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { QuizRequest, QuizResponse } from '@/types/education';

const QuizInputSchema = z.object({
  text: z.string(),
  count: z.number().int().min(3).max(10).default(5),
});

const QuizOutputSchema = z.object({
  questions: z.array(z.object({ id: z.string(), question: z.string(), choices: z.array(z.string()).optional(), answer: z.string().optional() })),
});

export async function generateQuiz(input: QuizRequest): Promise<QuizResponse> {
  return quizFlow({ text: input.text, count: input.count ?? 5 });
}

const prompt = ai.definePrompt({
  name: 'educationQuizDerja',
  input: { schema: QuizInputSchema },
  output: { schema: QuizOutputSchema },
  prompt: `Inti LUCA, mfassar b Derja. Bni quiz pédagogique w mchayyin 3la text el cours.

Text el cours:
{{{text}}}

Nombre d'as2ila: {{count}} (entre 3 w 10)

Instructions:
1) A3mel as2ila b Derja naturel (kif yasklou fi classe)
2) Kol question y7taj jwab sarih w mafhum
3) Idha MCQ: 3-4 choices, kol wahda mchayla
4) Idha short answer: question directe
5) Include answer (b Derja) bch y3ref chnowa el jawab s7i7
6) As2ila yjibou concepts el mohima, machi details sghira

Style:
- Questions kif: "Chnowa ta3ni...?", "Kifch...?", "Chnowa far9 ben...?"
- Natural Derja, machi rasmi
- Focus 3la el mohim w el concepts el ahem

Questions:
{{output.questions}}
`,
});

const quizFlow = ai.defineFlow(
  { name: 'educationQuizFlow', inputSchema: QuizInputSchema, outputSchema: QuizOutputSchema },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch {
      return { questions: [
        { id: '1', question: 'Chnowa el far9 bin AM w FM?', choices: ['Amplitude', 'Frequency'], answer: 'Amplitude vs Frequency' },
        { id: '2', question: 'Na3mlou parity 3lech?', answer: 'Besh nkashfou les erreurs' },
      ] };
    }
  },
);


