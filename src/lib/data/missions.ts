
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
} from "firebase/firestore";
import type { DailyMission } from "@/types";

interface SetMissionData {
    courseId: string;
    subjectId: string;
    details: string;
}

/**
 * Sets or updates the mission for a specific subject on the current day.
 * The document ID is a combination of date and subject ID to ensure one mission per subject per day.
 */
export const setMission = async (data: SetMissionData) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const missionId = `${today}_${data.subjectId}`;
    const missionRef = doc(db, `courses/${data.courseId}/missions`, missionId);

    const missionDoc = await getDoc(missionRef);

    const missionData: Partial<DailyMission> = {
        courseId: data.courseId,
        subjectId: data.subjectId,
        details: data.details,
        missionDate: today,
        updatedAt: serverTimestamp() as Timestamp,
    };

    if (missionDoc.exists()) {
        await setDoc(missionRef, missionData, { merge: true });
    } else {
        await setDoc(missionRef, {
            ...missionData,
            createdAt: serverTimestamp() as Timestamp,
        });
    }
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
        orderBy("missionDate", "desc")
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyMission));
};
