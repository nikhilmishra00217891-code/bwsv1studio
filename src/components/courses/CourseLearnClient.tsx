
"use client";

import { useState, useEffect, useMemo, FormEvent } from 'react';
import type { Course, Subject, Chapter, Lesson, LiveChatMessage, UrlMetadata, Poll } from "@/types";
import { CourseSidebar } from '@/components/courses/CourseSidebar';
import { CourseContent } from '@/components/courses/CourseContent';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Library, Menu, Paperclip, BarChart3, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import TodaysMissionPage from './todays-mission/page';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendLiveChatMessage } from '@/lib/data/courses';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, XCircle } from 'lucide-react';

const CreatePollDialog = ({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSubmit: (poll: Poll) => void }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuestion('');
            setOptions(['', '']);
        }
    }, [isOpen]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || options.some(opt => !opt.trim())) {
            return;
        }
        setIsLoading(true);
        const poll: Poll = {
            question,
            options: options.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, voterIds: [] })),
        };
        onSubmit(poll);
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Poll</DialogTitle>
                    <DialogDescription>Ask a question and let the chamber vote.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="poll-question">Poll Question</Label>
                        <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        required
                                    />
                                    {options.length > 2 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-destructive">
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 5 && (
                            <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                                <Plus className="w-4 h-4 mr-2" /> Add Option
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : "Create Poll"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default function CourseLearnClient({ course, userProgress }: { course: Course; userProgress: number; }) {
    const pathname = usePathname();
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);

    const isEventsPage = pathname.endsWith('/events');
    const isResourcesPage = pathname.endsWith('/resources');
    const isTodaysMissionPage = pathname.endsWith('/todays-mission');
    
    const isFaculty = userProfile?.role === 'faculty';

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

    const handleBack = () => {
        if (selectedLesson) {
            setSelectedLesson(null);
        } else if (selectedChapter) {
            setSelectedChapter(null);
        } else if (selectedSubject) {
            setSelectedSubject(null);
        } else {
             // If nothing is selected, go back to course details
            window.location.href = `/courses/${course.id}`;
        }
    };
    
    const handleSendPoll = async (poll: Poll) => {
        if (!user || !selectedChapter || !selectedLesson || !selectedSubject) return;

        try {
            await sendLiveChatMessage(
                course.id, selectedSubject.id, selectedChapter.id, selectedLesson.id,
                {
                    senderId: user.uid,
                    senderName: userProfile?.displayName || "Faculty",
                    text: '',
                    messageType: 'poll',
                    poll: poll
                }
            );
            setIsCreatePollOpen(false);
            toast({ title: 'Poll created successfully!' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const renderContent = () => {
        if (isTodaysMissionPage) {
            return <TodaysMissionPage />
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
                isFaculty={isFaculty}
                onSendPoll={() => setIsCreatePollOpen(true)}
            />
        );
    };
    
    const renderHeaderTitle = () => {
        if (isTodaysMissionPage) return "Today's Mission";
        if (isEventsPage) return "Events";
        if (isResourcesPage) return "Course Resources";
        
        if (selectedLesson) return selectedLesson.title;
        if (selectedChapter) return selectedChapter.title;
        if (selectedSubject) return selectedSubject.title;

        return "Course Content";
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-card/50">
                <CourseSidebar 
                    course={course}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    isFaculty={isFaculty}
                />

                <main className="flex-1 flex flex-col transition-all duration-300 overflow-hidden">
                    <header className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-b p-3 flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-muted-foreground md:hidden"
                            >
                                <Menu className="w-5 h-5"/>
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2"/> Back
                            </Button>
                        </div>
                        <h2 className="text-lg font-bold font-headline hidden md:block truncate" title={renderHeaderTitle()}>{renderHeaderTitle()}</h2>
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

                    <div className="flex-grow overflow-y-auto w-full">
                        <div className="mx-auto w-full h-full">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
            <CreatePollDialog isOpen={isCreatePollOpen} onOpenChange={setIsCreatePollOpen} onSubmit={handleSendPoll} />
        </TooltipProvider>
    );
}
