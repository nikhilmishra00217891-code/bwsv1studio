
"use server";

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import type { Course, Subject, Chapter } from "@/types";

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
