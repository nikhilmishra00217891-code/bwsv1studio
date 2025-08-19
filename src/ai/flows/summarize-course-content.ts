'use server';

/**
 * @fileOverview A flow that summarizes the key concepts of a lesson.
 *
 * - summarizeCourseContent - A function that handles the summarization process.
 * - SummarizeCourseContentInput - The input type for the summarizeCourseContent function.
 * - SummarizeCourseContentOutput - The return type for the summarizeCourseContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCourseContentInputSchema = z.object({
  lessonContent: z
    .string()
    .describe('The content of the lesson to be summarized.'),
});
export type SummarizeCourseContentInput = z.infer<typeof SummarizeCourseContentInputSchema>;

const SummarizeCourseContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the key concepts of the lesson.'),
});
export type SummarizeCourseContentOutput = z.infer<typeof SummarizeCourseContentOutputSchema>;

export async function summarizeCourseContent(input: SummarizeCourseContentInput): Promise<SummarizeCourseContentOutput> {
  return summarizeCourseContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCourseContentPrompt',
  input: {schema: SummarizeCourseContentInputSchema},
  output: {schema: SummarizeCourseContentOutputSchema},
  prompt: `You are an expert educator summarizing lesson content for students.

  Please provide a concise summary of the following lesson content, highlighting the key concepts:

  Lesson Content: {{{lessonContent}}}
  `,
});

const summarizeCourseContentFlow = ai.defineFlow(
  {
    name: 'summarizeCourseContentFlow',
    inputSchema: SummarizeCourseContentInputSchema,
    outputSchema: SummarizeCourseContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
