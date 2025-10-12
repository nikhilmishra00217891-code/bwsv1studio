'use server';
/**
 * @fileOverview A Genkit flow for sending push notifications to users.
 *
 * - sendNotification - A function that sends a push notification to a list of users.
 * - SendNotificationInput - The input type for the sendNotification function.
 * - SendNotificationOutput - The return type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { customInitApp, firestore as adminFirestore } from '@/lib/firebase/admin';
import type { UserProfile } from '@/types';

// Ensure Firebase Admin is initialized
customInitApp();

const SendNotificationInputSchema = z.object({
  recipientIds: z.array(z.string()).describe("An array of user UIDs to send the notification to."),
  title: z.string().describe("The title of the push notification."),
  body: z.string().describe("The main message content of the push notification."),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

const SendNotificationOutputSchema = z.object({
  success: z.boolean().describe("Whether the operation was successful."),
  message: z.string().describe("A summary of the result."),
});
export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;


export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationOutput> {
  return sendNotificationFlow(input);
}


const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async (input) => {
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
        console.error('Critical Error in sendNotificationFlow:', error);
        // This will provide a much more detailed error message
        if (error.code === 'messaging/authentication-error') {
             return { success: false, message: "Firebase Authentication Error: The service account key might be invalid or missing permissions. Please check your project settings." };
        }
        if (error.code === 'app/invalid-credential') {
             return { success: false, message: "Invalid Firebase Credential: The server's service account key is malformed or invalid. Please check your configuration." };
        }
        if (error.message.includes("Billing account not configured")) {
            return { success: false, message: "Firebase Billing Error: Your project might need to be upgraded to the Blaze plan to use this feature."};
        }
        return { success: false, message: `An unknown server error occurred: ${error.message}` };
    }
  }
);
