
import { getFeaturedCourses } from "@/lib/data";
import { getTextContent } from "@/lib/data/content";
import type { Course } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { EditableText } from "../common/EditableText";
import { EditableImage } from "../common/EditableImage";

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <EditableImage
          contentId={`course_thumb_${course.id}`}
          src={course.thumbnail}
          alt={course.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={`${course.category} learning`}
        />
        {course.isFree && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
            Free
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col">
        <Badge variant="secondary" className="w-fit mb-2">{course.category}</Badge>
        <CardTitle className="text-xl font-headline mb-2 flex-grow">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground mb-4">
          By {course.mentorName}
        </p>
        <Button asChild variant="outline" className="mt-auto w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Link href={`/courses/${course.id}`}>
                View Course
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default async function FeaturedCourses() {
  const courses = await getFeaturedCourses();
  const textContent = await getTextContent();

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            <EditableText
              contentId="featuredCoursesTitle"
              defaultValue={textContent.featuredCoursesTitle || "Featured Courses"}
            />
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            <EditableText
              contentId="featuredCoursesSubtitle"
              defaultValue={textContent.featuredCoursesSubtitle || "Start your journey with our most popular courses."}
            />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="text-center mt-16">
            <Button asChild size="lg">
                <Link href="/courses">
                    Browse All Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
