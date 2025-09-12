
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

    // Data from getCourseById is already serialized.
    // The JSON.stringify/parse is a robust way to ensure deep serialization.
    const course: Course = JSON.parse(JSON.stringify(courseData));

    return (
        <div className="animate-fade-in">
            <CoursePageClient initialCourse={course} />
        </div>
    );
}
