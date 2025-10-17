

"use client";

import { db } from "@/lib/firebase/client";
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
  runTransaction,
  where,
  limit,
} from "firebase/firestore";
import type { Announcement, CourseAnnouncement, Poll } from "@/types";

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

export const createCourseAnnouncement = async (courseId: string, data: Partial<CourseAnnouncement>): Promise<void> => {
    const courseAnnouncementsCol = collection(db, `courses/${courseId}/announcements`);
    await addDoc(courseAnnouncementsCol, {
        ...data,
        createdAt: serverTimestamp(),
        reactions: data.reactions || [],
        isPinned: data.isPinned || false,
    });
};

export const deleteCourseAnnouncement = async (courseId: string, announcementId: string): Promise<void> => {
    const announcementRef = doc(db, `courses/${courseId}/announcements`, announcementId);
    await deleteDoc(announcementRef);
}

export const listenForCourseAnnouncements = (courseId: string, callback: (announcements: CourseAnnouncement[]) => void) => {
    const courseAnnouncementsCol = collection(db, `courses/${courseId}/announcements`);
    const q = query(courseAnnouncementsCol, orderBy("isPinned", "desc"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseAnnouncement));
        callback(announcements);
    }, (error) => {
    });

    return unsubscribe;
}

export const voteOnCoursePoll = async (courseId: string, announcementId: string, optionIndex: number, userId: string) => {
    const announcementRef = doc(db, `courses/${courseId}/announcements`, announcementId);

    await runTransaction(db, async (transaction) => {
        const annDoc = await transaction.get(announcementRef);
        if (!annDoc.exists() || annDoc.data().type !== 'poll') {
            throw new Error("Poll not found.");
        }

        const pollData = annDoc.data().poll as Poll;

        pollData.options.forEach(opt => {
            if (!opt.voterIds) opt.voterIds = [];
        });
        
        const hasVoted = pollData.options.some(opt => opt.voterIds.includes(userId));
        if (hasVoted) {
            throw new Error("You have already voted on this poll.");
        }

        if (optionIndex < 0 || optionIndex >= pollData.options.length) {
            throw new Error("Invalid option selected.");
        }

        pollData.options[optionIndex].voterIds.push(userId);

        transaction.update(announcementRef, { poll: pollData });
    });
}

export const toggleCourseAnnouncementReaction = async (
  courseId: string,
  announcementId: string,
  emoji: string,
  userId: string
) => {
  const announcementRef = doc(db, `courses/${courseId}/announcements`, announcementId);

  await runTransaction(db, async (transaction) => {
    const announcementDoc = await transaction.get(announcementRef);
    if (!announcementDoc.exists()) {
      throw new Error("Announcement not found");
    }

    const announcementData = announcementDoc.data() as CourseAnnouncement;
    const reactions = announcementData.reactions || [];
    const reactionIndex = reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex > -1) {
      const userIndex = reactions[reactionIndex].userIds.indexOf(userId);
      if (userIndex > -1) {
        reactions[reactionIndex].userIds.splice(userIndex, 1);
        if (reactions[reactionIndex].userIds.length === 0) {
          reactions.splice(reactionIndex, 1);
        }
      } else {
        reactions[reactionIndex].userIds.push(userId);
      }
    } else {
      reactions.push({ emoji, userIds: [userId] });
    }

    transaction.update(announcementRef, { reactions });
  });
};

export const toggleCourseAnnouncementPin = async (
  courseId: string,
  announcementId: string
) => {
    const announcementRef = doc(db, `courses/${courseId}/announcements`, announcementId);
    const announcementSnap = await getDoc(announcementRef);

    if (!announcementSnap.exists()) {
        throw new Error("Announcement not found.");
    }
    
    const isCurrentlyPinned = announcementSnap.data().isPinned || false;
    
    await updateDoc(announcementRef, {
        isPinned: !isCurrentlyPinned,
        pinnedAt: !isCurrentlyPinned ? serverTimestamp() : null
    });
};
