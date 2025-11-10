import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DerjaCommandSchema = z.object({
  command: z.string().describe('The Derja/Arabic command spoken by the user'),
});

const DerjaResponseSchema = z.object({
  intent: z.string().describe('What the user wants to do'),
  action: z.enum([
    'open_mail', 'open_calendar', 'open_tasks', 'open_notes', 'open_dashboard',
    'open_education', 'open_memory', 'open_meetings', 'open_documents',
    'open_projects', 'open_team', 'open_workspace', 'open_reports',
    'summarize', 'read', 'help', 'unknown'
  ]).describe('The action to execute'),
  parameters: z.record(z.any()).optional().describe('Additional parameters for the action'),
  response: z.string().describe('Response to speak back in Tunisian Derja'),
});

const derjaCommandPrompt = ai.definePrompt({
  name: 'derjaCommandPrompt',
  input: { schema: DerjaCommandSchema },
  output: { schema: DerjaResponseSchema },
  prompt: `You are LUCA, a Tunisian voice assistant that understands Tunisian Derja (Tunisian Arabic dialect).

USER SAID (in Derja): "{{command}}"

Your job:
1. Understand what the user wants in Derja
2. Map it to an action
3. Respond in friendly Tunisian Derja

COMMAND MAPPINGS:
- "7elli boîte mails" / "boite mail" / "gmail" → open_mail
- "7elli calendrier" / "calendrier" / "agenda" → open_calendar  
- "warini les tâches" / "taches" / "tasks" → open_tasks
- "7elli notes" / "notes" → open_notes
- "dashboard" / "tableau de bord" → open_dashboard
- "éducation" / "education" / "دراسة" → open_education
- "mémoire" / "memory" / "ذاكرة" → open_memory
- "réunions" / "meetings" / "اجتماعات" → open_meetings
- "documents" / "fichiers" → open_documents
- "projets" / "projects" → open_projects
- "équipe" / "team" / "فريق" → open_team
- "workspace" / "espace de travail" → open_workspace
- "rapports" / "reports" → open_reports
- "résumé" / "resume" / "summarize" → summarize
- "9rali" / "lis" / "read" → read
- "3aweni" / "aide" / "help" → help

RESPONSE GUIDELINES (in Derja):
- Be friendly and casual
- Use Tunisian phrases like "haya", "taw", "barsha", "mriguel"
- Keep responses short (1-2 sentences)
- Confirm the action you're doing

EXAMPLES:
- Command: "7elli boîte mails" → Response: "Haya, na7el boîte mails taw."
- Command: "warini calendrier" → Response: "Yezzi, nwarilek calendrier."
- Command: "éducation" → Response: "Taw na7leh l'éducation."

Generate the intent, action, and Derja response now.`,
});

const derjaCommandFlow = ai.defineFlow(
  {
    name: 'derjaCommandFlow',
    inputSchema: DerjaCommandSchema,
    outputSchema: DerjaResponseSchema,
  },
  async (input) => {
    try {
      const result = await derjaCommandPrompt(input);
      if (!result?.output) {
        throw new Error('No output from prompt');
      }
      return result.output;
    } catch (error) {
      console.error('Derja command error:', error);
      // Fallback response
      return {
        intent: 'unknown',
        action: 'unknown' as any,
        response: 'معليش، ما فهمتش. عاود من فضلك.',
      };
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    console.log('🧠 Processing Derja command:', command);

    const result = await derjaCommandFlow({ command });

    console.log('✅ Command understood:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Derja command API error:', error);
    return NextResponse.json(
      { 
        intent: 'error',
        action: 'unknown',
        response: 'معليش، صار problème. عاود من فضلك.',
      },
      { status: 200 } // Return 200 to avoid breaking the flow
    );
  }
}

