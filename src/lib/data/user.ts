
"use client";

import { db } from "@/lib/firebase/client";
import type { UserProfile } from "@/types";
import type { User } from "firebase/auth";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Creates a new student profile document in Firestore.
 */
export const createStudentProfile = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || '',
        role: 'student',
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newUserProfile, { merge: true });
}

// This function is no longer needed on the client, as creation is handled by a server action.
// We keep it commented out for reference in case of future refactoring.
/*
export const createFacultyProfile = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || '',
        role: 'faculty',
        onboardingComplete: true, // Faculty members bypass student onboarding
        createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newUserProfile, { merge: true });
}
*/

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

// Firestore does not allow `undefined` values. This function recursively
// cleans the profile data, converting `undefined` to `null`.
const cleanDataForFirestore = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    
    if (Array.isArray(data)) {
        return data.map(cleanDataForFirestore);
    }
    
    const cleaned: { [key: string]: any } = {};
    for (const key of Object.keys(data)) {
        const value = data[key];
        if (value !== undefined) {
            cleaned[key] = cleanDataForFirestore(value);
        } else {
            cleaned[key] = null; // Convert undefined to null
        }
    }
    return cleaned;
}

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    const userDocRef = doc(db, "users", userId);
    const cleanedData = cleanDataForFirestore(profileData);
    await updateDoc(userDocRef, cleanedData);
}

    