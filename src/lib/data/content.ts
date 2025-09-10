
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";

const CONTENT_DOC_REF = doc(db, "siteContent", "text");

// The document can now contain strings or arrays of strings
export const getTextContent = async (): Promise<Record<string, string | string[]>> => {
    try {
        const docSnap = await getDoc(CONTENT_DOC_REF);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        // If the doc doesn't exist, create it with empty defaults
        await setDoc(CONTENT_DOC_REF, { bwsBuddySystemPrompt: '', knowledgeBaseUrls: [] });
        return { bwsBuddySystemPrompt: '', knowledgeBaseUrls: [] };
    } catch (error) {
        console.error("Error fetching text content:", error);
        return {};
    }
}

// This function can now save either a string or an array of strings
export const saveTextContent = async (contentId: string, value: string | string[]) => {
    try {
        await updateDoc(CONTENT_DOC_REF, {
            [contentId]: value
        });
    } catch (error: any) {
        if (error.code === 'not-found') {
            await setDoc(CONTENT_DOC_REF, { [contentId]: value });
        } else {
            console.error("Error saving text content:", error);
            throw error;
        }
    }
}

export const removeAdUrls = async (scope: 'all' | string): Promise<{success: boolean; message: string}> => {
    try {
        const docSnap = await getDoc(CONTENT_DOC_REF);
        if (!docSnap.exists()) {
            return { success: true, message: "No content to remove." };
        }

        const data = docSnap.data();
        const updates: Record<string, any> = {};

        for (const key in data) {
            // Check if the key matches the announcement ad pattern
            if (key.startsWith('announcement_')) {
                if (scope === 'all') {
                    // Remove all announcement keys
                    updates[key] = '';
                } else {
                    // Remove only for the specific grade slug
                    const gradeSlug = `_${scope}`;
                    if (key.endsWith(gradeSlug)) {
                        updates[key] = '';
                    }
                }
            }
        }
        
        if(Object.keys(updates).length > 0) {
            await updateDoc(CONTENT_DOC_REF, updates);
        }

        return { success: true, message: "Ad URLs removed successfully." };
    } catch (error: any) {
        console.error("Error removing ad URLs:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}
