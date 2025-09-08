
"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { Patra, PatraType } from "@/types";

interface SendPatraData {
    senderId: string;
    senderName: string;
    recipientId: string;
    type: PatraType;
    title: string;
    content: string;
}

/**
 * Sends a personal letter (Patra) to a specific user.
 * It will be stored in a subcollection within the recipient's user document.
 */
export const sendPatra = async (data: SendPatraData): Promise<void> => {
    const patraCollectionRef = collection(db, `users/${data.recipientId}/patra`);
    await addDoc(patraCollectionRef, {
        ...data,
        isRead: false,
        createdAt: serverTimestamp(),
    });
};

/**
 * Listens for incoming letters for a specific user in real-time.
 * @param userId The ID of the user whose mailbox to listen to.
 * @param callback A function to be called with the array of letters.
 * @returns An unsubscribe function to stop listening.
 */
export const listenForUserPatra = (
    userId: string,
    callback: (patra: Patra[]) => void
): (() => void) => {
    const patraCollectionRef = collection(db, `users/${userId}/patra`);
    const q = query(patraCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const letters = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Patra));
        callback(letters);
    }, (error) => {
        console.error("Error listening for Patra:", error);
        callback([]);
    });

    return unsubscribe;
};

/**
 * Marks a specific letter as read.
 */
export const markPatraAsRead = async (userId: string, patraId: string): Promise<void> => {
    const patraDocRef = doc(db, `users/${userId}/patra`, patraId);
    await updateDoc(patraDocRef, {
        isRead: true,
    });
};

/**
 * Deletes a specific letter from a user's mailbox.
 */
export const deletePatra = async (userId: string, patraId: string): Promise<void> => {
    const patraDocRef = doc(db, `users/${userId}/patra`, patraId);
    await deleteDoc(patraDocRef);
};
