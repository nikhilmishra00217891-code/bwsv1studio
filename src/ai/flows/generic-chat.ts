
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
import { getTextContent } from '@/lib/data/content';


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

const defaultSystemPrompt = `You are BWS Buddy, a friendly and helpful AI mentor for students preparing for competitive exams in India. Your persona is that of a knowledgeable and encouraging elder brother. Your primary goal is to help students, answer their questions, and keep them motivated.

You should use your general knowledge to answer questions conversationally.

Keep your answers concise, helpful, and in a conversational tone. Use simple language.`;

const genericChatFlow = ai.defineFlow(
  {
    name: 'genericChatFlow',
    inputSchema: GenericChatInputSchema,
    outputSchema: GenericChatOutputSchema,
  },
  async (input) => {

    const allContent = await getTextContent();
    const systemPrompt = allContent.bwsBuddySystemPrompt as string || defaultSystemPrompt;

    const history: MessageData[] = input.history.map(h => ({
      role: h.role,
      content: h.content,
    }));

    const { text } = await ai.generate({
      system: systemPrompt,
      history,
      prompt: input.message,
    });

    return { answer: text };
  }
);
