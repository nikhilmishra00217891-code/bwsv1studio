
'use server';
/**
 * @fileOverview An AI flow for recommending content based on a student's query.
 *
 * - recommendContent - A function that handles the content recommendation process.
 * - RecommendContentInput - The input type for the recommendContent function.
 * - RecommendContentOutput - The return type for the recommendContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendContentInputSchema = z.object({
  query: z.string().describe("The student's query, e.g., 'I'm weak in quadratic equations' or 'Physics notes'."),
});
export type RecommendContentInput = z.infer<typeof RecommendContentInputSchema>;

const RecommendationSchema = z.object({
    type: z.enum(['video', 'notes', 'course', 'practice_questions']).describe("The type of content being recommended."),
    title: z.string().describe("The title of the recommended content."),
    link: z.string().describe("A direct link to the content."),
    reason: z.string().describe("A short reason why this content is being recommended for the user's query."),
});

const RecommendContentOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).describe("A list of content recommendations."),
});
export type RecommendContentOutput = z.infer<typeof RecommendContentOutputSchema>;


export async function recommendContent(input: RecommendContentInput): Promise<RecommendContentOutput> {
  return recommendContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendContentPrompt',
  input: {schema: RecommendContentInputSchema},
  output: {schema: RecommendContentOutputSchema},
  prompt: `You are a helpful AI course advisor. A student has asked for help with a topic. Your task is to recommend the best content to help them.

  Student's Query: "{{{query}}}"

  Based on this query, provide a list of relevant content recommendations. The content can be a video, notes, a full course, or practice questions. For each recommendation, provide a title, a link, and a brief reason for the recommendation.

  If you don't have a specific recommendation, you can invent plausible-sounding ones based on the query. For example, if the query is about "quadratic equations," you could recommend a video titled "Mastering Quadratic Equations in 30 Mins" or notes titled "Comprehensive Notes on Quadratic Equations".
  `,
});

const recommendContentFlow = ai.defineFlow(
  {
    name: 'recommendContentFlow',
    inputSchema: RecommendContentInputSchema,
    outputSchema: RecommendContentOutputSchema,
  },
  async input => {
    // In a real app, you would have a database of content to search.
    // For now, we will let the LLM generate plausible recommendations based on the query.
    const {output} = await prompt(input);
    return output!;
  }
);
