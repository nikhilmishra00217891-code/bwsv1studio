
"use server";

import { db } from "@/lib/firebase";
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
} from "firebase/firestore";
import type { Course, Subject, Chapter, Lesson, LiveChatMessage } from "@/types";

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

export const addLesson = async (courseId: string, subjectId: string, chapterId: string, lessonTitle: string, lessonUrl: string): Promise<Course> => {
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
        status: 'live',
    };

    courseData.subjects[subjectIndex].chapters[chapterIndex].lessons.push(newLesson);
    
    await updateDoc(courseRef, { subjects: courseData.subjects });
    return courseData;
};

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

// --- Live Chat Functions ---

export const sendLiveChatMessage = async (
    courseId: string, subjectId: string, chapterId: string, lessonId: string,
    message: Omit<LiveChatMessage, 'id' | 'timestamp'>
) => {
    const chatColRef = collection(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`);
    await addDoc(chatColRef, {
        ...message,
        timestamp: serverTimestamp()
    });
};

export const deleteLiveChatHistory = async (courseId: string, subjectId: string, chapterId: string, lessonId: string) => {
    const chatColRef = collection(db, `courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}/lessons/${lessonId}/liveChat`);
    const snapshot = await getDocs(chatColRef);
    
    if (snapshot.empty) {
        return;
    }
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
}
