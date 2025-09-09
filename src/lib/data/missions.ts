
'use client';

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    Timestamp,
    addDoc,
    orderBy,
} from "firebase/firestore";
import type { DailyMission } from "@/types";

interface SetMissionData {
    courseId: string;
    subjectId: string;
    details: string;
}

/**
 * Sets a mission for a specific subject on the current day.
 * This now creates a new document for every save, preserving history.
 */
export const setMission = async (data: SetMissionData) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const missionColRef = collection(db, `courses/${data.courseId}/missions`);

    const missionData: Omit<DailyMission, 'id'> = {
        courseId: data.courseId,
        subjectId: data.subjectId,
        details: data.details,
        missionDate: today,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp, // Can be used to show last edit time
    };

    await addDoc(missionColRef, missionData);
};

/**
 * Retrieves all missions for a specific date across all subjects in a course.
 */
export const getMissionsForDate = async (courseId: string, date: string): Promise<DailyMission[]> => {
    const missionsCol = collection(db, `courses/${courseId}/missions`);
    const q = query(missionsCol, where("missionDate", "==", date));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyMission));
};

/**
 * Retrieves mission history for a specific subject.
 */
export const getMissionHistoryForSubject = async (courseId: string, subjectId: string): Promise<DailyMission[]> => {
    const missionsCol = collection(db, `courses/${courseId}/missions`);
    const q = query(
        missionsCol, 
        where("subjectId", "==", subjectId),
        orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyMission));
};
