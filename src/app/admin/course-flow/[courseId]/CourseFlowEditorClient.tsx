
"use client";

import { useState, useTransition } from "react";
import type { Course, Lesson } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addSubject, deleteSubject, addChapter, deleteChapter, addLesson, deleteLesson } from "@/lib/data/courses";
import { LoaderCircle, PlusCircle, Trash2, ArrowLeft, Video, BookText, Link as LinkIcon, CalendarIcon } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";

const ScheduleLessonDialog = ({
    isOpen,
    onOpenChange,
    onSubmit,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (title: string, url: string, scheduleTime: Date) => void;
}) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('09:00'); // Default time

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !url || !date) {
            return;
        }
        const [hours, minutes] = time.split(':').map(Number);
        const scheduleTime = new Date(date);
        scheduleTime.setHours(hours, minutes);
        onSubmit(title, url, scheduleTime);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule a New Lesson</DialogTitle>
                    <DialogDescription>
                        Set the details for your upcoming live class. It will appear in the 'Live' tab for students.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="lesson-title">Lesson Title</Label>
                        <Input id="lesson-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="lesson-url">YouTube Video/Live URL</Label>
                        <Input id="lesson-url" value={url} onChange={(e) => setUrl(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                  />
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Schedule Lesson</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function CourseFlowEditorClient({ initialCourse }: { initialCourse: Course }) {
    const [course, setCourse] = useState(initialCourse);
    const [newSubjectTitle, setNewSubjectTitle] = useState("");
    const [newChapterTitles, setNewChapterTitles] = useState<Record<string, string>>({});
    
    const [isScheduling, setIsScheduling] = useState(false);
    const [schedulingChapter, setSchedulingChapter] = useState<{ subjectId: string; chapterId: string } | null>(null);

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

     const handleScheduleLesson = (title: string, url: string, scheduleTime: Date) => {
        if (!schedulingChapter) return;
        
        const { subjectId, chapterId } = schedulingChapter;
        const scheduleTimestamp = Timestamp.fromDate(scheduleTime);

        startTransition(async () => {
            try {
                const updatedCourse = await addLesson(course.id, subjectId, chapterId, title, url, scheduleTimestamp);
                setCourse(updatedCourse);
                setIsScheduling(false);
                setSchedulingChapter(null);
                toast({ title: "Lesson Scheduled!" });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }
    
    const handleDeleteLesson = (subjectId: string, chapterId: string, lessonId: string) => {
        startTransition(async () => {
            try {
                const updatedCourse = await deleteLesson(course.id, subjectId, chapterId, lessonId);
                setCourse(updatedCourse);
                toast({ title: "Lesson Removed" });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        });
    }

    return (
        <>
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

            <div className="max-w-4xl mx-auto space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                    {(course.subjects || []).map((subject, index) => (
                        <AccordionItem value={`item-${index}`} key={subject.id} className="bg-card rounded-lg border">
                            <div className="flex items-center justify-between p-4 w-full">
                                <AccordionTrigger className="hover:no-underline font-semibold text-lg flex-grow">
                                    <span>{subject.title}</span>
                                </AccordionTrigger>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete "{subject.title}"?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will delete the subject and all its chapters and lessons. This action cannot be undone.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete Subject</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <AccordionContent className="p-4 pt-0 space-y-4">
                               <Accordion type="multiple" className="w-full space-y-3">
                                    {subject.chapters.map(chapter => (
                                        <AccordionItem value={`chapter-${chapter.id}`} key={chapter.id} className="bg-background rounded-md border">
                                            <div className="flex items-center justify-between p-3 w-full">
                                                <AccordionTrigger className="hover:no-underline font-medium text-base flex-grow">
                                                    <span>{chapter.title}</span>
                                                </AccordionTrigger>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Delete "{chapter.title}"?</AlertDialogTitle></AlertDialogHeader>
                                                        <AlertDialogDescription>This will delete the chapter and all its lessons. This cannot be undone.</AlertDialogDescription>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteChapter(subject.id, chapter.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete Chapter</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                            <AccordionContent className="p-3 pt-0">
                                                 <div className="space-y-2 ml-4">
                                                    {chapter.lessons.map(lesson => (
                                                        <div key={lesson.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                                            <div className="flex items-center gap-2">
                                                                <Video className="w-4 h-4 text-muted-foreground"/>
                                                                <p>{lesson.title}</p>
                                                            </div>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(subject.id, chapter.id, lesson.id)}>
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                     <div className="p-4 border-dashed border rounded-md mt-4">
                                                         <Button size="sm" className="w-full" onClick={() => { setIsScheduling(true); setSchedulingChapter({ subjectId: subject.id, chapterId: chapter.id })}} disabled={isPending}>
                                                            <PlusCircle className="w-4 h-4 mr-2" /> Schedule New Lesson
                                                        </Button>
                                                     </div>
                                                 </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>

                                <div className="p-4 border rounded-md bg-background">
                                     <h4 className="font-semibold text-sm mb-2">Add New Chapter</h4>
                                     <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="New chapter title..."
                                            value={newChapterTitles[subject.id] || ""}
                                            onChange={(e) => setNewChapterTitles(prev => ({ ...prev, [subject.id]: e.target.value }))}
                                            disabled={isPending}
                                        />
                                        <Button onClick={() => handleAddChapter(subject.id)} disabled={isPending || !(newChapterTitles[subject.id] || "").trim()}>
                                            <PlusCircle className="w-4 h-4 mr-2" /> Add
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
        <ScheduleLessonDialog
            isOpen={isScheduling}
            onOpenChange={setIsScheduling}
            onSubmit={handleScheduleLesson}
        />
        </>
    );
}
