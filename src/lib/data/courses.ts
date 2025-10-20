
"use client"; // This file now contains client-side and server-side logic, mark it for client.

import { db } from "@/lib/firebase/client"; // Use client-side db for client-callable functions
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  getDocs,
  writeBatch,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
  where,
  deleteDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import type { Course, Subject, Chapter, Lesson, LiveChatMessage, StudyMaterial, UserProfile, Poll } from "@/types";

// --- Client-side callable functions ---

export const listenForCourses = (isFaculty: boolean, callback: (courses: Course[]) => void): () => void => {
    const coursesCol = collection(db, "courses");
    
    let q;
    if (isFaculty) {
        q = query(coursesCol, orderBy("title"));
    } else {
        q = query(coursesCol, where("isActive", "==", true), orderBy("title"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            callback([]);
            return;
        }
        const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Course);
        callback(courses);
    }, (error) => {
        console.error("Error listening for courses: ", error);
        callback([]);
    });

    return unsubscribe;
};

export const createCourse = async ({ title, category, grade, price }: { title: string; category: string; grade: string; price: number; }): Promise<string> => {
  const coursesCol = collection(db, "courses");
  const newCourseData: Omit<Course, 'id'> = {
    title: title || "New Course Title",
    category: category || "New Category",
    grade: grade || "Uncategorized",
    price: price || 0,
    description: "A comprehensive introduction to the fundamental principles of this new course.",
    mentorName: "Prof. S. Verma",
    thumbnail: "https://i.postimg.cc/6p7xNnB0/placeholder.png",
    isActive: false,
    subjects: [],
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

export const getCourseById = async (id: string): Promise<Course | null> => {
    const courseDocRef = doc(db, 'courses', id);
    const docSnap = await getDoc(courseDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const course = { id: docSnap.id, ...data } as Course;
        
        // Ensure timestamps are converted, especially for nested properties like scheduledTime
        if (course.subjects) {
            course.subjects.forEach(subject => {
                subject.chapters.forEach(chapter => {
                    chapter.lessons.forEach(lesson => {
                        if (lesson.scheduledTime instanceof Timestamp) {
                            lesson.scheduledTime = lesson.scheduledTime.toDate().toISOString();
                        }
                    });
                });
            });
        }
        return course;
    } else {
        return null;
    }
}


export const getFeaturedCourses = async (): Promise<Course[]> => {
  const coursesCol = collection(db, "courses");
  const q = query(coursesCol, where("isActive", "==", true), limit(3)); // Fetch 3 active courses
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];
  
  const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Course);
  return courses;
};

export const enrollInCourse = async (userId: string, courseId: string, couponCode?: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("User profile not found.");
    }
    
    await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
    });

    const progressField = `progress.${courseId}`;
    await updateDoc(userRef, {
        [progressField]: {
            progress: 0,
            completedLessons: []
        }
    });

    if (couponCode) {
        const couponsColRef = collection(db, `courses/${courseId}/coupons`);
        const q = query(couponsColRef, where('code', '==', couponCode.toUpperCase()), limit(1));
        const couponSnapshot = await getDocs(q);
        if (!couponSnapshot.empty) {
            const couponDoc = couponSnapshot.docs[0];
            await updateDoc(couponDoc.ref, {
                timesUsed: increment(1)
            });
        }
    }
}

