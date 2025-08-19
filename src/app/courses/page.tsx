import { getCourses } from "@/lib/data";
import { CourseList } from "@/components/courses/CourseList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Courses - BiharWaleSirji",
    description: "Browse all our available courses and start your learning journey.",
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 md:py-24 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Explore Our Courses</h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Find the right course to help you achieve your academic goals. We are with you at every step.
          </p>
        </div>
        <CourseList courses={courses} />
      </div>
    </div>
  );
}
