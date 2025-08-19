'use server';
/**
 * @fileOverview A Genkit flow that helps students find relevant courses based on their interests and goals.
 *
 * - helpStudentsFindRelevantCourses - A function that takes student's interests and goals as input and returns a list of relevant courses.
 * - HelpStudentsFindRelevantCoursesInput - The input type for the helpStudentsFindRelevantCourses function.
 * - HelpStudentsFindRelevantCoursesOutput - The return type for the helpStudentsFindRelevantCourses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HelpStudentsFindRelevantCoursesInputSchema = z.object({
  interests: z
    .string()
    .describe('The interests of the student, comma separated.'),
  goals: z.string().describe('The goals of the student, comma separated.'),
});
export type HelpStudentsFindRelevantCoursesInput = z.infer<
  typeof HelpStudentsFindRelevantCoursesInputSchema
>;

const HelpStudentsFindRelevantCoursesOutputSchema = z.object({
  relevantCourses: z
    .array(z.string())
    .describe('A list of relevant course titles.'),
});
export type HelpStudentsFindRelevantCoursesOutput = z.infer<
  typeof HelpStudentsFindRelevantCoursesOutputSchema
>;

export async function helpStudentsFindRelevantCourses(
  input: HelpStudentsFindRelevantCoursesInput
): Promise<HelpStudentsFindRelevantCoursesOutput> {
  return helpStudentsFindRelevantCoursesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'helpStudentsFindRelevantCoursesPrompt',
  input: {schema: HelpStudentsFindRelevantCoursesInputSchema},
  output: {schema: HelpStudentsFindRelevantCoursesOutputSchema},
  prompt: `You are an AI mentor, helping students find relevant courses based on their interests and goals.

  The student is interested in: {{{interests}}}
  The student wants to achieve the following goals: {{{goals}}}

  Based on the student's interests and goals, recommend a list of relevant courses.
  Only return the course titles.
  `,
});

const helpStudentsFindRelevantCoursesFlow = ai.defineFlow(
  {
    name: 'helpStudentsFindRelevantCoursesFlow',
    inputSchema: HelpStudentsFindRelevantCoursesInputSchema,
    outputSchema: HelpStudentsFindRelevantCoursesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
