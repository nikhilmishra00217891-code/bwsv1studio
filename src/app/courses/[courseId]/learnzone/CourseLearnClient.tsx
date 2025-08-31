

"use client";

import { useState } from 'react';
import type { Course, Subject, Chapter, Lesson } from "@/types";
import { CourseSidebar } from '@/components/courses/CourseSidebar';
import { CourseContent } from '@/components/courses/CourseContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Library, Menu, Palette } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CourseAnnouncementsPage from '../announcements/page';

export default function CourseLearnClient({ course, userProgress }: { course: Course; userProgress: number; }) {
    const pathname = usePathname();
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isAnnouncementsPage = pathname.endsWith('/announcements');
    const isEventsPage = pathname.endsWith('/events');
    const isResourcesPage = pathname.endsWith('/resources');

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    }

    const handleChapterSelect = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setSelectedLesson(null);
    }

    const handleSubjectSelect = (subject: Subject) => {
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

    const renderContent = () => {
        if (isAnnouncementsPage) {
            return <CourseAnnouncementsPage />;
        }
        // Add similar checks for events and resources when they are built
        
        return (
            <CourseContent
                course={course}
                selectedSubject={selectedSubject}
                selectedChapter={selectedChapter}
                selectedLesson={selectedLesson}
                onSubjectSelect={handleSubjectSelect}
                onChapterSelect={handleChapterSelect}
                onLessonClick={handleLessonClick}
            />
        );
    };
    
    const renderHeaderTitle = () => {
        if (isAnnouncementsPage) return "Course Announcements";
        if (isEventsPage) return "Events";
        if (isResourcesPage) return "Course Resources";
        return "Course Content";
    }

    return (
        <div className="flex h-screen bg-card/50">
            <CourseSidebar 
                course={course}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col transition-all duration-300 md:ml-0">
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
                    </div>
                    <h2 className="text-lg font-bold font-headline hidden md:block">{renderHeaderTitle()}</h2>
                    <div className="hidden md:flex items-center gap-4">
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
                   {renderContent()}
                </div>
            </main>
        </div>
    );
}
