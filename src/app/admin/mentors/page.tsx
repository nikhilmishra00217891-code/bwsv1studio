
import { getCourses } from "@/lib/data";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus } from "lucide-react";
import Image from "next/image";

// This is the server component that fetches the list of courses
export default async function MentorCourseListPage() {
    const courses = await getCourses(true); // Fetch all courses, including inactive ones

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Mentor Management</h1>
                <p className="text-muted-foreground">Select a course to add or manage its mentors.</p>
            </div>
            
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                                     <Image src={course.thumbnail} alt={course.title} fill className="object-cover"/>
                                </div>
                                <CardTitle>{course.title}</CardTitle>
                                <CardDescription>{course.mentors?.length || 0} mentors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={`/admin/mentors/${course.id}`}>
                                        <UserPlus className="mr-2 w-4 h-4"/>
                                        Manage Mentors
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>No courses have been created yet.</p>
                        <Button asChild variant="link">
                            <Link href="/courses">Go to Courses to create one</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    