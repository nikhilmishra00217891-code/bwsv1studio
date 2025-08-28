
"use client";

import type { Lesson } from "@/types";
import { Button } from "../ui/button";
import { PlayCircle, FileText, CheckCircle, Video, BookOpen, Heart, ThumbsUp } from 'lucide-react';
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";

interface CourseContentProps {
    lesson: Lesson | null;
    welcomeMessage?: boolean;
    onStartFirstLesson?: () => void;
    courseTitle?: string;
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
        // Fallback for invalid URLs, just in case
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    return null;
}


const WelcomeScreen = ({ onStartFirstLesson, courseTitle }: { onStartFirstLesson?: () => void, courseTitle?: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-primary/10 p-5 rounded-full mb-6">
            <BookOpen className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-headline">Welcome to {courseTitle}!</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
            Select a lesson from the sidebar to begin your learning journey. You've got this!
        </p>
        {onStartFirstLesson && (
            <Button size="lg" className="mt-8" onClick={onStartFirstLesson}>
                <PlayCircle className="mr-2" /> Start First Lesson
            </Button>
        )}
    </div>
);

const LectureView = ({ lesson }: { lesson: Lesson }) => {
    const videoId = extractYouTubeVideoId(lesson.content || "");
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="aspect-video bg-card rounded-lg overflow-hidden border shadow-lg">
                {lesson.type === 'video' && videoId ? (
                     <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
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

export function CourseContent({ lesson, welcomeMessage, onStartFirstLesson, courseTitle }: CourseContentProps) {
    if (welcomeMessage) {
        return <WelcomeScreen onStartFirstLesson={onStartFirstLesson} courseTitle={courseTitle} />;
    }

    if (!lesson) {
        return <WelcomeScreen courseTitle={courseTitle} />;
    }

    return <LectureView lesson={lesson} />;
}
