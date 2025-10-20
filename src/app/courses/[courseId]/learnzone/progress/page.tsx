
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getCourseById, updateCourse } from '@/lib/data/courses';
import type { Course, Subject } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Save, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function CourseProgressPage() {
    const { userProfile } = useAuth();
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [mainProgress, setMainProgress] = useState(0);
    const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({});
    
    const [initialMainProgress, setInitialMainProgress] = useState(0);
    const [initialSubjectProgress, setInitialSubjectProgress] = useState<Record<string, number>>({});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (userProfile?.role !== 'faculty') {
            router.replace(`/courses/${courseId}/learnzone`);
            return;
        }

        const fetchCourse = async () => {
            const courseData = await getCourseById(courseId);
            setCourse(courseData);
            if (courseData) {
                const initialSubjectVals = courseData.subjects.reduce((acc, subject) => {
                    acc[subject.id] = subject.progress || 0;
                    return acc;
                }, {} as Record<string, number>);
                
                const initialMainVal = courseData.progress || 0;

                setSubjectProgress(initialSubjectVals);
                setInitialSubjectProgress(initialSubjectVals);

                setMainProgress(initialMainVal);
                setInitialMainProgress(initialMainVal);
            }
            setIsLoading(false);
        };
        fetchCourse();
    }, [courseId, userProfile, router]);
    
    const hasChanges = JSON.stringify(subjectProgress) !== JSON.stringify(initialSubjectProgress) || mainProgress !== initialMainProgress;

    const handleSubjectProgressChange = (subjectId: string, value: number) => {
        setSubjectProgress(prev => ({...prev, [subjectId]: value }));
    }

    const handleSaveChanges = async () => {
        if (!course) return;
        setIsSaving(true);
        try {
            const updatedSubjects = course.subjects.map(subject => ({
                ...subject,
                progress: subjectProgress[subject.id] || subject.progress || 0
            }));
            
            await updateCourse(courseId, { 
                subjects: updatedSubjects,
                progress: mainProgress,
            });
            
            setInitialSubjectProgress(subjectProgress);
            setInitialMainProgress(mainProgress);

            toast({ title: 'Progress Saved!', description: 'Official course progress has been updated.' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) {
        return <p>Course not found.</p>;
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                 <div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/courses/${courseId}/learnzone`}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Learnzone
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline mt-4">Official Course Progress</h1>
                    <p className="text-muted-foreground">Adjust the official completion percentage for each subject in "{course.title}".</p>
                </div>
                <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                    {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4"/>}
                    Save Changes
                </Button>
            </div>

             <Card className="mb-6 shadow-lg border-primary/30">
                <CardHeader>
                    <CardTitle>Overall Course Progress</CardTitle>
                    <CardDescription>Manually set the main completion percentage for the entire course.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-4 mt-2">
                        <Slider 
                            value={[mainProgress]}
                            onValueChange={([val]) => setMainProgress(val)}
                            max={100}
                            step={1}
                        />
                        <span className="font-bold text-primary text-2xl w-20 text-center">{mainProgress}%</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(course.subjects || []).map(subject => (
                    <Card key={subject.id}>
                        <CardHeader>
                            <CardTitle>{subject.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-4 mt-2">
                                <Slider 
                                    value={[subjectProgress[subject.id] || 0]}
                                    onValueChange={([val]) => handleSubjectProgressChange(subject.id, val)}
                                    max={100}
                                    step={1}
                                />
                                <span className="font-bold text-primary text-lg w-16 text-center">{subjectProgress[subject.id] || 0}%</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )

}
