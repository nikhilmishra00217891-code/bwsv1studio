
"use client";

import { useEffect, useState, useTransition } from 'react';
import { getCourses } from '@/lib/data';
import { endLiveSession } from '@/lib/data';
import type { Course, Lesson } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';

interface LiveLesson {
    lesson: Lesson;
    courseId: string;
    courseTitle: string;
    subjectId: string;
    subjectTitle: string;
    chapterId: string;
    chapterTitle: string;
}

export default function LiveSessionsPage() {
    const [liveLessons, setLiveLessons] = useState<LiveLesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnding, setIsEnding] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchLiveLessons = async () => {
        setIsLoading(true);
        const allCourses = await getCourses(true);
        const activeLessons: LiveLesson[] = [];

        allCourses.forEach(course => {
            course.subjects?.forEach(subject => {
                subject.chapters?.forEach(chapter => {
                    chapter.lessons?.forEach(lesson => {
                        if (lesson.status === 'live') {
                            activeLessons.push({
                                lesson,
                                courseId: course.id,
                                courseTitle: course.title,
                                subjectId: subject.id,
                                subjectTitle: subject.title,
                                chapterId: chapter.id,
                                chapterTitle: chapter.title,
                            });
                        }
                    });
                });
            });
        });
        setLiveLessons(activeLessons);
        setIsLoading(false);
    };
    
    useEffect(() => {
        fetchLiveLessons();
    }, []);
    
    const handleEndSession = async (liveLesson: LiveLesson) => {
        setIsEnding(liveLesson.lesson.id);
        const { success, message } = await endLiveSession(
            liveLesson.courseId,
            liveLesson.subjectId,
            liveLesson.chapterId,
            liveLesson.lesson.id
        );
        
        if (success) {
            toast({
                title: "Session Ended",
                description: `"${liveLesson.lesson.title}" has been moved to recorded.`,
            });
            // Refresh the list optimistically or by re-fetching
            startTransition(() => {
                setLiveLessons(prev => prev.filter(l => l.lesson.id !== liveLesson.lesson.id));
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Failed to End Session",
                description: message,
            })
        }
        setIsEnding(null);
    }

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Live Session Management</h1>
                <p className="text-muted-foreground">End live sessions to move them to the recorded section for students.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Currently Live</CardTitle>
                    <CardDescription>This is a list of all lessons currently marked as 'live' across all courses.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex items-center justify-center h-48">
                            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : liveLessons.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lesson</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {liveLessons.map(item => (
                                    <TableRow key={item.lesson.id}>
                                        <TableCell className="font-medium">
                                            <p>{item.lesson.title}</p>
                                            <a href={item.lesson.content} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate">
                                                {item.lesson.content}
                                            </a>
                                        </TableCell>
                                        <TableCell>{item.courseTitle}</TableCell>
                                        <TableCell>{item.subjectTitle}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleEndSession(item)}
                                                disabled={isEnding === item.lesson.id}
                                            >
                                                {isEnding === item.lesson.id ? (
                                                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin"/>
                                                ) : (
                                                    <Radio className="w-4 h-4 mr-2"/>
                                                )}
                                                End Session
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No active live sessions right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

