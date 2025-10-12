
import { auth as adminAuth } from "firebase-admin";
import { cookies } from "next/headers";
import { getAdminDb } from "./admin";
import { UserProfile } from "@/types";
import { doc, getDoc } from "firebase/firestore";

export const getSession = async () => {
    try {
        const sessionCookie = cookies().get("session")?.value;
        if (!sessionCookie) return { user: null };
        
        const decodedClaims = await adminAuth().verifySessionCookie(sessionCookie, true);
        return { user: decodedClaims };
    } catch (error) {
        // This will catch errors for expired or invalid session cookies.
        // It's expected behavior for logged-out users or after a session expires.
        return { user: null };
    }
}

export const isFaculty = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
        const adminDb = getAdminDb();
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDocSnap = await userDocRef.get();
        return userDocSnap.exists && userDocSnap.data()?.role === 'faculty';
    } catch (error) {
        console.error("Error checking faculty status:", error);
        return false;
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
        return docSnap.data() as UserProfile;
    }
    return null;
}