export const toggleLessonCompletion = async (userId: string, courseId: string, lessonId: string) => {
    const userRef = doc(db, 'users', userId);
    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw "User does not exist!";
    }
    
    const userData = userDoc.data() as UserProfile;
    const progressData = userData.progress?.[courseId] || { completedLessons: [] };
    const completedLessons = new Set(progressData.completedLessons);
    
    if (completedLessons.has(lessonId)) {
        completedLessons.delete(lessonId);
    } else {
        completedLessons.add(lessonId);
    }
    
    const updatedCompletedLessons = Array.from(completedLessons);
    
    const progressField = `progress.${courseId}.completedLessons`;
    await updateDoc(userRef, {
        [progressField]: updatedCompletedLessons
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


// --- Functions below might be server-callable, ensure they use adminDB if so ---
// For now, they are marked with 'use client' so they use the client 'db'

export const addSubject = async (courseId: string, subjectTitle: string): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const newSubject: Subject = {
        id: subjectTitle.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        title: subjectTitle,
        chapters: [],
        progress: 0,
    };
    await updateDoc(courseRef, {
        subjects: arrayUnion(newSubject)
    });
    const updatedDoc = await getDoc(courseRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Course;
};

export const deleteSubject = async (courseId: string, subjectId: string): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");

    const courseData = courseSnap.data() as Course;
    const subjectToRemove = courseData.subjects.find(s => s.id === subjectId);
    if (!subjectToRemove) return courseData;

    await updateDoc(courseRef, { subjects: arrayRemove(subjectToRemove) });
    const updatedDoc = await getDoc(courseRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Course;
};

export const addChapter = async (courseId: string, subjectId: string, chapterTitle: string): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");
    
    const courseData = courseSnap.data() as Course;
    const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) throw new Error("Subject not found");

    const newChapter: Chapter = {
        id: chapterTitle.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        title: chapterTitle,
        lessons: [],
        studyMaterials: [],
    };

    courseData.subjects[subjectIndex].chapters.push(newChapter);

    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
};

export const deleteChapter = async (courseId: string, subjectId: string, chapterId: string): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");
    
    const courseData = courseSnap.data() as Course;
    const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) throw new Error("Subject not found");
    
    const updatedChapters = courseData.subjects[subjectIndex].chapters.filter(c => c.id !== chapterId);
    courseData.subjects[subjectIndex].chapters = updatedChapters;

    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
};

export const addLesson = async (courseId: string, subjectId: string, chapterId: string, lessonTitle: string, lessonUrl: string, scheduleTimeString: string | null): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");
    
    const courseData = courseSnap.data() as Course;
    const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) throw new Error("Subject not found");

    const chapterIndex = courseData.subjects[subjectIndex].chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) throw new Error("Chapter not found");

    const newLesson: Lesson = {
        id: lessonTitle.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        title: lessonTitle,
        type: 'video', 
        content: lessonUrl,
        duration: '0 min',
        status: scheduleTimeString ? 'scheduled' : 'live',
        scheduledTime: scheduleTimeString ? Timestamp.fromDate(new Date(scheduleTimeString)) : null,
    };

    courseData.subjects[subjectIndex].chapters[chapterIndex].lessons.push(newLesson);
    
    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
};

export const updateLesson = async (courseId: string, subjectId: string, chapterId: string, updatedLesson: Lesson): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");
    
    const courseData = courseSnap.data() as Course;
    const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) throw new Error("Subject not found");

    const chapterIndex = courseData.subjects[subjectIndex].chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) throw new Error("Chapter not found");
    
    const lessonIndex = courseData.subjects[subjectIndex].chapters[chapterIndex].lessons.findIndex(l => l.id === updatedLesson.id);
    if (lessonIndex === -1) throw new Error("Lesson not found");

    courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex] = updatedLesson;

    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
}

export const deleteLesson = async (courseId: string, subjectId: string, chapterId: string, lessonId: string): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");
    
    const courseData = courseSnap.data() as Course;
    const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) throw new Error("Subject not found");

    const chapterIndex = courseData.subjects[subjectIndex].chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) throw new Error("Chapter not found");
    
    const updatedLessons = courseData.subjects[subjectIndex].chapters[chapterIndex].lessons.filter(l => l.id !== lessonId);
    courseData.subjects[subjectIndex].chapters[chapterIndex].lessons = updatedLessons;

    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
};

