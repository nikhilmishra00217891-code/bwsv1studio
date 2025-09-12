
'use client';

import type { UserMission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, BookCopy, Check, PartyPopper } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodaysMissionDashboard({ missions }: { missions: UserMission[] }) {
    const [checkedMissions, setCheckedMissions] = useState<Set<string>>(new Set());

    useEffect(() => {
        // This resets the state if the missions prop changes (e.g., new day).
        setCheckedMissions(new Set());
    }, [missions]);

    const handleMissionToggle = (missionKey: string) => {
        setCheckedMissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(missionKey)) {
                newSet.delete(missionKey);
            } else {
                newSet.add(missionKey);
            }
            return newSet;
        });
    };
    
    const allMissionsCompleted = missions.length > 0 && checkedMissions.size === missions.length;

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
                <AnimatePresence>
                {allMissionsCompleted && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="mb-6 bg-green-100/50 border-2 border-dashed border-green-500 rounded-lg p-6 text-center"
                    >
                        <PartyPopper className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-green-800">All Missions Accomplished!</h3>
                        <p className="text-sm text-green-700">Excellent work! You've completed all your objectives for today.</p>
                    </motion.div>
                )}
                </AnimatePresence>
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
                                <div className="space-y-4">
                                    {courseMissions.map(mission => {
                                        const missionKey = `${courseTitle}-${mission.subjectTitle}`;
                                        const isChecked = checkedMissions.has(missionKey);
                                        return (
                                            <div key={missionKey} className="flex items-start gap-3">
                                                <Checkbox
                                                    id={missionKey}
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleMissionToggle(missionKey)}
                                                    className="mt-1"
                                                />
                                                <Label 
                                                    htmlFor={missionKey} 
                                                    className={cn(
                                                        "flex-grow transition-colors",
                                                        isChecked && "text-muted-foreground line-through"
                                                    )}
                                                >
                                                    <span className="font-semibold">{mission.subjectTitle}:</span>
                                                    <span className="ml-2">{mission.details}</span>
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
