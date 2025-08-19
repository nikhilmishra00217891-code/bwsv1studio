
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  type Timestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

export interface Announcement {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: Timestamp;
  reactions: string[]; // Array of user IDs who have reacted
}

interface CreateAnnouncementData {
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
}

export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
    const announcementsCol = collection(db, "announcements");
    const docRef = await addDoc(announcementsCol, {
        ...data,
        createdAt: serverTimestamp(),
        reactions: [],
    });
    
    // We fetch the document again to get the server-generated timestamp
    const newDocSnap = await getDoc(docRef);
    return { id: newDocSnap.id, ...newDocSnap.data() } as Announcement;
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const announcementsCol = collection(db, "announcements");
  const q = query(announcementsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Announcement)
  );
};

export const toggleAnnouncementReaction = async (announcementId: string, userId: string) => {
    const announcementRef = doc(db, "announcements", announcementId);
    const announcementSnap = await getDoc(announcementRef);

    if (!announcementSnap.exists()) {
        throw new Error("Announcement not found");
    }

    const reactions: string[] = announcementSnap.data().reactions || [];

    if (reactions.includes(userId)) {
        // User has already reacted, so remove their reaction
        await updateDoc(announcementRef, {
            reactions: arrayRemove(userId),
        });
    } else {
        // User has not reacted, so add their reaction
        await updateDoc(announcementRef, {
            reactions: arrayUnion(userId),
        });
    }
};
