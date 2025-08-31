
"use client";

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
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import type { Announcement, CourseAnnouncement } from "@/types";

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
    
    const newDocSnap = await getDoc(docRef);
    const newDocData = newDocSnap.data();
    return { 
        id: newDocSnap.id, 
        ...newDocData,
        createdAt: newDocData?.createdAt,
     } as Announcement;
};

// This function can be used for initial load if needed, but real-time is preferred.
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const announcementsCol = collection(db, "announcements");
  const q = query(announcementsCol, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Announcement)
  );
};

export const listenForAnnouncements = (callback: (announcements: Announcement[]) => void) => {
    const announcementsCol = collection(db, "announcements");
    const q = query(announcementsCol, orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        callback(announcements);
    }, (error) => {
        console.error("Error listening for announcements:", error);
    });

    return unsubscribe;
}


export const toggleAnnouncementReaction = async (announcementId: string, userId: string) => {
    const announcementRef = doc(db, "announcements", announcementId);
    const announcementSnap = await getDoc(announcementRef);

    if (!announcementSnap.exists()) {
        throw new Error("Announcement not found");
    }

    const reactions: string[] = announcementSnap.data().reactions || [];

    if (reactions.includes(userId)) {
        await updateDoc(announcementRef, {
            reactions: arrayRemove(userId),
        });
    } else {
        await updateDoc(announcementRef, {
            reactions: arrayUnion(userId),
        });
    }
};

export const updateAnnouncement = async (announcementId: string, newText: string) => {
    const announcementRef = doc(db, 'announcements', announcementId);
    await updateDoc(announcementRef, {
        text: newText,
        updatedAt: serverTimestamp(),
    });
};

export const deleteAnnouncement = async (announcementId: string) => {
    const announcementRef = doc(db, 'announcements', announcementId);
    await deleteDoc(announcementRef);
};


// --- Course Specific Announcements ---

export const createCourseAnnouncement = async (courseId: string, data: Omit<CourseAnnouncement, 'id' | 'createdAt' | 'reactions' | 'isPinned'>): Promise<void> => {
    const courseAnnouncementsCol = collection(db, `courses/${courseId}/announcements`);
    await addDoc(courseAnnouncementsCol, {
        ...data,
        createdAt: serverTimestamp(),
        reactions: [],
        isPinned: false,
    });
};

export const listenForCourseAnnouncements = (courseId: string, callback: (announcements: CourseAnnouncement[]) => void) => {
    const courseAnnouncementsCol = collection(db, `courses/${courseId}/announcements`);
    const q = query(courseAnnouncementsCol, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseAnnouncement));
        callback(announcements);
    }, (error) => {
        console.error(`Error listening for announcements in course ${courseId}:`, error);
    });

    return unsubscribe;
}
