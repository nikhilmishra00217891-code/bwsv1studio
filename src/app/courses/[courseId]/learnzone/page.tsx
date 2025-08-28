
import { getCourseById, isUserEnrolled, getEnrolledCourseData } from "@/lib/data";
import { getSession, isFaculty } from "@/lib/firebase/server";
import { notFound, redirect } from "next/navigation";
import CourseLearnClient from "./CourseLearnClient";

export default async function CourseLearnPage({ params }: { params: { courseId: string } }) {
    const { user } = await getSession();
    
    // If the user session isn't immediately available on the server,
    // we'll let the client-side AuthProvider handle loading and redirects.
    // This prevents the redirect loop.
    if (!user) {
        const course = await getCourseById(params.courseId);
        if (!course) {
            notFound();
        }
        // Render the client component in a loading state. 
        // It will handle the redirect to login if the user is truly not authenticated.
        return (
             <CourseLearnClient 
                course={course}
                userProgress={0}
            />
        )
    }

    const course = await getCourseById(params.courseId);
    if (!course) {
        notFound();
    }

    const isEnrolled = await isUserEnrolled(user.uid, params.courseId);
    const userIsFaculty = await isFaculty(user.uid);

    if (!isEnrolled && !userIsFaculty) {
        // This is a true authorization failure, so we can deny access.
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
