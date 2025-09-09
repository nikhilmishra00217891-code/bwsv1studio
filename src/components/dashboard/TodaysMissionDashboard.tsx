
'use client';

import type { UserMission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, BookCopy } from 'lucide-react';
import { useMemo } from 'react';

export default function TodaysMissionDashboard({ missions }: { missions: UserMission[] }) {
    
    const groupedMissions = useMemo(() => {
        return missions.reduce((acc, mission) => {
            if (!acc[mission.courseTitle]) {
                acc[mission.courseTitle] = [];
            }
            acc[mission.courseTitle].push(mission);
            return acc;
        }, {} as Record<string, UserMission[]>);
    }, [missions]);

    if (missions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-primary" />
                        <CardTitle className="text-xl font-headline">Today's Mission</CardTitle>
                    </div>
                    <CardDescription>Your daily objectives from your mentors will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                    <p>No missions set for today. Great job staying ahead!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl font-headline">Today's Mission</CardTitle>
                </div>
                <CardDescription>Your daily objectives from your mentors. Let's get them done!</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={Object.keys(groupedMissions)}>
                    {Object.entries(groupedMissions).map(([courseTitle, courseMissions]) => (
                        <AccordionItem value={courseTitle} key={courseTitle}>
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <BookCopy className="w-5 h-5 text-muted-foreground"/>
                                    {courseTitle}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pl-4 border-l ml-2">
                                <ul className="space-y-3 list-disc list-inside">
                                    {courseMissions.map(mission => (
                                        <li key={mission.subjectTitle}>
                                            <span className="font-semibold">{mission.subjectTitle}:</span>
                                            <span className="text-muted-foreground ml-2">{mission.details}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
