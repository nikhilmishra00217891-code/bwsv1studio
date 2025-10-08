
import { getCourseById } from "@/lib/data";
import { getCouponsForCourse } from "@/lib/data/coupons";
import { notFound } from "next/navigation";
import CouponManagementClient from "./CouponManagementClient";
import type { Coupon } from "@/types";

// This is the server component that fetches the initial course data
export default async function ManageCourseCouponsPage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        notFound();
    }

    // We fetch initial coupons here, and the data function now serializes the timestamps.
    const initialCoupons: Coupon[] = await getCouponsForCourse(params.courseId);

    return <CouponManagementClient initialCourse={course} initialCoupons={initialCoupons} />;
}
