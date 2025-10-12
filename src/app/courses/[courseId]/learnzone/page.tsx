

import { getCourseById, isUserEnrolled, getEnrolledCourseData } from "@/lib/data";
import { getSession, isFaculty } from "@/lib/firebase/server";
import { notFound, redirect } from "next/navigation";
import CourseLearnClient from "./CourseLearnClient";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import type { Course } from "@/types";
import { Timestamp } from "firebase/firestore";

const CourseLearnPageContent = async ({ params }: { params: { courseId: string } }) => {
    const sessionCookie = cookies().get("session")?.value;
    const { user } = sessionCookie ? await getSession() : { user: null };
    
    const courseData = await getCourseById(params.courseId);
    if (!courseData) {
        notFound();
    }

    // This is already serialized by getCourseById, but as a safeguard we can ensure it again.
    const course: Course = JSON.parse(JSON.stringify(courseData));

    if (!user) {
        return (
             <CourseLearnClient 
                course={course}
                userProgress={0}
            />
        )
    }

    const isEnrolled = await isUserEnrolled(user.uid, params.courseId);
    const userIsFaculty = await isFaculty(user.uid);

    if (!isEnrolled && !userIsFaculty) {
        notFound();
    }

    const enrolledData = await getEnrolledCourseData(user.uid, params.courseId);

    return (
        <CourseLearnClient 
            course={course}
            userProgress={enrolledData?.progress || 0}
        />
    );
};

export default function CourseLearnPage({ params }: { params: { courseId: string } }) {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <CourseLearnPageContent params={params} />
        </Suspense>
    );
}

