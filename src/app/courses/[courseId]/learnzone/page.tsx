
import { getCourseById, isUserEnrolled, getEnrolledCourseData } from "@/lib/data";
import { getSession, isFaculty } from "@/lib/firebase/server";
import { notFound, redirect } from "next/navigation";
import CourseLearnClient from "./CourseLearnClient";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

const CourseLearnPageContent = async ({ params }: { params: { courseId: string } }) => {
    const sessionCookie = cookies().get("session")?.value;
    const { user } = sessionCookie ? await getSession() : { user: null };
    
    if (!user) {
        const course = await getCourseById(params.courseId);
        if (!course) {
            notFound();
        }
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
