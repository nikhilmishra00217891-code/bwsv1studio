

import type { Course, Testimonial, EnrolledCourse, UserProfile, Subject, Chapter, Lesson, LiveChatMessage } from "@/types";
import { db } from "./firebase";
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, orderBy, onSnapshot, Timestamp, increment, arrayUnion, limit, arrayRemove } from "firebase/firestore";
import type { User } from "firebase/auth";

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
        newObj[key] = serializeTimestamps(data[key]);
    }
    return newObj;
}

export const getCourses = async (isFaculty: boolean = false): Promise<Course[]> => {
  const coursesCol = collection(db, "courses");
  
  let q;
  if (isFaculty) {
    // Faculty sees all courses
    q = query(coursesCol, orderBy("title"));
  } else {
    // Students only see active courses
    q = query(coursesCol, where("isActive", "==", true), orderBy("title"));
  }

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(
    (doc) => serializeTimestamps({ id: doc.id, ...doc.data() }) as Course
  );
};

export const listenForCourses = (isFaculty: boolean, callback: (courses: Course[]) => void): () => void => {
    const coursesCol = collection(db, "courses");
    
    let q;
    if (isFaculty) {
        // Faculty sees all courses, ordered by title
        q = query(coursesCol, orderBy("title"));
    } else {
        // Students only see active courses, ordered by title
        q = query(coursesCol, where("isActive", "==", true), orderBy("title"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            callback([]);
            return;
        }
        const courses = snapshot.docs.map(doc => serializeTimestamps({ id: doc.id, ...doc.data() }) as Course);
        callback(courses);
    }, (error) => {
        console.error("Error listening for courses:", error);
        // You might want to handle errors in the callback as well
        callback([]);
    });

    return unsubscribe; // Return the unsubscribe function
};

export const getCourseById = async (id: string): Promise<Course | null> => {
    const courseDocRef = doc(db, 'courses', id);
    const docSnap = await getDoc(courseDocRef);

    if (docSnap.exists()) {
        return serializeTimestamps({ id: docSnap.id, ...docSnap.data() }) as Course;
    } else {
        return null;
    }
}

export const getCoursesByIds = async (ids: string[]): Promise<Course[]> => {
    if (ids.length === 0) return [];
    
    const coursesCol = collection(db, "courses");
    // Firestore 'in' query is limited to 30 items. If you expect more, you'll need to batch requests.
    const q = query(coursesCol, where('__name__', 'in', ids));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => serializeTimestamps({ id: doc.id, ...doc.data() }) as Course);
}

interface CreateCourseData {
    title: string;
    category: string;
    grade: string;
    price: number;
}

export const createCourse = async ({ title, category, grade, price }: CreateCourseData): Promise<string> => {
  const coursesCol = collection(db, "courses");
  const newCourseData: Omit<Course, 'id'> = {
    title: title || "New Course Title",
    category: category || "New Category",
    grade: grade || "Uncategorized",
    price: price || 0,
    description: "A comprehensive introduction to the fundamental principles of this new course.",
    mentorName: "Prof. S. Verma",
    thumbnail: "https://placehold.co/600x400.png?text=New+Course",
    isActive: false, // Inactive by default
    subjects: [],
    lessons: [],
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    courseCompletionPercent: 0,
    tags: ["New"],
  };
  const docRef = await addDoc(coursesCol, newCourseData);
  return docRef.id;
}

export const updateCourse = async (courseId: string, data: Partial<Course>): Promise<Course> => {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, data);
    const updatedDoc = await getDoc(courseRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Course;
}

export const deleteCourse = async (courseId: string) => {
    const courseRef = doc(db, "courses", courseId);
    await deleteDoc(courseRef);
}


export const getFeaturedCourses = async (): Promise<Course[]> => {
  const coursesCol = collection(db, "courses");
  const q = query(coursesCol, where("isActive", "==", true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];
  
  const courses = snapshot.docs.map(doc => serializeTimestamps({ id: doc.id, ...doc.data() }) as Course);
  return courses.slice(0, 3); // In a real app, you might have a 'isFeatured' flag
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Aman Kumar",
    role: "JEE Aspirant",
    avatar: "https://i.postimg.cc/d1W1VcYF/aman-kumar.png",
    text: "BiharWaleSirji feels like learning from an elder brother. The concepts are explained so clearly, and the AI mentor is a game-changer for late-night doubts!",
  },
  {
    id: "t2",
    name: "Sunita Singh",
    role: "NEET Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "The personal touch is what makes this platform special. Priya Didi's biology course is fantastic. I finally feel confident in my preparation.",
  },
  {
    id: "t3",
    name: "Rajesh Mahto",
    role: "BPSC Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "Finally, a platform that understands students from Bihar. The teaching style is relatable, and the content is top-notch. Highly recommended.",
  },
];

