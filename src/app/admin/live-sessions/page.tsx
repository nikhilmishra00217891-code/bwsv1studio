
"use client";

import { useEffect, useState, useTransition, useCallback } from 'react';
import { getCourses } from '@/lib/data/courses';
import { updateLesson, deleteLesson, endLiveSession } from '@/lib/data/courses';
import type { Course, Lesson } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoaderCircle, Radio, CalendarClock, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Session extends Lesson {
    courseId: string;
    courseTitle: string;
    subjectId: string;
    subjectTitle: string;
    chapterId: string;
    chapterTitle: string;
}


export default function LiveSessionsPage() {
    const [liveSessions, setLiveSessions] = useState<Session[]>([]);
    const [scheduledSessions, setScheduledSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnding, setIsEnding] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        const allCourses = await getCourses(true);
        const activeSessions: Session[] = [];
        const upcomingSessions: Session[] = [];

        allCourses.forEach(course => {
            course.subjects?.forEach(subject => {
                subject.chapters?.forEach(chapter => {
                    chapter.lessons?.forEach(lesson => {
                        const sessionData = {
                            ...lesson,
                            courseId: course.id,
                            courseTitle: course.title,
                            subjectId: subject.id,
                            subjectTitle: subject.title,
                            chapterId: chapter.id,
                            chapterTitle: chapter.title,
                        };
                        if (lesson.status === 'live') {
                            activeSessions.push(sessionData);
                        } else if (lesson.status === 'scheduled') {
                            upcomingSessions.push(sessionData);
                        }
                    });
                });
            });
        });

        // Sort scheduled sessions by time
        upcomingSessions.sort((a,b) => {
            const timeA = a.scheduledTime ? (a.scheduledTime.seconds * 1000) : 0;
            const timeB = b.scheduledTime ? (b.scheduledTime.seconds * 1000) : 0;
            return timeA - timeB;
        });


        setLiveSessions(activeSessions);
        setScheduledSessions(upcomingSessions);
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);
    
    const handleEndSession = async (session: Session) => {
        setIsEnding(session.id);
        const { success, message } = await endLiveSession(
            session.courseId,
            session.subjectId,
            session.chapterId,
            session.id
        );
        
        if (success) {
            toast({
                title: "Session Ended",
                description: `"${session.title}" has been moved to recorded.`,
            });
            fetchSessions(); // Re-fetch to update lists
        } else {
            toast({
                variant: 'destructive',
                title: "Failed to End Session",
                description: message,
            })
        }
        setIsEnding(null);
    }
    
    const handleCancelSession = async (session: Session) => {
         startTransition(async () => {
            try {
                await deleteLesson(session.courseId, session.subjectId, session.chapterId, session.id);
                toast({ title: "Session Canceled", description: `"${session.title}" has been removed.` });
                fetchSessions();
            } catch (error: any) {
                 toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    const renderTable = (sessions: Session[], isLiveTable: boolean) => (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Subject</TableHead>
                    {isLiveTable ? null : <TableHead>Scheduled For</TableHead>}
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sessions.map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">
                            <p>{item.title}</p>
                            <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate">
                                {item.content}
                            </a>
                        </TableCell>
                        <TableCell>{item.courseTitle}</TableCell>
                        <TableCell>{item.subjectTitle}</TableCell>
                        {isLiveTable ? null : (
                            <TableCell>
                                {item.scheduledTime ? format(new Date(item.scheduledTime.seconds * 1000), 'PPP p') : 'N/A'}
                            </TableCell>
                        )}
                        <TableCell className="text-right space-x-2">
                             {isLiveTable ? (
                                <Button 
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleEndSession(item)}
                                    disabled={isEnding === item.id || isPending}
                                >
                                    {isEnding === item.id ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin"/> : <Radio className="w-4 h-4 mr-2"/>}
                                    End Session
                                </Button>
                             ) : (
                                <>
                                    <Button asChild variant="outline" size="sm" disabled={isPending}>
                                        <Link href={`/admin/course-flow/${item.courseId}`}>
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={isPending}><Trash2 className="w-4 h-4"/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to cancel the scheduled session "{item.title}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleCancelSession(item)} className={cn(buttonVariants({variant: "destructive"}))}>
                                                    Cancel Session
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                             )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Session Control Center</h1>
                <p className="text-muted-foreground">Manage all live and scheduled sessions across your courses.</p>
            </div>
            
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs defaultValue="live" className="w-full">
                    <TabsList>
                        <TabsTrigger value="live">
                            <Radio className="mr-2 h-4 w-4"/>
                            Currently Live ({liveSessions.length})
                        </TabsTrigger>
                        <TabsTrigger value="scheduled">
                             <CalendarClock className="mr-2 h-4 w-4"/>
                            Scheduled ({scheduledSessions.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="live" className="mt-4">
                        <Card>
                             <CardHeader>
                                <CardTitle>Active Live Sessions</CardTitle>
                                <CardDescription>These sessions are currently live. End a session to move it to the 'Recorded' section for students.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               {liveSessions.length > 0 ? renderTable(liveSessions, true) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>No active live sessions right now.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="scheduled" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Scheduled Sessions</CardTitle>
                                <CardDescription>These sessions are scheduled to go live at a future time. You can edit or cancel them from here.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {scheduledSessions.length > 0 ? renderTable(scheduledSessions, false) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>No sessions are scheduled.</p>
                                         <Button asChild variant="link">
                                            <Link href="/admin/course-flow">Go to a course to schedule one</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

        </div>
    );
}
