
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BookText, ChevronRight, Video, CheckCircle2 } from 'lucide-react';
import type { Course, Subject, Chapter, Lesson } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const LessonItem = ({ lesson, isSelected, onClick, isCompleted }: { lesson: Lesson, isSelected: boolean, onClick: () => void, isCompleted: boolean }) => {
    const Icon = lesson.type === 'video' ? Video : BookText;
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors text-sm",
                isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
            )}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-grow truncate">{lesson.title}</span>
            {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/>}
        </button>
    )
}

const ChapterItem = ({ chapter, onLessonClick, selectedLessonId }: { chapter: Chapter, onLessonClick: (lesson: Lesson) => void, selectedLessonId?: string | null }) => {
    return (
        <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full text-left flex items-center justify-between p-2 rounded-md hover:bg-muted text-foreground/90 group">
                <span className="font-semibold text-sm">{chapter.title}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 border-l ml-4 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="py-1 space-y-1">
                    {chapter.lessons.map(lesson => (
                        <LessonItem 
                            key={lesson.id} 
                            lesson={lesson}
                            isSelected={selectedLessonId === lesson.id}
                            isCompleted={false} // TODO: Implement completion status
                            onClick={() => onLessonClick(lesson)}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

const SubjectItem = ({ subject, onLessonClick, selectedLessonId }: { subject: Subject, onLessonClick: (lesson: Lesson) => void, selectedLessonId?: string | null }) => {
    return (
         <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 group">
                <h3 className="font-bold text-base font-headline">{subject.title}</h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="py-1 space-y-1">
                    {subject.chapters.map(chapter => (
                        <ChapterItem 
                            key={chapter.id} 
                            chapter={chapter} 
                            onLessonClick={onLessonClick}
                            selectedLessonId={selectedLessonId}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export const CourseSidebar = ({ course, onLessonClick, selectedLessonId, isOpen }: { course: Course, onLessonClick: (lesson: Lesson) => void, selectedLessonId?: string | null, isOpen: boolean }) => {
    return (
        <AnimatePresence>
        {isOpen && (
            <motion.aside 
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed top-0 left-0 h-full w-80 bg-background border-r flex flex-col z-40"
            >
                <header className="p-4 border-b flex items-center gap-3 h-16 shrink-0">
                    <BookOpen className="w-6 h-6 text-primary"/>
                    <h2 className="text-lg font-bold font-headline truncate">{course.title}</h2>
                </header>
                <ScrollArea className="flex-grow p-2">
                    <div className="space-y-2">
                        {course.subjects && course.subjects.length > 0 ? (
                             course.subjects.map(subject => (
                                <SubjectItem 
                                    key={subject.id} 
                                    subject={subject} 
                                    onLessonClick={onLessonClick}
                                    selectedLessonId={selectedLessonId}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <p>No subjects or lessons have been added to this course yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </motion.aside>
        )}
        </AnimatePresence>
    )
}
