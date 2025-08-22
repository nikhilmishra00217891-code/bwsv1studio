
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
