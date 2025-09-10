
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import CoursePageClient from "@/components/courses/CoursePageClient";
import type { Course } from "@/types";
import { Timestamp } from "firebase/firestore";

// This is the server component that fetches the data.
export default async function SingleCoursePage({ params }: { params: { courseId: string } }) {
    const courseData = await getCourseById(params.courseId);

    if (!courseData) {
        notFound();
    }

    // Convert Firestore Timestamps to serializable strings before passing to client component
    const course: Course = JSON.parse(JSON.stringify(courseData, (key, value) => {
        if (value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
            const ts = new Timestamp(value.seconds, value.nanoseconds);
            return ts.toDate().toISOString();
        }
        return value;
    }));


    return (
        <div className="animate-fade-in">
            <CoursePageClient initialCourse={course} />
        </div>
    );
}
