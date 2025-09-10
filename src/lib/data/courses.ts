
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
  Timestamp,
} from "firebase/firestore";
import type { Course, Subject, Chapter, Lesson, LiveChatMessage, StudyMaterial, StudyMaterialLink } from "@/types";
import { getUrlMetadata } from "@/app/actions";

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


// --- Study Material Functions ---

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
        console.error("Error updating lesson status: ", error);
        return { success: false, message: error.message || "An unknown error occurred." };
    }
}

// Moves a lesson from 'scheduled' or 'live' to 'recorded'
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
        courseData.subjects[subjectIndex].chapters[chapterIndex].lessons[lessonIndex].scheduledTime = null; // Clear scheduled time
        
        await updateDoc(courseRef, { subjects: courseData.subjects });

        return { success: true, message: "Session ended successfully." };
    } catch (error: any) {
        console.error("Error ending session: ", error);
        return { success: false, message: error.message || "An unknown error occurred." };
    }
};
