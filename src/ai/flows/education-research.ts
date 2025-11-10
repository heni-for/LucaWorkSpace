'use server';

/**
 * @fileOverview Performs deep research on a chapter/topic to gather comprehensive information for study planning.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EducationResearchInputSchema = z.object({
  chapterName: z.string().describe('The name of the chapter/topic to research.'),
  courseName: z.string().optional().describe('The course this chapter belongs to.'),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('Student current level.'),
  language: z.enum(['derja', 'french', 'english', 'arabic']).optional().default('derja').describe('Preferred language for research results.'),
  enableWebSearch: z.boolean().optional().default(true).describe('Whether to perform web search for comprehensive content.'),
  additionalContext: z.string().optional().describe('Additional context about the course (description, platform, URL) to enhance research quality.'),
});

export type EducationResearchInput = z.infer<typeof EducationResearchInputSchema>;

const EducationResearchOutputSchema = z.object({
  researchSummary: z.string().describe('A comprehensive research summary in Derja covering key concepts, definitions, examples, and learning resources.'),
  fullContent: z.string().optional().describe('Full detailed content about the chapter as if pulled from educational sources, textbooks, or online resources.'),
  keyConcepts: z.array(z.object({
    concept: z.string(),
    explanation: z.string(),
    importance: z.enum(['critical', 'important', 'optional']),
  })).describe('Key concepts to master in this chapter.'),
  prerequisites: z.array(z.string()).describe('Prerequisites or prior knowledge needed for this chapter.'),
  estimatedHours: z.number().describe('Estimated study hours needed for this chapter.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Estimated difficulty level.'),
  resources: z.array(z.string()).describe('Suggested learning resources, examples, or real-world applications.'),
  webSources: z.array(z.string()).optional().describe('Web sources or URLs where this information can be found (simulated educational sources).'),
  studyApproach: z.string().describe('Recommended study approach for this chapter in Derja.'),
  detailedAnalysis: z.string().optional().describe('Deep analysis including historical context, real-world applications, common misconceptions, and advanced insights.'),
});

export type EducationResearchOutput = z.infer<typeof EducationResearchOutputSchema>;

export async function researchChapter(input: EducationResearchInput): Promise<EducationResearchOutput> {
  return researchChapterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'educationResearchChapter',
  input: {schema: EducationResearchInputSchema},
  output: {schema: EducationResearchOutputSchema},
  prompt: `You are LUCA, an expert research assistant that performs COMPREHENSIVE web-based research on educational topics. You act as if you're pulling full content from Chrome browser, educational websites, textbooks, Wikipedia, academic sources, and online courses.

Your task: Perform DEEP, FULL analysis of the chapter as if you searched the web extensively and pulled complete content.

Chapter to Research: {{chapterName}}
Course: {{courseName}}
Student Level: {{currentLevel}}
Language: {{language}}
Web Search Enabled: {{enableWebSearch}}
{{#if additionalContext}}
Additional Course Context:
{{additionalContext}}

Use this context to better understand the course scope, platform, and specific requirements when researching the chapter.
{{/if}}

**ACT AS IF YOU'RE PULLING FROM WEB BROWSER:**

Imagine you opened Chrome and searched for:
- "{{chapterName}} complete guide"
- "{{chapterName}} textbook content"
- "{{chapterName}} course material"
- "{{chapterName}} explained"
- "{{chapterName}} {{courseName}}"
{{#if additionalContext}}
- "{{chapterName}}" related to the specific course/platform mentioned in the context
{{/if}}

You found multiple sources and now have FULL chapter content. Provide:

1. **FULL CONTENT** (fullContent field):
   - Complete chapter content as if pulled from a textbook or educational website
   - Detailed explanations of ALL concepts
   - Examples, formulas, definitions
   - Step-by-step explanations
   - This should be comprehensive, like you copied the full chapter from an online source

2. **DETAILED ANALYSIS** (detailedAnalysis field):
   - Historical background and context
   - Real-world applications (with specific examples)
   - Common misconceptions students face
   - Advanced insights and connections
   - Practical use cases
   - Industry applications

3. **RESEARCH SUMMARY** (in Derja):
   - Comprehensive overview explaining what the chapter covers
   - Why it's important
   - Key insights and takeaways

4. **KEY CONCEPTS** (5-15 concepts):
   - Extract ALL important concepts from the full content
   - Rank by importance (critical, important, optional)
   - Provide detailed explanations for each

5. **PREREQUISITES**: 
   - What knowledge is needed before this chapter
   - Specific topics/concepts required

6. **DIFFICULTY ASSESSMENT** (easy/medium/hard):
   - Based on complexity, prerequisites, abstractness
   - Consider student level

7. **ESTIMATED HOURS**:
   - Realistic study time based on content depth
   - Consider student level (beginner = more time)

8. **RESOURCES**:
   - Educational websites, videos, books
   - Practice problems, exercises
   - Real-world examples

9. **WEB SOURCES** (webSources):
   - Simulate realistic educational source URLs like:
     * "https://en.wikipedia.org/wiki/{{chapterName}}"
     * "https://khanacademy.org/.../{{chapterName}}"
     * "https://coursera.org/learn/.../{{chapterName}}"
     * Educational blogs, university resources

10. **STUDY APPROACH**:
    - Best learning sequence
    - Study techniques
    - Practice recommendations
    - Revision strategy

**CRITICAL:**
- The fullContent should be COMPREHENSIVE - like you pulled a complete chapter from an online textbook
- Include ALL definitions, explanations, examples
- Be detailed and thorough - not brief
- The detailedAnalysis should provide deep insights beyond basics
- Everything in Derja where specified
- Act as if you have access to the FULL internet and pulled complete content

Generate COMPLETE, DETAILED research now.`,
});

const researchChapterFlow = ai.defineFlow(
  {
    name: 'educationResearchChapterFlow',
    inputSchema: EducationResearchInputSchema,
    outputSchema: EducationResearchOutputSchema,
  },
  async (input) => {
    try {
      const result = await prompt(input);
      if (!result?.output) {
        throw new Error('Research prompt did not return output');
      }
      return result.output;
    } catch (error) {
      console.error('Chapter research error:', error);
      // Fallback response
      return {
        researchSummary: `El chapter "${input.chapterName}" houwa partie mhim fi cours. Y7taj focus w practice bch yet3allem.`,
        fullContent: `Content complet mta3 "${input.chapterName}". Y7taj t9ra bel tafsil w t3awd bch t7el el concepts.`,
        keyConcepts: [
          {
            concept: input.chapterName,
            explanation: 'Concept principal mta3 el chapter',
            importance: 'critical' as const,
          },
        ],
        prerequisites: [],
        estimatedHours: 5,
        difficulty: 'medium' as const,
        resources: [],
        webSources: [],
        studyApproach: 'Bda bel basics, w ba3d zid tafsil. 3mel quizzes bch ttest nafsek.',
        detailedAnalysis: `Analysis ta3 "${input.chapterName}" yjib real-world examples w applications.`,
      };
    }
  }
);

