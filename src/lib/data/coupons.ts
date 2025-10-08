
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import type { Coupon } from "@/types";

/**
 * Creates a new discount coupon for a specific course.
 */
export const createCoupon = async (
  courseId: string,
  code: string,
  discountPercentage: number
): Promise<Coupon> => {
  const couponCode = code.toUpperCase();
  const couponsColRef = collection(db, `courses/${courseId}/coupons`);

  // Check if a coupon with the same code already exists for this course
  const q = query(couponsColRef, where("code", "==", couponCode));
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error(`A coupon with the code "${couponCode}" already exists for this course.`);
  }

  if (discountPercentage <= 0 || discountPercentage > 100) {
      throw new Error("Discount percentage must be between 1 and 100.");
  }

  const newCouponData = {
    code: couponCode,
    courseId,
    discountPercentage,
    isActive: true,
    createdAt: serverTimestamp(),
    timesUsed: 0,
  };

  const docRef = await addDoc(couponsColRef, newCouponData);

  return {
    id: docRef.id,
    ...newCouponData,
  } as Coupon;
};

/**
 * Retrieves all coupons for a given course. This is safe for server-side fetching.
 */
export const getCouponsForCourse = async (courseId: string): Promise<Coupon[]> => {
  const couponsColRef = collection(db, `courses/${courseId}/coupons`);
  const q = query(couponsColRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Coupon);
};

/**
 * Listens for real-time updates to coupons for a course.
 */
export const listenForCoupons = (
  courseId: string,
  callback: (coupons: Coupon[]) => void
): (() => void) => {
  const couponsColRef = collection(db, `courses/${courseId}/coupons`);
  const q = query(couponsColRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    callback(coupons);
  }, (error) => {
    console.error(`Error listening for coupons in course ${courseId}:`, error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Updates a coupon's data, e.g., toggling its active status.
 */
export const updateCoupon = async (
  courseId: string,
  couponId: string,
  data: Partial<Omit<Coupon, "id" | "courseId">>
): Promise<void> => {
  const couponDocRef = doc(db, `courses/${courseId}/coupons`, couponId);
  await updateDoc(couponDocRef, data);
};

/**
 * Deletes a coupon.
 */
export const deleteCoupon = async (courseId: string, couponId: string): Promise<void> => {
  const couponDocRef = doc(db, `courses/${courseId}/coupons`, couponId);
  await deleteDoc(couponDocRef);
};
