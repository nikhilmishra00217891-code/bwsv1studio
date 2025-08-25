'use server';
/**
 * @fileOverview A Genkit flow for generating quizzes.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  grade: z.string().describe('The grade level of the student (e.g., 9th, 12th, Competitive Exams).'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty of the quiz.'),
  numberOfQuestions: z.number().int().min(1).max(20).describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
    questionText: z.string().describe('The full text of the quiz question.'),
    options: z.array(z.string()).length(4).describe('An array of exactly 4 multiple-choice options.'),
    correctAnswer: z.string().describe('The correct answer from the options array.'),
    explanation: z.string().describe('A brief explanation of why the correct answer is right.'),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The list of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and quiz creator for students in India. Your task is to generate a multiple-choice quiz based on the provided parameters.

  Instructions:
  1.  Generate exactly {{{numberOfQuestions}}} questions.
  2.  The questions should be relevant to the specified topic: "{{{topic}}}".
  3.  The difficulty of the questions must match: "{{{difficulty}}}".
  4.  The questions should be appropriate for the student's grade level: "{{{grade}}}".
  5.  For each question, provide exactly 4 multiple-choice options.
  6.  Clearly indicate the correct answer.
  7.  Provide a concise but clear explanation for why the answer is correct. This is for post-quiz review.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
