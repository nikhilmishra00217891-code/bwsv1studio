
"use client";

import { useState, useTransition } from "react";
import type { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addSubject, deleteSubject, addChapter, deleteChapter } from "@/lib/data/courses";
import { LoaderCircle, PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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
import { cn } from "@/lib/utils";

export default function CourseFlowEditorClient({ initialCourse }: { initialCourse: Course }) {
    const [course, setCourse] = useState(initialCourse);
    const [newSubjectTitle, setNewSubjectTitle] = useState("");
    const [newChapterTitles, setNewChapterTitles] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAddSubject = () => {
        if (!newSubjectTitle.trim()) return;
        startTransition(async () => {
            try {
                const updatedCourse = await addSubject(course.id, newSubjectTitle);
                setCourse(updatedCourse);
                setNewSubjectTitle("");
                toast({ title: "Subject Added!" });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    const handleDeleteSubject = (subjectId: string) => {
        startTransition(async () => {
             try {
                const updatedCourse = await deleteSubject(course.id, subjectId);
                setCourse(updatedCourse);
                toast({ title: "Subject Removed" });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }
  
    const handleAddChapter = (subjectId: string) => {
        const chapterTitle = newChapterTitles[subjectId]?.trim();
        if (!chapterTitle) return;

        startTransition(async () => {
             try {
                const updatedCourse = await addChapter(course.id, subjectId, chapterTitle);
                setCourse(updatedCourse);
                setNewChapterTitles(prev => ({ ...prev, [subjectId]: "" }));
                toast({ title: "Chapter Added!" });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    const handleDeleteChapter = (subjectId: string, chapterId: string) => {
        startTransition(async () => {
             try {
                const updatedCourse = await deleteChapter(course.id, subjectId, chapterId);
                setCourse(updatedCourse);
                toast({ title: "Chapter Removed" });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" size="sm">
                    <Link href="/admin/course-flow">
                        <ArrowLeft className="mr-2 w-4 h-4"/> Back to Courses
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">{course.title}</h1>
                    <p className="text-muted-foreground">Editing Course Flow</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                    {(course.subjects || []).map((subject, index) => (
                        <AccordionItem value={`item-${index}`} key={subject.id} className="bg-card rounded-lg border">
                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-lg flex justify-between w-full">
                                <span>{subject.title}</span>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete "{subject.title}"?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will delete the subject and all its chapters. This action cannot be undone.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete Subject</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <div className="space-y-2 ml-4">
                                    {subject.chapters.length > 0 ? (
                                        subject.chapters.map(chapter => (
                                            <div key={chapter.id} className="flex justify-between items-center p-2 rounded-md bg-background">
                                                <p>{chapter.title}</p>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Delete "{chapter.title}"?</AlertDialogTitle></AlertDialogHeader>
                                                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteChapter(subject.id, chapter.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete Chapter</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground p-2">No chapters yet.</p>
                                    )}
                                    <div className="flex items-center gap-2 pt-2">
                                        <Input
                                            placeholder="New chapter title..."
                                            value={newChapterTitles[subject.id] || ""}
                                            onChange={(e) => setNewChapterTitles(prev => ({ ...prev, [subject.id]: e.target.value }))}
                                            disabled={isPending}
                                        />
                                        <Button onClick={() => handleAddChapter(subject.id)} disabled={isPending || !(newChapterTitles[subject.id] || "").trim()}>
                                            <PlusCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Card className="p-4 border-dashed">
                    <CardTitle className="text-lg mb-2">Add a New Subject</CardTitle>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="New subject title..."
                            value={newSubjectTitle}
                            onChange={(e) => setNewSubjectTitle(e.target.value)}
                            disabled={isPending}
                        />
                        <Button onClick={handleAddSubject} disabled={isPending || !newSubjectTitle.trim()}>
                            {isPending && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Add Subject
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
