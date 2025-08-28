
"use client";

import { useState } from 'react';
import type { Course, Subject, Chapter, Lesson } from "@/types";
import { CourseSidebar } from '@/components/courses/CourseSidebar';
import { CourseContent } from '@/components/courses/CourseContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronsRightLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function CourseLearnClient({ course, userProgress }: { course: Course; userProgress: number; }) {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    }

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setSelectedLesson(null); // Reset lesson when a new subject is chosen
        if (!isSidebarOpen) {
            setIsSidebarOpen(true);
        }
    }

    return (
        <div className="flex h-screen bg-card/50">
            <CourseSidebar 
                course={course}
                selectedSubject={selectedSubject}
                onLessonClick={handleLessonClick}
                selectedLessonId={selectedLesson?.id}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: isSidebarOpen ? '320px' : '0' }}>
                <header className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-b p-3 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-muted-foreground"
                        >
                            <ChevronsRightLeft className="w-5 h-5"/>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                                <ArrowLeft className="w-4 h-4 mr-2"/> Back to Course Details
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Course Progress</p>
                            <div className="flex items-center gap-2">
                                <Progress value={course.courseCompletionPercent || 0} className="w-32 h-2" />
                                <span className="text-xs font-bold w-8">{course.courseCompletionPercent || 0}%</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-muted-foreground">Your Progress</p>
                            <div className="flex items-center gap-2">
                                <Progress value={userProgress} className="w-32 h-2" />
                                <span className="text-xs font-bold w-8">{userProgress}%</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto">
                   <CourseContent
                        course={course}
                        selectedLesson={selectedLesson}
                        onSubjectSelect={handleSubjectSelect}
                    />
                </div>
            </main>
        </div>
    );
}
