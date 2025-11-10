'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ExplainRequest, ExplainResponse } from '@/types/education';

const ExplainInputSchema = z.object({
  text: z.string(),
  focus: z.string().optional(),
  style: z.enum(['fala9i', 'formal']).optional(),
  depth: z.enum(['quick', 'normal', 'deep']).optional(),
});

const ExplainOutputSchema = z.object({
  outline: z.array(z.string()),
  explanation: z.string(),
});

export async function explainInDerja(input: ExplainRequest): Promise<ExplainResponse> {
  return explainFlow(input);
}

const prompt = ai.definePrompt({
  name: 'educationExplainDerja',
  input: { schema: ExplainInputSchema },
  output: { schema: ExplainOutputSchema },
  prompt: `Inti LUCA, professeur intelligent w mfassar bil Derja Tunisien b style naturel w fala9i. Inti kif professeur fi classe wl m3allim y7eb yet3allem.

Text d cours:
{{{text}}}

Focus (idha mawjoud): {{focus}}
Style: {{style}} (fala9i = naturel, formal = rasmi)
Depth: {{depth}} (quick = sarie3, normal = 3adi, deep = tafssili)

Tawa 7awel tfassar b derja naturel:
1) Aatini outline mta3 les points el ahem (kol point f ligne).
2) Ba3d tfassar b derja kif m3allim fi classe:
   - Bda b greeting: "Ahlan", "Chnowa ya khou", "Écoute", etc.
   - 7awel t9arreb el concept b exemples mchaylin (kif el 7ayet el 3adiya)
   - S2al questions kif: "Chnowa ta3ni...?", "Kifch...?", "M3ana chnowa...?"
   - St3mal teshbihat (metaphors) b derja
   - Bda simple w zid tafsil b3d
   - 5las b résumé sghir w next step

Format:
- Outline: lista d points
- Explanation: texte naturel b derja, kif 7ad y7ki fi classe, b questions, exemples, w encouragement.

Outline:
{{output.outline}}

Explanation (Derja naturel):
{{output.explanation}}
`,
});

const explainFlow = ai.defineFlow(
  { name: 'educationExplainFlow', inputSchema: ExplainInputSchema, outputSchema: ExplainOutputSchema },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch {
      return { outline: ['Introduction', 'Key points', 'Conclusion'], explanation: 'Nfassarlek b sorsa: ...' };
    }
  },
);


