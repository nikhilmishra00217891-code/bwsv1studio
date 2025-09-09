
"use client";

import Link from 'next/link';
import type { Course } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CircleUserRound, EyeOff, Star, IndianRupee } from "lucide-react";
import { cn } from '@/lib/utils';

// Updated to link to the new dynamic course pages
const CourseCard = ({ course, isFaculty }: { course: Course, isFaculty: boolean }) => (
    <Link href={`/courses/${course.id}`} className="block group">
        <Card className={cn(
            "overflow-hidden w-full h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50",
            !course.isActive && "border-dashed border-muted-foreground/50 opacity-70 hover:opacity-100"
        )}>
            <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/4 h-48 md:h-full relative flex-shrink-0">
                     <Image
                        src={course.thumbnail}
                        alt={course.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={`${course.category} textbook`}
                    />
                </div>
                <CardContent className="p-6 flex-grow w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="w-fit">{course.category}</Badge>
                                <Badge variant="outline" className="w-fit">{course.grade}</Badge>
                                {!course.isActive && isFaculty && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <EyeOff className="w-3 h-3"/> Inactive
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-xl font-bold font-headline mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                        </div>
                         <div className="ml-4 shrink-0">
                            {course.price > 0 ? (
                                <Badge className="text-base">
                                    <IndianRupee className="w-4 h-4 mr-1"/>
                                    {course.price}
                                </Badge>
                            ) : (
                                <Badge className="text-base bg-accent text-accent-foreground">
                                    Free
                                </Badge>
                            )}
                         </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <CircleUserRound className="w-4 h-4" />
                        <span>By {course.mentorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                        <Star className="w-4 h-4 fill-current"/>
                        <Star className="w-4 h-4 fill-current"/>
                        <Star className="w-4 h-4 fill-current"/>
                        <Star className="w-4 h-4 fill-current"/>
                        <Star className="w-4 h-4 "/>
                        <span className="text-muted-foreground ml-1">(1,234 reviews)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{course.description}</p>
                </CardContent>
            </div>
        </Card>
    </Link>
)

export function CourseList({ courses, isFaculty }: { courses: Course[], isFaculty?: boolean }) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {isFaculty ? "You haven't created any courses yet. Click the button above to get started!" : "No courses are available right now. Please check back later!"}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} isFaculty={!!isFaculty} />
      ))}
    </div>
  );
}
