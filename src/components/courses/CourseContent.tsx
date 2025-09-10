
"use client";

import type { Course, Lesson, Subject, Chapter, LiveChatMessage } from "@/types";
import { Button } from "../ui/button";
import { PlayCircle, FileText, CheckCircle, Video, BookOpen, Heart, ThumbsUp, Info, ChevronRight, BookText, Send, LoaderCircle, Sparkles, Eye, Clock } from 'lucide-react';
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { listenForLiveChatMessages } from "@/lib/data";
import { sendLiveChatMessage } from "@/lib/data/courses";
import { useEffect, useRef, useState, FormEvent, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import StudyMaterialEditor from "./StudyMaterialEditor";

interface CourseContentProps {
    course: Course;
    selectedSubject: Subject | null;
    selectedChapter: Chapter | null;
    selectedLesson: Lesson | null;
    onSubjectSelect: (subject: Subject) => void;
    onChapterSelect: (chapter: Chapter) => void;
    onLessonClick: (lesson: Lesson) => void;
}

const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    let videoId: string | null = null;
    
    // Standard and short URLs
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
        videoId = match[1];
    }

    // Handle /live/ URLs
    if (!videoId) {
        const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
        if (liveMatch) {
            videoId = liveMatch[1];
        }
    }
    
    return videoId;
}

const LiveChat = ({ course, subject, chapter, lesson }: { course: Course; subject: Subject; chapter: Chapter; lesson: Lesson; }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [canSendMessage, setCanSendMessage] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = listenForLiveChatMessages(
            course.id, subject.id, chapter.id, lesson.id,
            setMessages
        );
        return () => unsubscribe();
    }, [course.id, subject.id, chapter.id, lesson.id]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !canSendMessage) return;

        setIsSending(true);
        setCanSendMessage(false);

        try {
            await sendLiveChatMessage(
                course.id, subject.id, chapter.id, lesson.id,
                {
                    senderId: user.uid,
                    senderName: user.displayName || "Student",
                    text: newMessage.trim()
                }
            );
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
            toast({ variant: 'destructive', title: 'Could not send message' });
        } finally {
            setIsSending(false);
            setTimeout(() => setCanSendMessage(true), 10000); // 10-second cooldown
        }
    };

    return (
        <Card className="mt-8 flex flex-col h-[70vh]">
            <CardContent className="p-4 flex-grow flex flex-col">
                <div className="flex items-center gap-2 border-b pb-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Live Discussion</h3>
                </div>
                <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className="flex items-start gap-2 text-sm">
                                <Avatar className="w-6 h-6">
                                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-bold text-primary/90">{msg.senderName}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(msg.timestamp as any), { addSuffix: true })}</p>
                                    </div>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t">
                    <Input 
                        placeholder={canSendMessage ? "Say something..." : "Please wait..."}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        disabled={isSending || !canSendMessage}
                    />
                    <Button type="submit" disabled={isSending || !canSendMessage || !newMessage.trim()}>
                        {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

const SubjectGrid = ({ course, onSubjectSelect }: { course: Course, onSubjectSelect: (subject: Subject) => void }) => {
    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{course.title}</h1>
                <p className="text-muted-foreground mt-1">Select a subject to begin your learning journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(course.subjects || []).map(subject => (
                    <button 
                        key={subject.id}
                        onClick={() => onSubjectSelect(subject)}
                        className="text-left w-full"
                    >
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-200 h-full">
                             <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-primary bg-primary/10 shrink-0",
                                    )}>
                                        {subject.title.substring(0, 2)}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">{subject.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={subject.progress || 0} className="w-24 h-1.5" />
                                            <span className="text-xs text-muted-foreground">{subject.progress || 0}%</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </button>
                ))}
            </div>
             <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                <p>Completion % depends on lecture and DPP progress!</p>
            </div>
        </div>
    )
}

const ChapterGrid = ({ course, subject, onChapterSelect }: { course: Course; subject: Subject, onChapterSelect: (chapter: Chapter) => void; }) => {
    const { userProfile } = useAuth();
    const isFaculty = userProfile?.role === 'faculty';

    return (
        <div className="p-4 md:p-8">
             <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{subject.title}</h1>
            </div>
            <Tabs defaultValue="chapters">
                <TabsList>
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="material">Study Material</TabsTrigger>
                </TabsList>
                 <TabsContent value="chapters" className="mt-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(subject.chapters || []).map((chapter, index) => (
                            <button key={chapter.id} onClick={() => onChapterSelect(chapter)} className="text-left">
                                <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-200 h-full p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-500 mb-1">CH - {String(index + 1).padStart(2, '0')}</p>
                                            <h3 className="font-bold text-lg">{chapter.title}</h3>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-muted-foreground shrink-0"/>
                                    </div>
                                     <p className="text-xs text-muted-foreground mt-2">Lecture: {chapter.lessons.length}</p>
                                </Card>
                            </button>
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="material" className="mt-6">
                     <StudyMaterialEditor
                        courseId={course.id}
                        subjectId={subject.id}
                        chapters={subject.chapters}
                        isFaculty={isFaculty}
                     />
                </TabsContent>
            </Tabs>
        </div>
    )
}

