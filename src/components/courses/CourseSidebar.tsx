

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BookText, ChevronRight, Video, CheckCircle2, X, Megaphone, Calendar, FolderKanban, Target, SlidersHorizontal } from 'lucide-react';
import type { Course, Subject, Chapter, Lesson } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import Link from 'next/link';

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
    // A chapter is "active" if one of its lessons is the currently selected lesson.
    const isActive = chapter.lessons.some(lesson => lesson.id === selectedLessonId);

    return (
        <Collapsible defaultOpen={isActive}>
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

const SidebarMenuItem = ({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) => (
    <Button variant="ghost" asChild className="w-full justify-start gap-3">
        <Link href={href}>
            <Icon className="w-5 h-5"/>
            <span className="font-medium">{label}</span>
        </Link>
    </Button>
)

export const CourseSidebar = ({ course, isOpen, onClose, isFaculty }: { course: Course, isOpen: boolean, onClose: () => void, isFaculty: boolean }) => {
    return (
        <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={onClose}
                 />
                <motion.div 
                    initial={{ x: '-100%'}}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%'}}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="fixed top-0 left-0 h-full w-80 bg-background border-r flex flex-col z-40"
                >
                    <header className="p-4 border-b flex items-center justify-between gap-3 h-16 shrink-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <BookOpen className="w-6 h-6 text-primary shrink-0"/>
                            <h2 className="text-lg font-bold font-headline truncate">{course.title}</h2>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden shrink-0">
                            <X className="w-5 h-5"/>
                        </Button>
                    </header>
                    <ScrollArea className="flex-grow p-2">
                        <div className="p-2 space-y-2">
                            <SidebarMenuItem icon={Megaphone} label="Announcements" href={`/courses/${course.id}/learnzone/announcements`} />
                            <SidebarMenuItem icon={Calendar} label="Events" href={`/courses/${course.id}/learnzone/events`} />
                            <SidebarMenuItem icon={FolderKanban} label="Course Resources" href={`/courses/${course.id}/learnzone/resources`} />
                             {isFaculty && (
                                <>
                                 <div className="my-2 border-t -mx-4" />
                                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">Faculty Tools</p>
                                    <SidebarMenuItem icon={Target} label="Today's Mission" href={`/courses/${course.id}/learnzone/todays-mission`} />
                                    <SidebarMenuItem icon={SlidersHorizontal} label="Course Progress" href={`/courses/${course.id}/learnzone/progress`} />
                                </>
                             )}
                        </div>
                    </ScrollArea>
                </motion.div>
            </>
        )}
        </AnimatePresence>
    )
}
