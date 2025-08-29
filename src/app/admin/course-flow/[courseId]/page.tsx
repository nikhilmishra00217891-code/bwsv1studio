
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import CourseFlowEditorClient from "./CourseFlowEditorClient";

// This is the server component that fetches the initial course data
export default async function EditCourseFlowPage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        notFound();
    }

    return <CourseFlowEditorClient initialCourse={course} />;
}
