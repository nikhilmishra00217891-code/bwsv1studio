
"use client";

import { useEffect, useState, useTransition, useCallback } from 'react';
import { getCourses } from '@/lib/data';
import { updateLessonStatus, deleteLesson, endLiveSession } from '@/lib/data/courses';
import type { Course, Lesson } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoaderCircle, Radio, CalendarClock, Pencil, Trash2, CalendarIcon, Play } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
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

const RescheduleDialog = ({ session, isOpen, onOpenChange, onReschedule }: { session: Session | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onReschedule: (newDate: Date) => void }) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('09:00');

    useEffect(() => {
        if (session?.scheduledTime) {
            const sessionDate = new Date((session.scheduledTime as any).seconds * 1000);
            setDate(sessionDate);
            setTime(format(sessionDate, 'HH:mm'));
        }
    }, [session]);
    
    if (!session) return null;

    const handleSubmit = () => {
        if (!date) return;
        const [hours, minutes] = time.split(':').map(Number);
        const newScheduleTime = new Date(date);
        newScheduleTime.setHours(hours, minutes);
        onReschedule(newScheduleTime);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reschedule: {session.title}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                        <Label>Date</Label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                            </Popover>
                    </div>
                    <div>
                        <Label>Time (IST)</Label>
                        <Select value={time} onValueChange={setTime}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 48 }, (_, i) => {
                                    const hour = String(Math.floor(i / 2)).padStart(2, '0');
                                    const minute = i % 2 === 0 ? '00' : '30';
                                    return `${hour}:${minute}`;
                                }).map(t => <SelectItem key={t} value={t}>{format(new Date(`1970-01-01T${t}:00`), 'p')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function LiveSessionsPage() {
    const [liveSessions, setLiveSessions] = useState<Session[]>([]);
    const [scheduledSessions, setScheduledSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const [sessionToReschedule, setSessionToReschedule] = useState<Session | null>(null);

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
            const timeA = a.scheduledTime?.seconds ? (a.scheduledTime.seconds * 1000) : 0;
            const timeB = b.scheduledTime?.seconds ? (b.scheduledTime.seconds * 1000) : 0;
            return timeA - timeB;
        });


        setLiveSessions(activeSessions);
        setScheduledSessions(upcomingSessions);
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);
    
    const handleUpdateStatus = async (session: Session, newStatus: 'live' | 'scheduled' | 'recorded', newTime?: Date) => {
        startTransition(async () => {
             const { success, message } = await updateLessonStatus(
                session.courseId, session.subjectId, session.chapterId, session.id,
                newStatus,
                newTime ? newTime.toISOString() : null
            );
            if (success) {
                toast({ title: "Session Updated!", description: `"${session.title}" status changed to ${newStatus}.` });
                fetchSessions();
            } else {
                 toast({ variant: 'destructive', title: "Update Failed", description: message });
            }
        });
    }

    const handleEndSession = async (session: Session) => {
        startTransition(async () => {
             const { success, message } = await endLiveSession(
                session.courseId, session.subjectId, session.chapterId, session.id
            );
            if (success) {
                toast({ title: "Session Ended", description: `"${session.title}" has been moved to recorded.` });
                fetchSessions();
            } else {
                toast({ variant: 'destructive', title: "Failed to End Session", description: message });
            }
        });
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
    
    const getSessionDate = (session: Session) => {
        if (!session.scheduledTime) return 'N/A';
        // Check if it's a Firestore Timestamp-like object
        if ((session.scheduledTime as any).seconds) {
            return new Date((session.scheduledTime as any).seconds * 1000);
        }
        // Check if it's an ISO string or Date object
        return new Date(session.scheduledTime as any);
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
                                {item.scheduledTime ? format(getSessionDate(item), 'PPP p') : 'N/A'}
                            </TableCell>
                        )}
                        <TableCell className="text-right space-x-2">
                             {isLiveTable ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setSessionToReschedule(item)} disabled={isPending}>
                                        <CalendarIcon className="w-4 h-4 mr-2"/> Reschedule
                                    </Button>
                                    <Button 
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleEndSession(item)}
                                        disabled={isPending}
                                    >
                                        <Radio className="w-4 h-4 mr-2"/>
                                        End Session
                                    </Button>
                                </>
                             ) : (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setSessionToReschedule(item)} disabled={isPending}>
                                        <Pencil className="w-4 h-4 mr-2"/> Edit Time
                                    </Button>
                                     <Button size="sm" onClick={() => handleUpdateStatus(item, 'live')} disabled={isPending}>
                                        <Play className="w-4 h-4 mr-2"/> Go Live Now
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" className="h-9 w-9" disabled={isPending}><Trash2 className="w-4 h-4"/></Button>
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
            <RescheduleDialog 
                session={sessionToReschedule}
                isOpen={!!sessionToReschedule}
                onOpenChange={() => setSessionToReschedule(null)}
                onReschedule={(newDate) => {
                    if (sessionToReschedule) {
                        handleUpdateStatus(sessionToReschedule, 'scheduled', newDate);
                    }
                    setSessionToReschedule(null);
                }}
            />
        </div>
    );
}
