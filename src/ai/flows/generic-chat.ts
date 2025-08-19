
'use server';
/**
 * @fileOverview A generic conversational AI flow.
 *
 * - genericChat - A function that handles general conversation.
 * - GenericChatInput - The input type for the genericChat function.
 * - GenericChatOutput - The return type for the genericChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {MessageData, roleSchema} from "genkit";


const GenericChatInputSchema = z.object({
  history: z.array(z.object({
    role: roleSchema,
    content: z.array(z.object({
        text: z.string(),
    })),
  })).describe("The history of the conversation so far."),
  message: z.string().describe('The latest message from the user.'),
});
export type GenericChatInput = z.infer<typeof GenericChatInputSchema>;

const GenericChatOutputSchema = z.object({
  answer: z.string().describe('The AI\'s response to the user.'),
});
export type GenericChatOutput = z.infer<typeof GenericChatOutputSchema>;

export async function genericChat(input: GenericChatInput): Promise<GenericChatOutput> {
  return genericChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'genericChatPrompt',
  input: {schema: GenericChatInputSchema},
  output: {schema: GenericChatOutputSchema},
  prompt: `You are BhaiyaBot, a friendly and helpful AI mentor for students preparing for competitive exams in India. Your persona is that of a knowledgeable and encouraging elder brother. Your primary goal is to help students, answer their questions, and keep them motivated.

  Keep your answers concise, helpful, and in a conversational tone. Use simple language.

  Here is the conversation history:
  {{#each history}}
    {{#if (eq role 'user')}}You: {{content.[0].text}}{{/if}}
    {{#if (eq role 'assistant')}}BhaiyaBot: {{content.[0].text}}{{/if}}
  {{/each}}

  The user just said:
  "{{{message}}}"

  Your response:
  `,
});


const genericChatFlow = ai.defineFlow(
  {
    name: 'genericChatFlow',
    inputSchema: GenericChatInputSchema,
    outputSchema: GenericChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
