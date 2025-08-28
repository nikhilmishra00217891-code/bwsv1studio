
"use client";

import type { Lesson } from "@/types";
import { Button } from "../ui/button";
import { PlayCircle, FileText, CheckCircle, Video } from 'lucide-react';
import Image from "next/image";

interface CourseContentProps {
    lesson: Lesson | null;
    welcomeMessage?: boolean;
    onStartFirstLesson?: () => void;
    courseTitle?: string;
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

const LessonPreview = ({ lesson }: { lesson: Lesson }) => {
    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg border animate-fade-in">
                {lesson.type === 'video' ? (
                     <Image
                        src="https://placehold.co/1280x720.png"
                        alt={`Thumbnail for ${lesson.title}`}
                        width={1280}
                        height={720}
                        className="w-full rounded-md aspect-video object-cover"
                        data-ai-hint="video lecture thumbnail"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center bg-muted aspect-video rounded-md">
                        <FileText className="w-24 h-24 text-muted-foreground" />
                    </div>
                )}
               
                <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase">{lesson.type}</p>
                        <h2 className="text-2xl md:text-3xl font-bold font-headline mt-1">{lesson.title}</h2>
                    </div>
                    <Button size="lg" className="w-full md:w-auto shrink-0">
                        <PlayCircle className="mr-2"/> Start Learning
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function CourseContent({ lesson, welcomeMessage, onStartFirstLesson, courseTitle }: CourseContentProps) {
    if (!lesson) {
        return <WelcomeScreen onStartFirstLesson={welcomeMessage ? undefined : onStartFirstLesson} courseTitle={courseTitle} />;
    }

    return <LessonPreview lesson={lesson} />;
}
