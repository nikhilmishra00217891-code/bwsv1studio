
"use client";

import { useState } from 'react';
import type { Course, Subject, Chapter, Lesson } from "@/types";
import { CourseSidebar } from '@/components/courses/CourseSidebar';
import { CourseContent } from '@/components/courses/CourseContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronsRightLeft, Library, Menu } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function CourseLearnClient({ course, userProgress }: { course: Course; userProgress: number; }) {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    }

    const handleChapterSelect = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setSelectedLesson(null);
    }

    const handleSubjectSelect = (subject: Subject | null) => {
        setSelectedSubject(subject);
        setSelectedChapter(null);
        setSelectedLesson(null);
    }
    
    const handleBackToChapters = () => {
        setSelectedLesson(null);
    }

    const handleBackToSubjects = () => {
        setSelectedChapter(null);
        setSelectedLesson(null);
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

            <main className="flex-1 flex flex-col transition-all duration-300 md:ml-0" style={{ marginLeft: isSidebarOpen ? '320px' : '0' }}>
                <header className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-b p-3 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-muted-foreground"
                        >
                            <Menu className="w-5 h-5"/>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                                <ArrowLeft className="w-4 h-4 mr-2"/> Back to Details
                            </Link>
                        </Button>
                         {selectedLesson && (
                            <Button variant="outline" size="sm" onClick={handleBackToChapters}>
                                <ArrowLeft className="w-4 h-4 mr-2"/> Back to Lessons
                            </Button>
                        )}
                        {selectedChapter && (
                             <Button variant="outline" size="sm" onClick={handleBackToSubjects}>
                                <Library className="w-4 h-4 mr-2"/> All Chapters
                            </Button>
                        )}
                    </div>
                    <div className="hidden md:flex items-center gap-4">
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
                        selectedSubject={selectedSubject}
                        selectedLesson={selectedLesson}
                        onSubjectSelect={handleSubjectSelect}
                        onChapterSelect={handleChapterSelect}
                        onLessonClick={handleLessonClick}
                    />
                </div>
            </main>
        </div>
    );
}
