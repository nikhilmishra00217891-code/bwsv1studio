
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const CONTENT_DOC_REF = doc(db, "siteContent", "text");

export const getTextContent = async (): Promise<Record<string, string>> => {
    try {
        const docSnap = await getDoc(CONTENT_DOC_REF);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return {};
    } catch (error) {
        console.error("Error fetching text content:", error);
        return {};
    }
}

export const saveTextContent = async (contentId: string, newText: string) => {
    try {
        await updateDoc(CONTENT_DOC_REF, {
            [contentId]: newText
        });
    } catch (error: any) {
        if (error.code === 'not-found') {
            await setDoc(CONTENT_DOC_REF, { [contentId]: newText });
        } else {
            console.error("Error saving text content:", error);
            throw error;
        }
    }
}
