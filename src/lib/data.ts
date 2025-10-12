
'use server';

import type { Course, EnrolledCourse, UserProfile, Subject, Chapter, Lesson, LiveChatMessage } from "@/types";
import { firestore as adminDb } from "./firebase/admin"; 
import { Timestamp } from "firebase-admin/firestore";

const serializeTimestamps = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(serializeTimestamps);
    }

    const newObj: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newObj[key] = serializeTimestamps(data[key]);
        }
    }
    return newObj;
}

export const getCourses = async (isFaculty: boolean = false): Promise<Course[]> => {
  const coursesCol = adminDb.collection("courses");
  
  let query;
  if (isFaculty) {
    query = coursesCol.orderBy("title");
  } else {
    query = coursesCol.where("isActive", "==", true).orderBy("title");
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(
    (doc) => serializeTimestamps({ id: doc.id, ...doc.data() }) as Course
  );
};


export const getCoursesByIds = async (ids: string[]): Promise<Course[]> => {
    if (ids.length === 0) return [];
    
    const coursesCol = adminDb.collection("courses");
    // Firestore 'in' query is limited to 30 items. If you expect more, you'll need to batch requests.
    const snapshot = await coursesCol.where('__name__', 'in', ids).get();

    return snapshot.docs.map(doc => serializeTimestamps({ id: doc.id, ...doc.data() }) as Course);
}


export const getEnrolledCoursesForUser = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists) {
      const userData = userDocSnap.data() as UserProfile;
      const enrolledCourseIds: string[] = userData.enrolledCourses || [];

      if(enrolledCourseIds.length === 0) return [];

      const enrolledCoursesPromises = enrolledCourseIds.map(async (courseId) => {
        const courseData = await getCourseById(courseId);
        
        if(courseData) {
           const progressData = userData.progress?.[courseId];
           const completedLessons = progressData?.completedLessons || [];
           const totalLessons = courseData.subjects?.reduce((acc, sub) => acc + sub.chapters.reduce((cAcc, chap) => cAcc + chap.lessons.length, 0), 0) || 0;
           const progress = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

          return {
            courseId: courseData.id,
            title: courseData.title,
            category: courseData.category,
            thumbnail: courseData.thumbnail,
            progress: Math.round(progress),
            ...courseData
          };
        }
        return null;
      });
      
      const enrolledCourses = (await Promise.all(enrolledCoursesPromises)).filter((c): c is EnrolledCourse => c !== null);
      return enrolledCourses;

    } else {
      console.log("No such user!");
      return [];
    }
  } catch(error) {
    console.error("Error fetching enrolled courses:", error);
    return []; // Return empty array on error
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const usersCol = adminDb.collection("users");
    const q = usersCol.orderBy("displayName");
    const snapshot = await q.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return serializeTimestamps(data) as UserProfile;
    });
};




export async function getEnrolledCourseData(userId: string, courseId: string): Promise<{progress: number, completedLessons: string[]} | null> {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data()?.progress?.[courseId] || { progress: 0, completedLessons: [] };
}


export const getCompletedMissionsForUser = async (userId: string): Promise<Set<string>> => {
    const today = new Date().toISOString().split('T')[0];
    const docRef = adminDb.collection(`users/${userId}/missionCompletion`).doc(today);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const data = docSnap.data();
        return new Set(data?.completedMissions || []);
    }
    return new Set();
};

export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return false;
  }
  const enrolledCourses = userDoc.data()?.enrolledCourses || [];
  return enrolledCourses.includes(courseId);
}

export const getCourseById = async (id: string): Promise<Course | null> => {
    const courseDocRef = adminDb.collection('courses').doc(id);
    const docSnap = await courseDocRef.get();

    if (docSnap.exists) {
        return serializeTimestamps({ id: docSnap.id, ...docSnap.data() }) as Course;
    } else {
        return null;
    }
}
