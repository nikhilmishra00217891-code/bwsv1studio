
'use server';

import { getMessaging } from 'firebase-admin/messaging';
import { customInitApp } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types';

interface SendNotificationData {
  title: string;
  body: string;
  recipientIds: string[];
}

export const sendBulkNotification = async (
  data: SendNotificationData
): Promise<{ success: boolean; message: string }> => {
  try {
    // Ensure Firebase Admin is initialized on each serverless function invocation
    customInitApp();
    
    if (data.recipientIds.length === 0) {
      return { success: false, message: 'No recipients selected.' };
    }

    // 1. Fetch all user profiles to get push tokens
    const userDocs = await Promise.all(
      data.recipientIds.map(id => getDoc(doc(db, 'users', id)))
    );

    // 2. Collect all unique, valid push tokens
    const tokens = userDocs.reduce<string[]>((acc, userDoc) => {
      if (userDoc.exists()) {
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

    // 3. Construct the message payload
    const message = {
      notification: {
        title: data.title,
        body: data.body,
      },
      tokens: uniqueTokens,
      webpush: {
        fcmOptions: {
            // This link will be opened when the notification is clicked.
            link: '/dashboard'
        }
      }
    };

    // 4. Send the message using Firebase Admin SDK
    const response = await getMessaging().sendMulticast(message);
    
    const successCount = response.successCount;
    const failureCount = response.failureCount;

    console.log(`${successCount} messages were sent successfully`);
    if (failureCount > 0) {
      console.error(`${failureCount} messages failed to send.`);
      const failedTokens: string[] = [];
       response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(uniqueTokens[idx]);
          console.error(`Failed to send to token ${uniqueTokens[idx]}:`, resp.error);
        }
      });
      
       return {
            success: successCount > 0,
            message: `${successCount} notifications sent. ${failureCount} failed. Check server logs for details.`
       }
    }

    return { success: true, message: `${successCount} notifications sent successfully!` };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
};
