"use client";

import { useSearchParams } from 'next/navigation'
import type { Course, Lesson } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "../ui/button";
import { BookText, CircleUserRound, MessageSquareHeart, PlayCircle, Star, Video } from "lucide-react";

const CourseCardTrigger = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden w-full group transition-all duration-300 hover:bg-secondary/50">
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
                        <Badge variant="secondary" className="w-fit mb-2">{course.category}</Badge>
                        <h3 className="text-xl font-bold font-headline mb-2">{course.title}</h3>
                    </div>
                     {course.isFree && (
                        <Badge className="bg-accent text-accent-foreground ml-4 shrink-0">
                            Free
                        </Badge>
                    )}
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
)

const CourseDetailContent = ({ course }: { course: Course }) => (
    <div className="bg-secondary/30 rounded-b-lg p-6 md:p-8">
        <h4 className="text-2xl font-bold font-headline mb-4">What you'll learn</h4>
        <p className="text-muted-foreground mb-8">{course.description}</p>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h4 className="text-xl font-bold font-headline mb-4">Course Content</h4>
                <ul className="space-y-3">
                    {course.lessons.map((lesson: Lesson) => (
                        <li key={lesson.id} className="flex items-center gap-3 bg-card p-3 rounded-md">
                            {lesson.type === 'video' ? <Video className="w-5 h-5 text-primary" /> : <BookText className="w-5 h-5 text-primary" />}
                            <span className="flex-grow">{lesson.title}</span>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-4">
                 <Button size="lg" className="w-full">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Enroll & Start Learning
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                    <MessageSquareHeart className="mr-2 h-5 w-5" />
                    Ask AI Mentor
                </Button>
            </div>
        </div>
    </div>
)

export function CourseList({ courses }: { courses: Course[] }) {
  const searchParams = useSearchParams();
  const defaultCourseId = searchParams.get('course');
  
  return (
    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={defaultCourseId ?? undefined}>
      {courses.map((course) => (
        <AccordionItem value={course.id} key={course.id} className="border-b-0">
            <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]]:rounded-b-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                <CourseCardTrigger course={course} />
            </AccordionTrigger>
          <AccordionContent className="p-0">
            <CourseDetailContent course={course} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
