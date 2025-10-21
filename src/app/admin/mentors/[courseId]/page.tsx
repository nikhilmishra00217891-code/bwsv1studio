
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import MentorManagementClient from "./MentorManagementClient";

// This is the server component that fetches the initial course data
export default async function ManageCourseMentorsPage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        notFound();
    }

    return <MentorManagementClient initialCourse={course} />;
}

    