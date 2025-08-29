
"use server";

import { answerQuestionsAboutCourse, helpStudentsFindRelevantCourses, genericChat, recommendContent } from "@/ai/flows";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function askAiMentor(
  messages: Message[],
  courseContext?: string
): Promise<string> {
  const lastUserMessage = messages.findLast((m) => m.role === 'user')?.content;
  
  // Filter out system messages before sending to AI
  const history = messages.filter(m => m.role !== 'system').slice(0, -1);

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

  // Default to the generic chat flow for all other cases
  try {
    const result = await genericChat({
      history: history.map(m => ({
          role: m.role as 'user' | 'assistant',
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

export async function submitFeedback(userId: string, feedback: string): Promise<{success: boolean, message: string}> {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.error("Discord webhook URL is not configured.");
    return { success: false, message: "Feedback system is not configured."};
  }

  if (!userId) {
    return { success: false, message: "You must be logged in to submit feedback."}
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return { success: false, message: "User profile not found." };
    }

    const profile = userDocSnap.data() as UserProfile;
    
    const embed = {
      title: "New Feedback Submitted! 📝",
      description: feedback,
      color: 0xF99006, // BiharWaleSirji Orange
      fields: [
        { name: "User", value: `${profile.displayName} (\`${profile.email}\`)`, inline: true },
        { name: "User ID", value: `\`${profile.uid}\``, inline: true },
        { name: "Role", value: profile.role || 'N/A', inline: true },
        { name: "Grade", value: profile.grade || 'N/A', inline: true },
        { name: "Board", value: profile.board || 'N/A', inline: true },
        { name: "Phone", value: `${profile.mobile?.countryCode || ''} ${profile.mobile?.number || 'N/A'}`, inline: true},
        { name: "Goals", value: profile.goals?.join(', ') || 'N/A' },
        { name: "Subjects", value: profile.subjects?.join(', ') || 'N/A' },
        { name: "Learning Style", value: profile.learningStyle?.join(', ') || 'N/A' },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: `BiharWaleSirji Feedback System`
      }
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (!response.ok) {
      console.error('Discord API Error:', response.status, await response.text());
      throw new Error("Could not send feedback to Discord.");
    }
    
    return { success: true, message: "Feedback submitted successfully!" };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, message: "An unexpected error occurred while submitting your feedback." };
  }
}

export async function suspendUser(userId: string, reason: string): Promise<{success: boolean, message: string}> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const suspensionData = {
        isSuspended: true,
        reason: reason,
        suspendedAt: serverTimestamp(),
    };
    await updateDoc(userDocRef, { suspension: suspensionData });
    return { success: true, message: "User successfully suspended." };
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}

export async function unsuspendUser(userId: string): Promise<{success: boolean, message: string}> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const suspensionData = {
        isSuspended: false,
        reason: "",
        suspendedAt: null,
    };
    await updateDoc(userDocRef, { suspension: suspensionData });
    return { success: true, message: "User successfully unsuspended." };
  } catch (error: any) {
    console.error("Error unsuspending user:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}

const CONTENT_DOC_REF = doc(db, "siteContent", "text");

export async function addKnowledgeBaseUrl(url: string): Promise<{success: boolean, message: string}> {
    try {
        await updateDoc(CONTENT_DOC_REF, {
            knowledgeBaseUrls: arrayUnion(url)
        });
        return { success: true, message: "URL added to knowledge base." };
    } catch (error: any) {
         if (error.code === 'not-found') {
            await setDoc(CONTENT_DOC_REF, { knowledgeBaseUrls: [url] });
            return { success: true, message: "URL added to knowledge base." };
        } else {
            console.error("Error adding URL:", error);
            return { success: false, message: error.message || "An unexpected error occurred." };
        }
    }
}

export async function removeKnowledgeBaseUrl(url: string): Promise<{success: boolean, message: string}> {
    try {
        await updateDoc(CONTENT_DOC_REF, {
            knowledgeBaseUrls: arrayRemove(url)
        });
        return { success: true, message: "URL removed from knowledge base." };
    } catch (error: any) {
        console.error("Error removing URL:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}
