'use server';

/**
 * @fileOverview Generates a personalized study plan for students in Tunisian Derja.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EducationStudyPlanInputSchema = z.object({
  courseName: z.string().describe('The name of the course/subject to study.'),
  courseContent: z.string().optional().describe('The course content/material (PDF text, syllabus, etc.).'),
  examDate: z.string().optional().describe('Target exam date or completion date (e.g., "2025-12-15" or "in 3 weeks").'),
  studyHoursPerWeek: z.number().optional().describe('Available study hours per week.'),
  preferredMethod: z.enum(['reading', 'listening', 'practical', 'mixed']).optional().describe('Preferred learning method.'),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('Student current level in the subject.'),
  researchResults: z.record(z.any()).optional().describe('Deep research results for specific chapters (optional, enhances planning quality).'),
});

export type EducationStudyPlanInput = z.infer<typeof EducationStudyPlanInputSchema>;

const EducationStudyPlanOutputSchema = z.object({
  studyPlan: z.object({
    totalWeeks: z.number().describe('Total number of weeks for the study plan.'),
    weeklySchedule: z.array(z.object({
      week: z.number().describe('Week number.'),
      topics: z.array(z.string()).describe('Topics/chapters to cover this week.'),
      hours: z.number().describe('Estimated study hours for this week.'),
      dailyPlan: z.array(z.object({
        day: z.string().describe('Day of week (e.g., "Monday").'),
        topics: z.array(z.string()).describe('Topics to study on this day.'),
        duration: z.string().describe('Study duration (e.g., "2 hours").'),
        activities: z.array(z.string()).describe('Study activities (reading, quiz, revision, etc.).'),
      })).describe('Daily breakdown for the week.'),
    })).describe('Week-by-week study schedule.'),
  }).describe('The generated study plan.'),
  summary: z.string().describe('A brief summary of the study plan in Derja.'),
});

export type EducationStudyPlanOutput = z.infer<typeof EducationStudyPlanOutputSchema>;

export async function educationStudyPlan(input: EducationStudyPlanInput): Promise<EducationStudyPlanOutput> {
  return educationStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'educationStudyPlanPrompt',
  input: {schema: EducationStudyPlanInputSchema},
  output: {schema: EducationStudyPlanOutputSchema},
  prompt: `You are LUCA, a smart education assistant that helps students learn courses in Tunisian Derja.

Student Request:
- Course: {{courseName}}
- Course Content: {{courseContent}}
- Exam Date: {{examDate}}
- Study Hours/Week: {{studyHoursPerWeek}}
- Preferred Method: {{preferredMethod}}
- Current Level: {{currentLevel}}
- Research Results: {{researchResults}} (if provided, use this deep research to create more accurate and detailed planning)

{{#if researchResults}}
**IMPORTANT: Deep research has been performed on specific chapters. Use this research to:**
- Adjust time estimates based on actual difficulty (from research)
- Prioritize critical concepts identified in research
- Include prerequisites in early weeks
- Add specific activities based on recommended study approaches
- Allocate more time to harder chapters (based on difficulty assessment)
{{/if}}

Create a personalized, detailed study plan in Derja that includes:

1. **Weekly Schedule**: Break down the course into weekly topics, estimating realistic hours per week based on the student's availability.
2. **Daily Plans**: For each week, provide a day-by-day breakdown with specific topics, duration, and activities (reading, listening to explanations, quizzes, practical exercises, revision).
3. **Adaptive Approach**: Adjust difficulty and pace based on the student's level (beginner/intermediate/advanced).
4. **Method Integration**: Include activities matching the preferred learning method (reading, listening, practical, or mixed).
5. **Revision Schedule**: Include spaced repetition (Day 1, Day 3, Day 7 pattern) within each week.

The study plan should:
- Be practical and achievable
- Use simple Derja explanations
- Include quiz/revision checkpoints
- Be structured for gradual learning
- Account for exam preparation time

Generate a complete study plan with:
- Total weeks needed
- Weekly topics breakdown
- Daily study schedule
- Specific activities per day

Return the plan in the structured format required, with all explanations and descriptions in Tunisian Derja.`,
});

const educationStudyPlanFlow = ai.defineFlow(
  {
    name: 'educationStudyPlanFlow',
    inputSchema: EducationStudyPlanInputSchema,
    outputSchema: EducationStudyPlanOutputSchema,
  },
  async (input) => {
    try {
      const result = await prompt(input);
      if (!result?.output) {
        throw new Error('Study plan prompt did not return output');
      }
      return result.output;
    } catch (error) {
      console.error('Study plan generation error:', error);
      // Fallback: generate a basic 4-week plan
      const weeks = Math.ceil((input.studyHoursPerWeek || 10) / 10) || 4;
      return {
        studyPlan: {
          totalWeeks: weeks,
          weeklySchedule: Array.from({ length: weeks }, (_, i) => ({
            week: i + 1,
            topics: [`Partie ${i + 1} mta3 "${input.courseName}"`],
            hours: input.studyHoursPerWeek || 10,
            dailyPlan: [
              {
                day: 'Lundi',
                topics: [`Introduction l partie ${i + 1}`],
                duration: '1-2 heures',
                activities: ['Lecture', 'Explication b Derja', 'Quiz'],
              },
            ],
          })),
        },
        summary: `Plan ta3 ${weeks} semén bch nkammlou "${input.courseName}". Kol semén 3andek ${input.studyHoursPerWeek || 10}h tdir cours w revision.`,
      };
    }
  }
);