const LectureView = ({ course, subject, chapter, lesson }: { course: Course; subject: Subject; chapter: Chapter; lesson: Lesson }) => {
    const videoId = extractYouTubeVideoId(lesson.content || "");
    const isLive = lesson.status === 'live';

    return (
        <div className="grid lg:grid-cols-3 gap-8 p-4 md:p-8 max-w-full">
            <div className="lg:col-span-2">
                <div className="aspect-video bg-card rounded-lg overflow-hidden border shadow-lg relative">
                    {videoId ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&mute=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen>
                        </iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">No video available for this lesson.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase">{lesson.type}</p>
                        <h2 className="text-2xl md:text-3xl font-bold font-headline mt-1">{lesson.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="icon"><Heart /></Button>
                        <Button variant="outline" size="icon"><ThumbsUp /></Button>
                        <Button size="lg" className="w-full">
                            <CheckCircle className="mr-2"/> Mark as Complete
                        </Button>
                    </div>
                </div>

                <Card className="mt-8">
                    <div className="p-6">
                        <h3 className="text-xl font-bold font-headline mb-4">Lecture Notes</h3>
                        <ScrollArea className="h-72">
                            <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                                {lesson.notes ? (
                                    <p className="whitespace-pre-wrap">{lesson.notes}</p>
                                ) : (
                                    <p className="text-muted-foreground">No notes available for this lesson yet.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 {isLive ? (
                    <LiveChat course={course} subject={subject} chapter={chapter} lesson={lesson} />
                 ) : (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            This was a recorded session. The live chat is not available.
                        </CardContent>
                    </Card>
                 )}
            </div>
        </div>
    )
}

const LessonListView = ({ chapter, onLessonClick }: { chapter: Chapter, onLessonClick: (lesson: Lesson) => void }) => {
    const liveAndScheduledLessons = chapter.lessons.filter(l => l.status === 'live' || l.status === 'scheduled');
    const recordedLessons = chapter.lessons.filter(l => l.status === 'recorded');

    return (
        <div className="p-4 md:p-8">
             <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{chapter.title}</h1>
            </div>
             <Tabs defaultValue="recorded">
                <TabsList>
                    <TabsTrigger value="recorded">Recorded ({recordedLessons.length})</TabsTrigger>
                     <TabsTrigger value="live" className="relative">
                        Live & Upcoming ({liveAndScheduledLessons.length})
                        {liveAndScheduledLessons.length > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px] font-bold">
                                    <Eye className="w-2.5 h-2.5"/>
                                </span>
                            </div>
                        )}
                    </TabsTrigger>
                </TabsList>
                 <TabsContent value="recorded" className="mt-6">
                     {recordedLessons.length > 0 ? (
                        <div className="space-y-3">
                            {recordedLessons.map(lesson => (
                                <button key={lesson.id} onClick={() => onLessonClick(lesson)} className="w-full text-left">
                                    <Card className="hover:bg-muted/80">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <BookText className="w-6 h-6 text-muted-foreground"/>
                                            <span className="font-semibold text-muted-foreground">{lesson.title}</span>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </div>
                     ) : (
                         <Card className="p-8 text-center text-muted-foreground">No recorded sessions available for this chapter yet.</Card>
                     )}
                 </TabsContent>
                 <TabsContent value="live" className="mt-6">
                    {liveAndScheduledLessons.length > 0 ? (
                        <div className="space-y-3">
                            {liveAndScheduledLessons.map(lesson => (
                                <button key={lesson.id} onClick={() => onLessonClick(lesson)} className="w-full text-left">
                                    <Card className="hover:bg-primary/5 hover:border-primary/40 transition-colors border-2 border-transparent ring-2 ring-red-500/50 shadow-lg shadow-red-500/10">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <Video className="w-6 h-6 text-primary"/>
                                            <div>
                                                <span className="font-semibold">{lesson.title}</span>
                                                {lesson.status === 'scheduled' && lesson.scheduledTime && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(lesson.scheduledTime as string), 'PPP p')}</p>
                                                )}
                                            </div>
                                            <Badge variant="destructive" className="ml-auto animate-pulse">
                                                {lesson.status === 'live' ? 'LIVE' : 'SCHEDULED'}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-8 text-center text-muted-foreground">No sessions are live right now.</Card>
                    )}
                 </TabsContent>
            </Tabs>
        </div>
    )
}

export function CourseContent({ course, selectedSubject, selectedChapter, selectedLesson, onSubjectSelect, onChapterSelect, onLessonClick }: CourseContentProps) {

    if (selectedLesson && selectedSubject && selectedChapter) {
        return <LectureView course={course} subject={selectedSubject} chapter={selectedChapter} lesson={selectedLesson} />;
    }

    if (selectedChapter) {
        return <LessonListView chapter={selectedChapter} onLessonClick={onLessonClick} />;
    }

    if (selectedSubject) {
        return <ChapterGrid course={course} subject={selectedSubject} onChapterSelect={onChapterSelect} />;
    }

    return <SubjectGrid course={course} onSubjectSelect={onSubjectSelect} />;
}
