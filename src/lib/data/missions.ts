
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
import type { DailyMission, Course, UserMission } from "@/types";

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
    
    // De-duplicate missions for the same subject, keeping only the latest one
    const missionsBySubject: Record<string, DailyMission> = {};
    snapshot.docs.forEach(doc => {
        const mission = { id: doc.id, ...doc.data() } as DailyMission;
        if (!missionsBySubject[mission.subjectId] || 
            mission.createdAt.toMillis() > missionsBySubject[mission.subjectId].createdAt.toMillis()) {
            missionsBySubject[mission.subjectId] = mission;
        }
    });

    return Object.values(missionsBySubject);
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


/**
 * Gets all active missions for a user based on their enrolled courses.
 */
export const getMissionsForUser = async (userId: string): Promise<UserMission[]> => {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists() || !userSnap.data().enrolledCourses) {
        return [];
    }

    const enrolledCourses: string[] = userSnap.data().enrolledCourses;
    const today = new Date().toISOString().split('T')[0];
    const allMissions: UserMission[] = [];

    for (const courseId of enrolledCourses) {
        const courseDocRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseDocRef);

        if (courseSnap.exists()) {
            const courseData = courseSnap.data() as Course;
            const dailyMissions = await getMissionsForDate(courseId, today);

            for (const mission of dailyMissions) {
                const subject = courseData.subjects.find(s => s.id === mission.subjectId);
                if (subject) {
                    allMissions.push({
                        courseTitle: courseData.title,
                        subjectTitle: subject.title,
                        details: mission.details,
                    });
                }
            }
        }
    }

    return allMissions;
};
