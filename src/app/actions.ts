
"use server";

import { answerQuestionsAboutCourse, helpStudentsFindRelevantCourses, genericChat } from "@/ai/flows";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function askAiMentor(
  messages: Message[],
  courseContext?: string
): Promise<string> {
  const lastUserMessage = messages.findLast((m) => m.role === 'user')?.content;
  const history = messages.slice(0, -1); // Pass previous messages as history

  if (!lastUserMessage) {
    return "I'm sorry, I didn't get your message. Could you please repeat it?";
  }

  // If a specific course context is provided (e.g., from a course page)
  if (courseContext) {
    try {
      const result = await answerQuestionsAboutCourse({
        courseId: courseContext,
        question: lastUserMessage,
      });
      return result.answer;
    } catch (error) {
      console.error(`AI Error for course ${courseContext}:`, error);
      return "I seem to be having trouble recalling details about this specific course right now. Could you ask a general question instead?";
    }
  }

  // Heuristics to decide which flow to use for general queries
  const lowerCaseMessage = lastUserMessage.toLowerCase();
  
  const recommendationKeywords = ['recommend', 'suggest', 'find courses', 'which course', 'help me choose'];

  if (recommendationKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
    try {
      const result = await helpStudentsFindRelevantCourses({
        interests: lastUserMessage,
        goals: "achieve academic excellence", // Generic goal
      });
      
      if (result.relevantCourses.length > 0) {
        return `Based on your interests, I'd recommend looking into these courses: ${result.relevantCourses.join(", ")}. You can find them on our Courses page!`;
      } else {
        return "I couldn't find specific course recommendations for that. Could you tell me more about what subjects or exams you're interested in?";
      }
    } catch (error) {
        console.error('AI Error for course recommendation:', error);
        return "I'm having a bit of trouble with recommendations right now. Why not browse our full list on the Courses page?";
    }
  }

  // Default to the generic chat flow for all other cases
  try {
    const result = await genericChat({
      history: history.map(m => ({
          role: m.role,
          content: [{ text: m.content }],
      })),
      message: lastUserMessage,
    });
    return result.answer;
  } catch(error) {
    console.error('Generic AI chat error:', error);
    return "That's a great question! I'm having a little trouble thinking right now, but please ask me something else.";
  }
}