export const getTestimonials = async (): Promise<Testimonial[]> => {
  return testimonials;
};


export const getEnrolledCoursesForUser = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const enrolledCourseIds: string[] = userData.enrolledCourses || [];

      if(enrolledCourseIds.length === 0) return [];

      const enrolledCoursesPromises = enrolledCourseIds.map(async (courseId) => {
        const courseData = await getCourseById(courseId);
        const progressData = userData.progress?.[courseId];
        const progress = progressData?.progress || 0;
        if(courseData) {
          return {
            courseId: courseData.id,
            title: courseData.title,
            category: courseData.category,
            thumbnail: courseData.thumbnail,
            progress: progress,
            // We need to pass the full course data for the session feature
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

export const createStudentProfile = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        const { uid, email, displayName } = user;
        const createdAt = new Date();

        try {
            await setDoc(userDocRef, {
                uid,
                email,
                displayName,
                role: 'student',
                createdAt,
                onboardingComplete: false,
                enrolledCourses: [],
                progress: {},
                focusStats: { totalMinutes: 0, totalSessions: 0 }
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
};

export const createFacultyProfile = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        const { uid, email, displayName } = user;
        const createdAt = new Date();

        try {
            await setDoc(userDocRef, {
                uid,
                email,
                displayName,
                role: 'faculty',
                createdAt,
                onboardingComplete: true, // Key difference: faculty are onboarded by default
                avatar: 'brain',
                theme: 'dark'
            });
        } catch (error) {
            console.error("Error creating faculty user document:", error);
        }
    }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
};

export const savePushToken = async (userId: string, token: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        pushTokens: arrayUnion(token)
    });
};

export const removePushToken = async (userId: string, token: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        pushTokens: arrayRemove(token)
    });
};

export const incrementFocusStats = async (userId: string, minutes: number) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        'focusStats.totalMinutes': increment(minutes),
        'focusStats.totalSessions': increment(1)
    });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const usersCol = collection(db, "users");
    const q = query(usersCol, orderBy("displayName"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return serializeTimestamps(data) as UserProfile;
    });
};

export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return false;
  }
  const enrolledCourses = userDoc.data()?.enrolledCourses || [];
  return enrolledCourses.includes(courseId);
}

export const enrollInCourse = async (userId: string, courseId: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("User profile not found.");
    }
    
    // Atomically add the course ID to the user's enrolledCourses array
    await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
    });

    // Initialize progress for the new course
    const progressField = `progress.${courseId}`;
    await updateDoc(userRef, {
        [progressField]: {
            progress: 0,
            completedLessons: []
        }
    });
}


export async function getEnrolledCourseData(userId: string, courseId: string): Promise<{progress: number, completedLessons: string[]} | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
        return null;
    }
    return userDoc.data()?.progress?.[courseId] || { progress: 0, completedLessons: [] };
}

export const listenForLiveChatMessages = (
    courseId: string, subjectId: string, chapterId: string, lessonId: string,
    callback: (messages: LiveChatMessage[]) => void
): (() => void) => {
    const chatColRef = collection(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`);
    const q = query(chatColRef, orderBy("timestamp", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as LiveChatMessage));
        callback(messages);
    });

    return unsubscribe;
};

// --- Mission Completion ---
const getMissionCompletionDocRef = (userId: string, date: string) => {
    return doc(db, `users/${userId}/missionCompletion`, date);
};

export const toggleMissionComplete = async (userId: string, missionKey: string, isComplete: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const docRef = getMissionCompletionDocRef(userId, today);
    try {
        if (isComplete) {
            await updateDoc(docRef, {
                completedMissions: arrayUnion(missionKey)
            });
        } else {
            await updateDoc(docRef, {
                completedMissions: arrayRemove(missionKey)
            });
        }
    } catch (error: any) {
        if (error.code === 'not-found' && isComplete) {
            // Document doesn't exist, so create it
            await setDoc(docRef, { completedMissions: [missionKey] });
        } else {
            console.error("Error toggling mission completion:", error);
        }
    }
};

export const getCompletedMissionsForUser = async (userId: string): Promise<Set<string>> => {
    const today = new Date().toISOString().split('T')[0];
    const docRef = getMissionCompletionDocRef(userId, today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return new Set(data.completedMissions || []);
    }
    return new Set();
};
