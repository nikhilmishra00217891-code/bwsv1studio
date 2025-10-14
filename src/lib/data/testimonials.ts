

'use client';

import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
  limit,
  deleteDoc,
} from "firebase/firestore";
import type { Testimonial } from "@/types";

/**
 * Submits or updates a student's testimonial.
 */
export const submitTestimonial = async (
    data: Partial<Testimonial>,
    existingId?: string
): Promise<void> => {
    if (existingId) {
        // Update existing testimonial
        const testimonialRef = doc(db, 'testimonials', existingId);
        await updateDoc(testimonialRef, {
            ...data,
            createdAt: serverTimestamp(),
        });
    } else {
        // Create new testimonial
        const testimonialColRef = collection(db, 'testimonials');
        await addDoc(testimonialColRef, {
            ...data,
            isFeatured: false,
            createdAt: serverTimestamp(),
        });
    }
};

/**
 * Gets a specific user's testimonial, if it exists.
 */
export const getUserTestimonial = async (userId: string): Promise<Testimonial | null> => {
    const q = query(collection(db, 'testimonials'), where('userId', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as Testimonial;
}


/**
 * Fetches all testimonials marked as 'featured' for the homepage.
 */
export const getFeaturedTestimonials = async (): Promise<Testimonial[]> => {
    const q = query(collection(db, 'testimonials'), where('isFeatured', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
};

/**
 * Listens for real-time updates to all testimonials (for admin).
 */
export const listenForAllTestimonials = (callback: (testimonials: Testimonial[]) => void): (() => void) => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        callback(testimonials);
    }, (error) => {
        console.error("Error listening for testimonials:", error);
    });
    return unsubscribe;
};

/**
 * Toggles the 'isFeatured' status of a testimonial.
 */
export const toggleTestimonialFeature = async (testimonialId: string, isFeatured: boolean): Promise<void> => {
    const testimonialRef = doc(db, 'testimonials', testimonialId);
    await updateDoc(testimonialRef, { isFeatured });
};

/**
 * Deletes a testimonial from the database.
 */
export const deleteTestimonial = async (testimonialId: string): Promise<void> => {
    const testimonialRef = doc(db, 'testimonials', testimonialId);
    await deleteDoc(testimonialRef);
};