export const sendLiveChatMessage = async (
    courseId: string, subjectId: string, chapterId: string, lessonId: string,
    message: Partial<LiveChatMessage>
) => {
    const chatColRef = collection(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`);
    const finalMessage = {
        ...message,
        timestamp: serverTimestamp()
    };

    if (message.messageType === 'poll') {
        finalMessage.isPinned = true;
        finalMessage.pinnedAt = serverTimestamp();
    }

    await addDoc(chatColRef, finalMessage);
};

const findAndModifyMaterial = (
  materials: StudyMaterial[],
  parentId: string | null,
  callback: (items: StudyMaterial[], container?: StudyMaterial) => void
) => {
  if (parentId === null) {
    callback(materials);
    return;
  }
  for (const item of materials) {
    if (item.id === parentId && item.type === 'topic') {
      callback(item.subtopics, item);
      return;
    }
    if (item.type === 'topic') {
      findAndModifyMaterial(item.subtopics, parentId, callback);
    }
  }
};

const findAndDeleteMaterial = (materials: StudyMaterial[], idToDelete: string): boolean => {
    for (let i = 0; i < materials.length; i++) {
        if (materials[i].id === idToDelete) {
            materials.splice(i, 1);
            return true;
        }
        if (materials[i].type === 'topic') {
            if (findAndDeleteMaterial((materials[i] as any).subtopics, idToDelete)) {
                return true;
            }
        }
    }
    return false;
};

const findAndUpdateMaterial = (materials: StudyMaterial[], updatedMaterial: Partial<StudyMaterial> & { id: string }): boolean => {
    for (let i = 0; i < materials.length; i++) {
        if (materials[i].id === updatedMaterial.id) {
            materials[i] = { ...materials[i], ...updatedMaterial };
            return true;
        }
        if (materials[i].type === 'topic') {
            if (findAndUpdateMaterial((materials[i] as any).subtopics, updatedMaterial)) {
                return true;
            }
        }
    }
    return false;
}

export const addStudyMaterial = async (
    courseId: string,
    subjectId: string,
    chapterId: string,
    parentId: string | null,
    item: Omit<StudyMaterial, 'id'>
): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");

    const courseData = courseSnap.data() as Course;
    const subject = courseData.subjects.find(s => s.id === subjectId);
    if (!subject) throw new Error("Subject not found");

    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) throw new Error("Chapter not found");

    if (!chapter.studyMaterials) chapter.studyMaterials = [];

    const newItem: StudyMaterial = {
      id: `${item.type}_${Date.now()}`,
      ...item,
    } as StudyMaterial;

    findAndModifyMaterial(chapter.studyMaterials, parentId, (items) => {
        items.push(newItem);
    });

    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
}

export const deleteStudyMaterial = async (
    courseId: string,
    subjectId: string,
    chapterId: string,
    materialId: string
): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");

    const courseData = courseSnap.data() as Course;
    const subject = courseData.subjects.find(s => s.id === subjectId);
    if (!subject) throw new Error("Subject not found");

    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.studyMaterials) throw new Error("Chapter not found");
    
    findAndDeleteMaterial(chapter.studyMaterials, materialId);

    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
};

export const updateStudyMaterial = async (
    courseId: string,
    subjectId: string,
    chapterId: string,
    updatedMaterial: Partial<StudyMaterial> & { id: string }
): Promise<Course> => {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) throw new Error("Course not found");

    const courseData = courseSnap.data() as Course;
    const subject = courseData.subjects.find(s => s.id === subjectId);
    if (!subject) throw new Error("Subject not found");
    
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.studyMaterials) throw new Error("Chapter not found");

    findAndUpdateMaterial(chapter.studyMaterials, updatedMaterial);
    
    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
}

export const updateLessonStatus = async (
    courseId: string,
    subjectId: string,
    chapterId: string,
    lessonId: string,
    status: 'live' | 'scheduled' | 'recorded',
    newScheduleTime?: string | null
): Promise<{ success: boolean; message: string }> => {
     const courseRef = doc(db, 'courses', courseId);
    try {
        const courseSnap = await getDoc(courseRef);
        if (!courseSnap.exists()) throw new Error("Course not found.");

        const courseData = courseSnap.data() as Course;
        const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex === -1) throw new Error("Subject not found.");
        
        const chapterIndex = courseData.subjects[subjectIndex].chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) throw new Error("Chapter not found.");

        const lessonIndex = courseData.subjects[subjectIndex].chapters[chapterIndex].lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex === -1) throw new Error("Lesson not found.");
        
        courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex].status = status;
        
        if (status === 'scheduled' && newScheduleTime) {
             courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex].scheduledTime = Timestamp.fromDate(new Date(newScheduleTime));
        } else {
            courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex].scheduledTime = null;
        }
        
        await updateDoc(courseRef, { subjects: courseData.subjects });
        return { success: true, message: "Lesson status updated successfully." };

    } catch (error: any) {
        return { success: false, message: error.message || "An unknown error occurred." };
    }
}

export const endLiveSession = async (
    courseId: string,
    subjectId: string,
    chapterId: string,
    lessonId: string
): Promise<{success: boolean, message: string}> => {
    const courseRef = doc(db, 'courses', courseId);
    
    try {
        const courseSnap = await getDoc(courseRef);
        if (!courseSnap.exists()) {
            throw new Error("Course not found.");
        }

        const courseData = courseSnap.data() as Course;
        const subjectIndex = courseData.subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex === -1) throw new Error("Subject not found.");
        
        const chapterIndex = courseData.subjects[subjectIndex].chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) throw new Error("Chapter not found.");

        const lessonIndex = courseData.subjects[subjectIndex].chapters[chapterIndex].lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex === -1) throw new Error("Lesson not found.");
        
        courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex].status = 'recorded';
        courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex].scheduledTime = null; 
        
        await updateDoc(courseRef, { subjects: courseData.subjects });

        return { success: true, message: "Session ended successfully." };
    } catch (error: any) {
        return { success: false, message: error.message || "An unknown error occurred." };
    }
};

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

export const voteOnPoll = async (courseId: string, subjectId: string, chapterId: string, lessonId: string, messageId: string, optionIndex: number, userId: string) => {
    const messageRef = doc(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`, messageId);

    await runTransaction(db, async (transaction) => {
        const messageDoc = await transaction.get(messageRef);
        if (!messageDoc.exists() || messageDoc.data().messageType !== 'poll') {
            throw new Error("Poll not found.");
        }

        const pollData = messageDoc.data().poll as Poll;

        // Ensure voterIds array exists for all options
        pollData.options.forEach(opt => {
            if (!opt.voterIds) {
                opt.voterIds = [];
            }
        });
        
        const hasVoted = pollData.options.some(opt => opt.voterIds.includes(userId));
        if (hasVoted) {
            // Allow changing vote
            pollData.options.forEach(opt => {
                const userIndex = opt.voterIds.indexOf(userId);
                if (userIndex > -1) {
                    opt.voterIds.splice(userIndex, 1);
                }
            });
        }


        if (optionIndex < 0 || optionIndex >= pollData.options.length) {
            throw new Error("Invalid option selected.");
        }

        pollData.options[optionIndex].voterIds.push(userId);

        transaction.update(messageRef, { poll: pollData });
    });
}

