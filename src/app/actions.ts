

"use server";

import { answerQuestionsAboutCourse, helpStudentsFindRelevantCourses, genericChat, recommendContent } from "@/ai/flows";
import type { UserProfile } from "@/types";
import { JSDOM } from 'jsdom';
import { getAdminDb } from "@/lib/firebase/admin";
import { getMessaging } from "firebase-admin/messaging";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

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
    const result = await answerQuestionsAboutCourse({
      courseId: courseContext,
      question: lastUserMessage,
    });
    return result.answer;
  }

  // Default to the generic chat flow for all other cases
  const result = await genericChat({
    history: history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: [{ text: m.content }],
    })),
    message: lastUserMessage,
  });
  return result.answer;
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
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
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
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const suspensionData = {
        isSuspended: true,
        reason: reason,
        suspendedAt: FieldValue.serverTimestamp(),
    };
    await userDocRef.update({ suspension: suspensionData });
    return { success: true, message: "User successfully suspended." };
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}

export async function unsuspendUser(userId: string): Promise<{success: boolean, message: string}> {
  try {
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const suspensionData = {
        isSuspended: false,
        reason: null,
        suspendedAt: null,
    };
    await userDocRef.update({ suspension: suspensionData });
    return { success: true, message: "User successfully unsuspended." };
  } catch (error: any) {
    console.error("Error unsuspending user:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}

const CONTENT_DOC_REF_PATH = "siteContent/text";

export async function addKnowledgeBaseUrl(url: string): Promise<{success: boolean, message: string}> {
    try {
        const adminDb = getAdminDb();
        const contentDocRef = adminDb.doc(CONTENT_DOC_REF_PATH);
        await contentDocRef.update({
            knowledgeBaseUrls: FieldValue.arrayUnion(url)
        });
        return { success: true, message: "URL added to knowledge base." };
    } catch (error: any) {
         if (error.code === 'not-found' || error.code === 5) {
            const adminDb = getAdminDb();
            const contentDocRef = adminDb.doc(CONTENT_DOC_REF_PATH);
            await contentDocRef.set({ knowledgeBaseUrls: [url] });
            return { success: true, message: "URL added to knowledge base." };
        } else {
            console.error("Error adding URL:", error);
            return { success: false, message: error.message || "An unexpected error occurred." };
        }
    }
}

export async function removeKnowledgeBaseUrl(url: string): Promise<{success: boolean, message: string}> {
    try {
        const adminDb = getAdminDb();
        const contentDocRef = adminDb.doc(CONTENT_DOC_REF_PATH);
        await contentDocRef.update({
            knowledgeBaseUrls: FieldValue.arrayRemove(url)
        });
        return { success: true, message: "URL removed from knowledge base." };
    } catch (error: any) {
        console.error("Error removing URL:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}


export async function getUrlMetadata(url: string): Promise<{ url: string; title: string; description: string; image: string; siteName: string } | null> {
    try {
        const response = await fetch(url, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            return null;
        }

        const html = await response.text();
        const { document } = new JSDOM(html).window;

        const getMeta = (prop: string) => document.querySelector(`meta[property='${prop}']`)?.getAttribute('content') || document.querySelector(`meta[name='${prop}']`)?.getAttribute('content');

        const title = getMeta('og:title') || document.title || 'No title found';
        const description = getMeta('og:description') || getMeta('description') || 'No description found.';
        let image = getMeta('og:image') || getMeta('twitter:image') || '';
        const siteName = getMeta('og:site_name') || new URL(url).hostname;
        
        // Ensure image URL is absolute
        if (image && !image.startsWith('http')) {
            const urlObj = new URL(url);
            image = new URL(image, urlObj.origin).href;
        }

        return { url, title, description, image, siteName };
    } catch (error) {
        console.error(`Failed to fetch metadata for ${url}:`, error);
        return null;
    }
}

interface SendNotificationInput {
  recipientIds: string[];
  title: string;
  body: string;
}

export async function sendNotification(input: SendNotificationInput): Promise<{ success: boolean; message: string; }> {
  const adminFirestore = getAdminDb();

  try {
    if (input.recipientIds.length === 0) {
      return { success: false, message: 'No recipients selected.' };
    }

    const userDocsPromises = input.recipientIds.map(id =>
      adminFirestore.collection('users').doc(id).get()
    );
    const userDocs = await Promise.all(userDocsPromises);

    const tokens = userDocs.reduce<string[]>((acc, userDoc) => {
      if (userDoc.exists) {
        const userProfile = userDoc.data() as UserProfile;
        if (userProfile.pushTokens && userProfile.pushTokens.length > 0) {
          acc.push(...userProfile.pushTokens);
        }
      }
      return acc;
    }, []);

    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) {
      return { success: false, message: 'No registered devices found for the selected users.' };
    }

    const message = {
      notification: {
        title: input.title,
        body: input.body,
      },
      tokens: uniqueTokens,
      webpush: {
        fcmOptions: {
          link: '/dashboard'
        }
      }
    };

    const response = await getMessaging().sendEachForMulticast(message);

    const successCount = response.successCount;
    const failureCount = response.failureCount;

    if (failureCount > 0) {
      console.error(`Failed to send ${failureCount} notifications.`);
      response.responses.forEach(resp => {
        if (!resp.success) {
          console.error('FCM Error:', resp.error);
        }
      });
      return {
        success: successCount > 0,
        message: `${successCount} sent, ${failureCount} failed. Check server logs for details.`
      };
    }

    return { success: true, message: `${successCount} notifications sent successfully!` };

  } catch (error: any) {
    console.error('Critical Error in sendNotification:', error);
    if (error.code === 'messaging/authentication-error' || error.code === 'app/invalid-credential') {
      return { success: false, message: "Firebase Authentication Error: The service account key might be invalid or missing permissions. Please check your project settings." };
    }
    if (error.message.includes("Billing account not configured")) {
        return { success: false, message: "Firebase Billing Error: Your project might need to be upgraded to the Blaze plan to use this feature."};
    }
    return { success: false, message: `An unknown server error occurred: ${error.message}` };
  }
}
