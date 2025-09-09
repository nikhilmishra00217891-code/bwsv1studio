
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCourseById } from '@/lib/data';
import { getMissionsForDate, setMission, getMissionHistoryForSubject } from '@/lib/data/missions';
import type { Course, DailyMission, Subject } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Save, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const MissionHistoryDialog = ({
    isOpen,
    onOpenChange,
    subject,
    history,
    isLoading,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    subject: Subject | null;
    history: DailyMission[];
    isLoading: boolean;
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Mission History for "{subject?.title}"</DialogTitle>
                    <DialogDescription>A log of all past missions set for this subject.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <LoaderCircle className="animate-spin" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-4 py-4">
                            {history.map(mission => (
                                <div key={mission.id} className="border-b pb-3 last:border-b-0">
                                    <p className="font-semibold text-sm">
                                        {format(mission.createdAt.toDate(), "do MMMM, yyyy 'at' h:mm a")}
                                    </p>
                                    <blockquote className="mt-1 border-l-2 pl-4 italic text-muted-foreground">
                                        {mission.details}
                                    </blockquote>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-12">No mission history found for this subject.</p>
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function TodaysMissionPage() {
    const { user, userProfile } = useAuth();
    const params = useParams();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [missions, setMissions] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyMissions, setHistoryMissions] = useState<DailyMission[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const courseData = await getCourseById(courseId);
            setCourse(courseData);

            if (courseData) {
                const today = new Date().toISOString().split('T')[0];
                const todaysMissions = await getMissionsForDate(courseId, today);
                
                const missionMap: Record<string, string> = {};
                // Populate the textareas with the latest mission for each subject for today
                courseData.subjects.forEach(subject => {
                    const subjectMissions = todaysMissions.filter(m => m.subjectId === subject.id);
                    if (subjectMissions.length > 0) {
                        // Sort by timestamp to find the latest one
                        subjectMissions.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
                        missionMap[subject.id] = subjectMissions[0].details;
                    }
                });
                
                setMissions(missionMap);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [courseId]);

    const handleSaveMission = async (subjectId: string) => {
        const missionDetails = missions[subjectId];
        if (!missionDetails || !course) return;

        setIsSaving(prev => ({ ...prev, [subjectId]: true }));
        try {
            await setMission({
                courseId: course.id,
                subjectId,
                details: missionDetails,
            });
            toast({
                title: "Mission Saved!",
                description: `Today's mission for ${course.subjects.find(s => s.id === subjectId)?.title} has been updated.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Failed to Save Mission",
                description: error.message,
            });
        } finally {
            setIsSaving(prev => ({ ...prev, [subjectId]: false }));
        }
    };
    
    const handleMissionChange = (subjectId: string, details: string) => {
        setMissions(prev => ({ ...prev, [subjectId]: details }));
    };

    const handleViewHistory = async (subject: Subject) => {
        setSelectedSubject(subject);
        setHistoryLoading(true);
        setIsHistoryOpen(true);
        const history = await getMissionHistoryForSubject(course.id, subject.id);
        setHistoryMissions(history);
        setHistoryLoading(false);
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (userProfile?.role !== 'faculty') {
        return (
            <div className="flex h-full items-center justify-center">
                <p>This page is for faculty members only.</p>
            </div>
        )
    }

    if (!course) {
        return <p>Course not found.</p>;
    }

    return (
        <>
            <div className="p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-headline">Today's Mission Control</h1>
                    <p className="text-muted-foreground mt-1">
                        Set the daily mission for each subject in the "{course.title}" course. Today is {format(new Date(), "do MMMM, yyyy")}.
                    </p>
                </div>
                <div className="space-y-6">
                    {(course.subjects || []).map(subject => (
                        <Card key={subject.id}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{subject.title}</CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => handleViewHistory(subject)}>
                                        <History className="mr-2 h-4 w-4"/> View History
                                    </Button>
                                </div>
                                <CardDescription>
                                    Set the primary objective for this subject today. Students will see this on their dashboard.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder={`What is the mission for ${subject.title} today? e.g., "Complete DPP for Chapter 3 and revise all formulas."`}
                                    value={missions[subject.id] || ''}
                                    onChange={(e) => handleMissionChange(subject.id, e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <div className="flex justify-end mt-4">
                                    <Button
                                        onClick={() => handleSaveMission(subject.id)}
                                        disabled={isSaving[subject.id] || !(missions[subject.id] || '').trim()}
                                    >
                                        {isSaving[subject.id] ? (
                                            <LoaderCircle className="animate-spin mr-2" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save Mission
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
             <MissionHistoryDialog 
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                subject={selectedSubject}
                history={historyMissions}
                isLoading={historyLoading}
            />
        </>
    );
}

