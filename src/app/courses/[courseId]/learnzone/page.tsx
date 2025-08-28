
import { getCourseById, isUserEnrolled, getEnrolledCourseData } from "@/lib/data";
import { getSession, isFaculty } from "@/lib/firebase/server";
import { notFound, redirect } from "next/navigation";
import CourseLearnClient from "./CourseLearnClient";

export default async function CourseLearnPage({ params }: { params: { courseId: string } }) {
    const { user } = await getSession();
    
    if (!user) {
        redirect(`/login?redirect=/courses/${params.courseId}/learnzone`);
    }

    const course = await getCourseById(params.courseId);
    if (!course) {
        notFound();
    }

    const isEnrolled = await isUserEnrolled(user.uid, params.courseId);
    const userIsFaculty = await isFaculty(user.uid);

    if (!isEnrolled && !userIsFaculty) {
        // You could redirect to the main course page with a message
        // For now, we'll just show not found to prevent access.
        notFound();
    }

    const enrolledData = await getEnrolledCourseData(user.uid, params.courseId);

    return (
        <CourseLearnClient 
            course={course}
            userProgress={enrolledData?.progress || 0}
        />
    );
}
