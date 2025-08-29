
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import CoursePageClient from "@/components/courses/CoursePageClient";

// This is the server component that fetches the data.
export default async function SingleCoursePage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        notFound();
    }

    return (
        <div className="animate-fade-in">
            <CoursePageClient initialCourse={course} />
        </div>
    );
}
