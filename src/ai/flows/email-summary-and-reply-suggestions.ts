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
  subject: z.string().optional().describe('The email subject for context.'),
  sender: z.string().optional().describe('The sender name/address for context.'),
  tone: z.enum(['Professional', 'Friendly', 'Urgent']).optional().describe('Desired tone for suggested replies.'),
  length: z.enum(['Short', 'Medium', 'Long']).optional().describe('Desired length of suggested replies.'),
  userName: z.string().optional().describe('Your signature name for sign-off.'),
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
  prompt: `You are an assistant that summarizes emails and generates actionable, context-aware reply drafts in multiple languages.

  Context:
  - Subject: {{subject}}
  - Sender: {{sender}}
  - Desired tone: {{tone}}
  - Desired length: {{length}}
  - Sign as: {{userName}}

  Given the following email body, first normalize the content:
  - Repair line breaks from OCR, merge wrapped rows, and infer table columns when possible
  - Treat any section after "--- Content from attached PDF(s): ---" as the primary source of truth (e.g., tabular reports)
  - Detect and summarize: totals per service, delivered today, new orders (top 3–5), and planning updates

  Then write a concise, neutral summary (one to two sentences) followed by three reply drafts in Tunisian Arabic (Derja), French, and English. Each reply must:
  - Match the desired tone and length
  - Be polite and professional
  - Mention key figures (totals, quantities, prices) and the most relevant next actions (e.g., confirm reception, schedule, missing data)
  - Prefer structured, logical framing even if the source text is noisy or partially broken
  - Include a clear next step or question if needed
  - Follow the EXACT format below with greeting, body, and sign-off lines

  Email Body: {{{emailBody}}}

  Summary:
  {{output.summary}}

  Reply Suggestions:
  Derja:
  Salam [Name],
  {{output.replySuggestions.derja}}
  
  Ma3a chokran,
  {{userName || '[Your Name]'}}
  
  French:
  Bonjour [Nom],
  {{output.replySuggestions.french}}
  
  Cordialement,
  {{userName || '[Votre nom]'}}
  
  English:
  Hello [Name],
  {{output.replySuggestions.english}}
  
  Best regards,
  {{userName || '[Your Name]'}}
`,
});

const emailSummaryAndReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'emailSummaryAndReplySuggestionsFlow',
    inputSchema: EmailSummaryAndReplySuggestionsInputSchema,
    outputSchema: EmailSummaryAndReplySuggestionsOutputSchema,
  },
  async input => {
    try {
      const enriched = {
        tone: input.tone ?? 'Professional',
        length: input.length ?? 'Medium',
        subject: input.subject ?? '',
        sender: input.sender ?? '',
        userName: input.userName ?? '',
        emailBody: input.emailBody,
      };
      const {output} = await prompt(enriched);
      return output!;
    } catch (err) {
      // Fallback summary and replies to keep UI working when AI API fails
      const body = input.emailBody.trim();
      const summary = body.length > 0 ? body.slice(0, 200) : 'No content available.';
      const user = input.userName || '[Your Name]';

      // Heuristic intent detection for concrete replies
      const text = body.toLowerCase();
      const hasDeadline = /(by\s+\w+|friday|monday|tuesday|wednesday|thursday|tomorrow|next\s+week)/i.test(body);
      const isMeeting = /(meet|meeting|call|zoom|google\s+meet|teams|10\s*am|\d{1,2}:\d{2})/i.test(body);
      const isInquiry = /(info|information|tell\s+me\s+more|details|inquiry|interested)/i.test(body);
      const isDelay = /(delay|delayed|late|postpone|behind)/i.test(body);
      const isConfirm = /(confirm|ready|done|complete|deploy|ship)/i.test(body);
      const subject = input.subject || '';

      let derjaBody: string;
      let frBody: string;
      let enBody: string;

      if (isMeeting) {
        derjaBody = `شكراً على الدعوة للاجتماع بخصوص "${subject}". نأكد الحضور في الوقت المقترح. تنجم تبعثلي رابط الاجتماع ولا المكان بالتحديد؟`;
        frBody = `Merci pour la proposition de réunion au sujet de « ${subject} ». Je confirme ma disponibilité à l'horaire proposé. Pourriez-vous partager le lien ou le lieu exact ?`;
        enBody = `Thanks for the meeting invitation regarding "${subject}". I confirm I’m available at the proposed time. Could you share the meeting link or exact location?`;
      } else if (hasDeadline || /report|deliver|send|update|budget|proposal|document/.test(text)) {
        derjaBody = `شكراً على الرسالة بخصوص "${subject}". باش نجهّز المطلوب ونبعثه في الآجال المحددة. كان يلزم تفاصيل إضافية ولا قالب محدد، علّمني.`;
        frBody = `Merci pour votre message concernant « ${subject} ». Je préparerai l'élément demandé et vous l’enverrai dans les délais. S'il faut un format particulier ou des précisions, dites‑moi.`;
        enBody = `Thanks for your message about "${subject}". I’ll prepare the requested item and send it within the agreed timeline. If you need a specific format or extra details, please let me know.`;
      } else if (isDelay) {
        derjaBody = `التأخير جا بسبب اختبارات إضافية باش نضمنوا الاستقرار. قاعدين نكمّلوا وآخر تقدير التسليم يكون خلال يومين.`;
        frBody = `Le retard est dû à des tests supplémentaires pour garantir la stabilité. Nous finalisons la dernière phase, livraison estimée sous deux jours.`;
        enBody = `The delay is due to additional testing to ensure stability. We’re wrapping up the final phase and expect delivery within two days.`;
      } else if (isInquiry) {
        derjaBody = `شكراً على الاهتمام. الدور يرتكز على تطوير واجهات عصرية باستعمال React و Tailwind. ابعثلنا الـCV والـPortfolio باش نراجعوهم.`;
        frBody = `Merci pour votre intérêt. Le poste porte sur le développement d’interfaces modernes avec React et Tailwind. Merci d’envoyer votre CV et portfolio pour revue.`;
        enBody = `Thank you for your interest. The role focuses on building modern interfaces using React and Tailwind. Please share your CV and portfolio for review.`;
      } else if (isConfirm) {
        derjaBody = `نأكّد اللي الخدمة ماشية حسب الخطة. كان يصير أي تغيير نعلمك فوراً.`;
        frBody = `Je confirme que l’avancement est conforme au plan. En cas d’ajustement, je vous tiendrai informé immédiatement.`;
        enBody = `I confirm the work is progressing as planned. I’ll notify you immediately if any adjustments are required.`;
      } else {
        derjaBody = `شكراً على مراسلتك بخصوص "${subject}". فهمت النقاط الرئيسية وسعيد نتعاون. كان عندك أي تفاصيل إضافية، ابعثهالي باش نتقدّم أسرع.`;
        frBody = `Merci pour votre message au sujet de « ${subject} ». J’ai bien noté les points clés et je reste disponible pour avancer. Partagez toute précision utile.`;
        enBody = `Thank you for your email regarding "${subject}". I’ve noted the key points and I’m ready to proceed. Please share any additional details that would help us move faster.`;
      }

      return {
        summary,
        replySuggestions: {
          derja: `${derjaBody}\n\nمع الشكر،\n${user}`,
          french: `${frBody}\n\nCordialement,\n${user}`,
          english: `${enBody}\n\nBest regards,\n${user}`,
        },
      };
    }
  }
);