export const closePoll = async (courseId: string, subjectId: string, chapterId: string, lessonId: string, messageId: string) => {
    const messageRef = doc(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`, messageId);
    
     await runTransaction(db, async (transaction) => {
        const messageDoc = await transaction.get(messageRef);
        if (!messageDoc.exists()) return;

        const pollData = messageDoc.data()?.poll as Poll | undefined;
        if (pollData && pollData.status !== 'closed') {
            transaction.update(messageRef, { 'poll.status': 'closed' });
        }
    });
};

export const setCorrectPollAnswer = async (courseId: string, subjectId: string, chapterId: string, lessonId: string, messageId: string, correctOptionIndex: number) => {
    const messageRef = doc(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`, messageId);
    await updateDoc(messageRef, {
        'poll.correctOptionIndex': correctOptionIndex
    });
};


export const toggleLiveChatPin = async (
  courseId: string, subjectId: string, chapterId: string, lessonId: string,
  messageId: string
) => {
    const messageRef = doc(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`, messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
        throw new Error("Message not found.");
    }
    
    const isCurrentlyPinned = messageSnap.data().isPinned || false;
    
    await updateDoc(messageRef, {
        isPinned: !isCurrentlyPinned,
        pinnedAt: !isCurrentlyPinned ? serverTimestamp() : null
    });
};
