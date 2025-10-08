
import { getCourseById } from "@/lib/data";
import { getCouponsForCourse } from "@/lib/data/coupons";
import { notFound } from "next/navigation";
import CouponManagementClient from "./CouponManagementClient";

// This is the server component that fetches the initial course data
export default async function ManageCourseCouponsPage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        notFound();
    }

    // We fetch initial coupons here, but the client will listen for real-time updates.
    // This is good for initial render performance.
    const initialCoupons = await getCouponsForCourse(params.courseId);

    return <CouponManagementClient initialCourse={course} initialCoupons={initialCoupons} />;
}
