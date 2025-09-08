
'use server';
/**
 * @fileOverview An AI flow for assisting faculty in writing personalized letters (Patra) to students.
 *
 * - generatePatra - A function that handles the letter generation process.
 * - GeneratePatraInput - The input type for the generatePatra function.
 * - GeneratePatraOutput - The return type for the generatePatra function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { PatraType } from '@/types';

const GeneratePatraInputSchema = z.object({
  studentName: z.string().describe("The name of the student the letter is for."),
  studentGrade: z.string().optional().describe("The grade or class of the student."),
  patraType: z.enum(['praise', 'warning', 'encouragement', 'info']).describe("The tone or type of the letter."),
  customInstructions: z.string().optional().describe("Any specific points or instructions the faculty wants to include."),
});
export type GeneratePatraInput = z.infer<typeof GeneratePatraInputSchema>;

const GeneratePatraOutputSchema = z.object({
  title: z.string().describe("A suitable title for the letter."),
  content: z.string().describe("The full, personalized content of the letter."),
});
export type GeneratePatraOutput = z.infer<typeof GeneratePatraOutputSchema>;


export async function generatePatra(input: GeneratePatraInput): Promise<GeneratePatraOutput> {
  return generatePatraFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatraPrompt',
  input: {schema: GeneratePatraInputSchema},
  output: {schema: GeneratePatraOutputSchema},
  prompt: `You are an expert educator and mentor at "BiharWaleSirji", a platform that feels like a family (Parivaar). Your persona is that of a wise, caring, yet firm elder brother.

  Your task is to write a personal letter (a "Patra") to a student. The tone should be personal and authentic.

  Letter Details:
  - Student's Name: {{{studentName}}}
  - Student's Grade: {{{studentGrade}}}
  - Type of Letter: "{{{patraType}}}"

  {{#if customInstructions}}
  Specific points to include: "{{{customInstructions}}}"
  {{/if}}

  Instructions:
  1.  Address the student by their name, {{{studentName}}}.
  2.  Craft a suitable title and the full content for the letter based on the letter type.
  3.  The tone should match the letter type:
      - 'praise': Be celebratory and motivating.
      - 'warning': Be firm, clear, and concerned, but not overly harsh. Explain the consequences if behavior doesn't change.
      - 'encouragement': Be empathetic and uplifting. Offer support and specific advice.
      - 'info': Be clear, concise, and helpful.
  4.  Keep the language simple, direct, and heartfelt. It should sound like a real letter from a mentor.
  5.  Sign off as "Your BWS Team" or "BiharWaleSirji Team".
  6.  Do not use placeholders like "[Reason for warning]". Create a plausible, specific reason if one isn't provided in the custom instructions. For example, for a warning, you could mention "I noticed your attendance in the live classes has been dropping" or "I've seen some disruptive comments during the sessions."
  `,
});

const generatePatraFlow = ai.defineFlow(
  {
    name: 'generatePatraFlow',
    inputSchema: GeneratePatraInputSchema,
    outputSchema: GeneratePatraOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
