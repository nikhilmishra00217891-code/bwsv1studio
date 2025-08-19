'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering questions about courses.
 *
 * - answerQuestionsAboutCourse - A function that takes a course ID and a question, and returns an answer.
 * - AnswerQuestionsAboutCourseInput - The input type for the answerQuestionsAboutCourse function.
 * - AnswerQuestionsAboutCourseOutput - The return type for the answerQuestionsAboutCourse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutCourseInputSchema = z.object({
  courseId: z.string().describe('The ID of the course to ask about.'),
  question: z.string().describe('The question to ask about the course.'),
});
export type AnswerQuestionsAboutCourseInput = z.infer<
  typeof AnswerQuestionsAboutCourseInputSchema
>;

const AnswerQuestionsAboutCourseOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the course.'),
});
export type AnswerQuestionsAboutCourseOutput = z.infer<
  typeof AnswerQuestionsAboutCourseOutputSchema
>;

export async function answerQuestionsAboutCourse(
  input: AnswerQuestionsAboutCourseInput
): Promise<AnswerQuestionsAboutCourseOutput> {
  return answerQuestionsAboutCourseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutCoursePrompt',
  input: {schema: AnswerQuestionsAboutCourseInputSchema},
  output: {schema: AnswerQuestionsAboutCourseOutputSchema},
  prompt: `You are a helpful AI mentor who answers questions about courses.

  You are provided with a course ID and a question about the course.
  Your task is to answer the question based on your knowledge of the course.

  Course ID: {{{courseId}}}
  Question: {{{question}}}
  Answer: `,
});

const answerQuestionsAboutCourseFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutCourseFlow',
    inputSchema: AnswerQuestionsAboutCourseInputSchema,
    outputSchema: AnswerQuestionsAboutCourseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
