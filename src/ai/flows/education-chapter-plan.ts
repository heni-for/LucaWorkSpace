'use server';

/**
 * @fileOverview Generates a detailed study plan for a specific chapter using deep research results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EducationChapterPlanInputSchema = z.object({
  chapterName: z.string().describe('The name of the chapter to create a plan for.'),
  courseName: z.string().optional().describe('The course this chapter belongs to.'),
  researchData: z.object({
    researchSummary: z.string().optional(),
    keyConcepts: z.array(z.object({
      concept: z.string(),
      explanation: z.string(),
      importance: z.enum(['critical', 'important', 'optional']),
    })).optional(),
    prerequisites: z.array(z.string()).optional(),
    estimatedHours: z.number().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    resources: z.array(z.string()).optional(),
    studyApproach: z.string().optional(),
  }).describe('Deep research data for this chapter.'),
  studentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('Student current level.'),
  preferredMethod: z.enum(['reading', 'listening', 'practical', 'mixed']).optional().describe('Preferred learning method.'),
});

export type EducationChapterPlanInput = z.infer<typeof EducationChapterPlanInputSchema>;

const EducationChapterPlanOutputSchema = z.object({
  chapterPlan: z.object({
    overview: z.string().describe('Overview of the study plan in Derja.'),
    totalHours: z.number().describe('Total estimated study hours.'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('Chapter difficulty level.'),
    learningPhases: z.array(z.object({
      phase: z.number().describe('Phase number (1, 2, 3, etc.).'),
      phaseName: z.string().describe('Phase name in Derja.'),
      description: z.string().describe('What to learn in this phase.'),
      hours: z.number().describe('Estimated hours for this phase.'),
      concepts: z.array(z.string()).describe('Key concepts covered in this phase.'),
      activities: z.array(z.object({
        activity: z.string().describe('Activity name (e.g., "Read introduction", "Practice exercises").'),
        duration: z.string().describe('Duration (e.g., "30 min", "1 hour").'),
        description: z.string().describe('Detailed description of the activity.'),
      })).describe('Specific activities to do.'),
      milestones: z.array(z.string()).describe('Checkpoints to verify understanding.'),
    })).describe('Learning phases/steps for mastering this chapter.'),
    prerequisitesCheck: z.object({
      required: z.array(z.string()).describe('Prerequisites needed.'),
      ready: z.boolean().describe('Whether student is ready (based on prerequisites).'),
      recommendations: z.string().optional().describe('What to do if prerequisites are missing.'),
    }).describe('Prerequisites analysis.'),
    studySchedule: z.array(z.object({
      day: z.string().describe('Day (e.g., "Day 1", "Day 2").'),
      focus: z.string().describe('What to focus on this day.'),
      activities: z.array(z.string()).describe('Activities for this day.'),
      duration: z.string().describe('Total duration.'),
      revision: z.boolean().optional().describe('Whether this includes revision.'),
    })).describe('Day-by-day study schedule.'),
    assessment: z.object({
      checkpoints: z.array(z.object({
        checkpoint: z.string().describe('Checkpoint name.'),
        questions: z.array(z.string()).describe('Questions to test understanding.'),
        expectedOutcome: z.string().describe('What student should be able to do.'),
      })).describe('Assessment checkpoints.'),
      finalQuizTopics: z.array(z.string()).describe('Topics for final quiz.'),
    }).describe('Assessment plan.'),
    tips: z.array(z.string()).describe('Study tips and best practices in Derja.'),
    commonMistakes: z.array(z.string()).optional().describe('Common mistakes to avoid.'),
  }).describe('The detailed chapter study plan.'),
});

export type EducationChapterPlanOutput = z.infer<typeof EducationChapterPlanOutputSchema>;

export async function generateChapterPlan(input: EducationChapterPlanInput): Promise<EducationChapterPlanOutput> {
  return chapterPlanFlow(input);
}

// Internal schema for the prompt (flattened format)
const PromptInputSchema = z.object({
  chapterName: z.string(),
  courseName: z.string(),
  studentLevel: z.string(),
  preferredMethod: z.string(),
  researchSummary: z.string(),
  keyConceptsList: z.string(),
  prerequisitesList: z.string(),
  estimatedHours: z.number(),
  difficulty: z.string(),
  studyApproach: z.string(),
  resourcesList: z.string(),
});

const prompt = ai.definePrompt({
  name: 'educationChapterPlanPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: EducationChapterPlanOutputSchema},
  prompt: `You are LUCA, an expert education planner. Create a VERY DETAILED, comprehensive study plan for a chapter using deep research data.

CHAPTER: {{chapterName}}
COURSE: {{courseName}}
STUDENT LEVEL: {{studentLevel}} (beginner needs more detail/time, advanced needs less)
PREFERRED METHOD: {{preferredMethod}} (reading/listening/practical/mixed)

RESEARCH DATA (USE ALL OF THIS):
Summary: {{researchSummary}}
Key Concepts (in priority order):
{{keyConceptsList}}
Prerequisites: {{prerequisitesList}}
Estimated Hours: {{estimatedHours}}
Difficulty: {{difficulty}} (hard = more detail/time, easy = less)
Recommended Approach: {{studyApproach}}
Resources: {{resourcesList}}

**CRITICAL REQUIREMENTS:**

1. **OVERVIEW** (in Derja):
   - What the student will learn
   - Why it's important
   - How long it takes
   - Overall approach

2. **LEARNING PHASES** (MANDATORY: 3-5 phases, NOT just 1!):
   - Phase 1: Foundation/Introduction (review prerequisites if needed, basic concepts from research)
   - Phase 2-4: Core Content (EACH phase covers SPECIFIC key concepts from the research key concepts list)
   - Final Phase: Mastery/Practice (integration, advanced applications, real examples from resources)
   - EACH phase MUST include:
     * Phase name (in Derja, descriptive)
     * Detailed description (what exactly is learned, be specific)
     * Hours (distribute the {{estimatedHours}}h total across all phases proportionally)
     * Specific concepts covered (use actual concept names from the key concepts list above)
     * 3-5 detailed activities with:
       - Activity name (specific, not generic)
       - Duration (e.g., "45 min", "1.5 hours", be realistic)
       - Detailed description (exactly what to do, step-by-step)
     * 2-3 milestones (specific achievements, measurable)

3. **PREREQUISITES CHECK**:
   - List all prerequisites from research
   - Assess if {{studentLevel}} level student is ready
   - Give specific, actionable recommendations if not ready

4. **STUDY SCHEDULE** (day-by-day, use spaced repetition):
   - Distribute {{estimatedHours}} hours across multiple days (NOT just 1 day!)
   - Include revision days (Day 3, Day 7 pattern)
   - Match activities to {{preferredMethod}} preference
   - Each day needs: day number, focus topic, activities list, duration, revision flag

5. **ASSESSMENT**:
   - Checkpoint after EACH phase (not just one!)
   - Each checkpoint: name, 3-5 specific questions, expected outcome
   - Final quiz topics (all key concepts from research)

6. **TIPS** (5-7 practical tips in Derja):
   - How to study effectively
   - What to focus on
   - Study techniques
   - Time management

7. **COMMON MISTAKES** (3-5 mistakes to avoid):
   - Based on difficulty and concepts
   - Specific warnings

**GENERATION RULES:**
- MUST use ALL key concepts from research
- MUST create 3-5 phases (not just 1!)
- MUST distribute hours realistically
- MUST match activities to preferred method
- MUST be VERY detailed and specific
- Write everything in natural Derja
- Each activity needs clear instructions
- Make it practical and actionable

Generate the COMPLETE, DETAILED plan now. Do NOT simplify or skip parts.`,
});

const chapterPlanFlow = ai.defineFlow(
  {
    name: 'educationChapterPlanFlow',
    inputSchema: EducationChapterPlanInputSchema,
    outputSchema: EducationChapterPlanOutputSchema,
  },
  async (input) => {
    try {
      // Format research data as strings for the prompt
      const rd = input.researchData;
      const keyConceptsStr = rd?.keyConcepts?.map((c: any) => 
        `- ${c.concept} (${c.importance}): ${c.explanation}`
      ).join('\n') || 'No key concepts specified';
      const prereqStr = rd?.prerequisites?.join(', ') || 'None';
      const resourcesStr = rd?.resources?.join(', ') || 'No specific resources';
      
      // Create enhanced input with formatted strings
      const enhancedInput = {
        chapterName: input.chapterName,
        courseName: input.courseName || 'General Course',
        studentLevel: input.studentLevel || 'beginner',
        preferredMethod: input.preferredMethod || 'mixed',
        researchSummary: rd?.researchSummary || '',
        keyConceptsList: keyConceptsStr,
        prerequisitesList: prereqStr,
        estimatedHours: rd?.estimatedHours || 5,
        difficulty: rd?.difficulty || 'medium',
        studyApproach: rd?.studyApproach || 'Standard comprehensive approach',
        resourcesList: resourcesStr,
      };
      
      const result = await prompt(enhancedInput);
      if (!result?.output) {
        throw new Error('AI did not return output');
      }
      // Validate that we got a detailed plan (not just 1 phase)
      if (result.output.chapterPlan.learningPhases.length < 3) {
        console.warn('Generated plan has fewer than 3 phases, but continuing...');
      }
      return result.output;
    } catch (error) {
      console.error('Chapter plan generation error:', error);
      console.error('Input was:', JSON.stringify(input, null, 2));
      // Fallback plan
      const estimatedHours = input.researchData.estimatedHours || 5;
      return {
        chapterPlan: {
          overview: `Plan ta3 ${estimatedHours}h bch nkammlou "${input.chapterName}". N9ra concepts el mohima b sequence mchayyin.`,
          totalHours: estimatedHours,
          difficulty: input.researchData.difficulty || 'medium',
          learningPhases: [
            {
              phase: 1,
              phaseName: 'Introduction',
              description: 'Bda bel basics mta3 el chapter',
              hours: Math.ceil(estimatedHours * 0.3),
              concepts: input.researchData.keyConcepts?.slice(0, 2).map(c => c.concept) || [],
              activities: [
                {
                  activity: 'Lecture',
                  duration: '30 min',
                  description: '9ra introduction w overview',
                },
              ],
              milestones: ['Fhem el concept principal'],
            },
          ],
          prerequisitesCheck: {
            required: input.researchData.prerequisites || [],
            ready: (input.researchData.prerequisites?.length || 0) === 0,
            recommendations: '7awel t3awed prerequisites law mchit t7elhom',
          },
          studySchedule: [
            {
              day: 'Day 1',
              focus: 'Introduction',
              activities: ['Lecture', 'Notes'],
              duration: `${Math.ceil(estimatedHours * 0.3)}h`,
              revision: false,
            },
          ],
          assessment: {
            checkpoints: [
              {
                checkpoint: 'After Phase 1',
                questions: ['Chnowa el concept principal?'],
                expectedOutcome: 'Fhem basics mta3 el chapter',
              },
            ],
            finalQuizTopics: input.researchData.keyConcepts?.slice(0, 3).map(c => c.concept) || [],
          },
          tips: ['Bda b concepts el mohima', '3mel revision kol 3 jours'],
          commonMistakes: ['Mouch tskip prerequisites'],
        },
      };
    }
  }
);

