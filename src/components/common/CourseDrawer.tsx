
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getEnrolledCoursesForUser } from "@/lib/data";
import type { EnrolledCourse } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { BookOpen, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "../ui/progress";

export default function CourseDrawer() {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getEnrolledCoursesForUser(user.uid)
                .then(courses => {
                    setEnrolledCourses(courses);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="h-16 w-16 rounded-full shadow-lg"
                    size="icon"
                    aria-label="My Courses"
                    variant="outline"
                >
                    <BookOpen className="h-8 w-8 text-primary" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="text-2xl font-headline text-center">My Courses</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-grow">
                    <div className="p-6 space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : enrolledCourses.length > 0 ? (
                            enrolledCourses.map(course => (
                                <Link key={course.courseId} href={`/courses/${course.courseId}/learnzone`} className="block group">
                                    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-24 h-24 shrink-0">
                                                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                                            </div>
                                            <div className="py-2 pr-4 flex-grow">
                                                <h3 className="font-bold leading-tight group-hover:text-primary">{course.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{course.category}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Progress value={course.progress} className="h-2"/>
                                                    <span className="text-xs font-semibold">{course.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground pt-12">
                                <p className="font-semibold">No courses yet!</p>
                                <p className="text-sm mt-1">Enroll in a course to see it here.</p>
                                <Button asChild variant="link" className="mt-2">
                                    <Link href="/courses">Explore Courses</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
