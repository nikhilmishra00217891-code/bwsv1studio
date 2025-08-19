"use server";

import { answerQuestionsAboutCourse, helpStudentsFindRelevantCourses } from "@/ai/flows";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function askAiMentor(
  messages: Message[],
  courseContext?: string
): Promise<string> {
  const lastUserMessage = messages.findLast((m) => m.role === 'user')?.content;

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

  // Default response if no specific flow is triggered
  return "That's a great question! While I'm best at recommending courses or answering questions about a specific one, I'll do my best to help. What subject are you studying?";
}
