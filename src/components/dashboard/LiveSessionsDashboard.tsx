
"use client";

import { useMemo } from 'react';
import type { EnrolledCourse, Lesson } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Radio, CalendarClock, ChevronsRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Session extends Lesson {
    courseId: string;
    courseTitle: string;
    subjectTitle: string;
}

export default function LiveSessionsDashboard({ enrolledCourses }: { enrolledCourses: EnrolledCourse[] }) {
    
    const { liveSessions, upcomingSessions } = useMemo(() => {
        const live: Session[] = [];
        const upcoming: Session[] = [];

        enrolledCourses.forEach(course => {
            course.subjects?.forEach(subject => {
                subject.chapters?.forEach(chapter => {
                    chapter.lessons?.forEach(lesson => {
                        const sessionData: Session = {
                            ...lesson,
                            courseId: course.id,
                            courseTitle: course.title,
                            subjectTitle: subject.title,
                        };
                        if (lesson.status === 'live') {
                            live.push(sessionData);
                        } else if (lesson.status === 'scheduled') {
                            upcoming.push(sessionData);
                        }
                    });
                });
            });
        });

        // Sorting upcoming sessions by date
        upcoming.sort((a, b) => {
            const timeA = a.scheduledTime ? new Date(a.scheduledTime as string).getTime() : 0;
            const timeB = b.scheduledTime ? new Date(b.scheduledTime as string).getTime() : 0;
            return timeA - timeB;
        });

        return { liveSessions: live, upcomingSessions: upcoming };
    }, [enrolledCourses]);

    const renderSessionList = (sessions: Session[]) => (
        <div className="space-y-3">
            {sessions.map(session => (
                <Card key={session.id} className="hover:bg-muted/50">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div>
                            <p className="font-semibold">{session.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {session.courseTitle} • {session.subjectTitle}
                                {session.status === 'scheduled' && session.scheduledTime && (
                                    <span className="ml-2 font-medium text-blue-600">
                                        at {format(new Date(session.scheduledTime as string), 'p')}
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button asChild size="sm">
                            <Link href={`/courses/${session.courseId}/learnzone`}>
                                Join Now <ChevronsRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Radio className="w-6 h-6 text-primary animate-pulse" />
                    <CardTitle className="text-xl font-headline">Live & Upcoming Sessions</CardTitle>
                </div>
                <CardDescription>Your live classes and scheduled sessions for today.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="live">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="live">
                            <Eye className="mr-2 h-4 w-4"/> Currently Live ({liveSessions.length})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming">
                            <CalendarClock className="mr-2 h-4 w-4"/> Upcoming ({upcomingSessions.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="live" className="pt-4">
                        {liveSessions.length > 0 ? (
                            renderSessionList(liveSessions)
                        ) : (
                            <p className="text-center text-muted-foreground p-8">No sessions are live right now.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="upcoming" className="pt-4">
                         {upcomingSessions.length > 0 ? (
                            renderSessionList(upcomingSessions)
                        ) : (
                            <p className="text-center text-muted-foreground p-8">No more sessions scheduled for today.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
