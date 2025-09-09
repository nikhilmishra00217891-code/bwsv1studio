
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCourseById } from '@/lib/data';
import { getMissionsForDate, setMission } from '@/lib/data/missions';
import type { Course, DailyMission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TodaysMissionPage() {
    const { user, userProfile } = useAuth();
    const params = useParams();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [missions, setMissions] = useState<Record<string, string>>({});
    const [existingMissions, setExistingMissions] = useState<DailyMission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const courseData = await getCourseById(courseId);
            setCourse(courseData);

            if (courseData) {
                const today = new Date().toISOString().split('T')[0];
                const fetchedMissions = await getMissionsForDate(courseId, today);
                setExistingMissions(fetchedMissions);
                
                const missionMap: Record<string, string> = {};
                fetchedMissions.forEach(mission => {
                    missionMap[mission.subjectId] = mission.details;
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
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Today's Mission Control</h1>
                <p className="text-muted-foreground mt-1">
                    Set the daily mission for each subject in the "{course.title}" course.
                </p>
            </div>
            <div className="space-y-6">
                {(course.subjects || []).map(subject => (
                    <Card key={subject.id}>
                        <CardHeader>
                            <CardTitle>{subject.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder={`What is the mission for ${subject.title} today?`}
                                value={missions[subject.id] || ''}
                                onChange={(e) => handleMissionChange(subject.id, e.target.value)}
                                className="min-h-32"
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
    );
}
