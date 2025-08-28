
import { auth as adminAuth } from "firebase-admin";
import { cookies } from "next/headers";
import { customInitApp } from "./admin";
import { UserProfile } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

customInitApp();

export const getSession = async () => {
    try {
        const sessionCookie = cookies().get("session")?.value;
        if (!sessionCookie) return { user: null };
        
        const decodedClaims = await adminAuth().verifySessionCookie(sessionCookie, true);
        return { user: decodedClaims };
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return { user: null };
    }
}

export const isFaculty = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        return userDocSnap.exists() && userDocSnap.data().role === 'faculty';
    } catch (error) {
        console.error("Error checking faculty status:", error);
        return false;
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}
