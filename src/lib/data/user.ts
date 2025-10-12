
"use client";

import { db } from "@/lib/firebase/client";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

/**
 * Saves a push notification token to the user's profile.
 */
export const savePushToken = async (userId: string, token: string): Promise<void> => {
  if (!userId || !token) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    pushTokens: arrayUnion(token)
  });
};

/**
 * Removes a push notification token from the user's profile.
 */
export const removePushToken = async (userId: string, token: string): Promise<void> => {
    if (!userId || !token) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        pushTokens: arrayRemove(token)
    });
};
