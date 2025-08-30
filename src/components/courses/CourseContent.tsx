

"use client";

import type { Course, Lesson, Subject, Chapter } from "@/types";
import { Button } from "../ui/button";
import { PlayCircle, FileText, CheckCircle, Video, BookOpen, Heart, ThumbsUp, Info, ChevronRight, BookText } from 'lucide-react';
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";


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
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                return videoId;
            }
        }
    } catch (e) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    return null;
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

const ChapterGrid = ({ subject, onChapterSelect }: { subject: Subject, onChapterSelect: (chapter: Chapter) => void; }) => {
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
                     <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Study material for {subject.title} will be available here.</p>
                     </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

const LectureView = ({ lesson }: { lesson: Lesson }) => {
    const videoId = extractYouTubeVideoId(lesson.content || "");
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="aspect-video bg-card rounded-lg overflow-hidden border shadow-lg">
                {lesson.type === 'video' && videoId ? (
                     <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
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
    )
}

const LessonListView = ({ chapter, onLessonClick }: { chapter: Chapter, onLessonClick: (lesson: Lesson) => void }) => {
    const liveLessons = chapter.lessons.filter(l => l.status === 'live');
    const recordedLessons = chapter.lessons.filter(l => l.status === 'recorded');

    return (
        <div className="p-4 md:p-8">
             <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{chapter.title}</h1>
            </div>
             <Tabs defaultValue="live">
                <TabsList>
                    <TabsTrigger value="live">Currently Live ({liveLessons.length})</TabsTrigger>
                    <TabsTrigger value="recorded">Recorded ({recordedLessons.length})</TabsTrigger>
                </TabsList>
                 <TabsContent value="live" className="mt-6">
                    {liveLessons.length > 0 ? (
                        <div className="space-y-3">
                            {liveLessons.map(lesson => (
                                <button key={lesson.id} onClick={() => onLessonClick(lesson)} className="w-full text-left">
                                    <Card className="hover:bg-primary/5 hover:border-primary/40 transition-colors">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <Video className="w-6 h-6 text-primary"/>
                                            <span className="font-semibold">{lesson.title}</span>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-8 text-center text-muted-foreground">No sessions are live right now.</Card>
                    )}
                 </TabsContent>
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
            </Tabs>
        </div>
    )
}

export function CourseContent({ course, selectedSubject, selectedChapter, selectedLesson, onSubjectSelect, onChapterSelect, onLessonClick }: CourseContentProps) {

    if (selectedLesson) {
        return <LectureView lesson={selectedLesson} />;
    }

    if (selectedChapter) {
        return <LessonListView chapter={selectedChapter} onLessonClick={onLessonClick} />;
    }

    if (selectedSubject) {
        return <ChapterGrid subject={selectedSubject} onChapterSelect={onChapterSelect} />;
    }

    return <SubjectGrid course={course} onSubjectSelect={onSubjectSelect} />;
}
