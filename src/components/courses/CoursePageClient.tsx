
'use client';

import type { Course, Subject } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteCourse, enrollInCourse, isUserEnrolled, updateCourse, addSubject, deleteSubject, addChapter, deleteChapter } from "@/lib/data";
import { saveTextContent, getTextContent } from "@/lib/data/content";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription as AlertDialogDescriptionComponent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookText,
  CalendarDays,
  Eye,
  EyeOff,
  Trash2,
  LoaderCircle,
  Pencil,
  Star,
  ShieldCheck,
  Video,
  Newspaper,
  BookCopy,
  MessageSquare,
  PlayCircle,
  Plus
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/common/EditableText";
import { useEditMode } from "@/components/common/EditModeProvider";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { EditableImage } from "../common/EditableImage";
import { Input } from "../ui/input";


export default function CoursePageClient({ initialCourse }: { initialCourse: Course }) {
  const [course, setCourse] = useState(initialCourse);
  const [textContent, setTextContent] = useState<Record<string, string>>({});
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isCurrentUserFaculty, setIsCurrentUserFaculty] = useState(false);
  const [userIsEnrolled, setUserIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { isEditMode, setIsEditMode } = useEditMode();
  const { toast } = useToast();
  const router = useRouter();

  const [newSubject, setNewSubject] = useState('');
  const [newChapters, setNewChapters] = useState<Record<string, string>>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCourse(initialCourse);
    const fetchContent = async () => {
        const content = await getTextContent();
        setTextContent(content);
    }
    fetchContent();
  }, [initialCourse]);

  useEffect(() => {
    if (!user) {
        setUserIsEnrolled(false);
        return;
    }
    const checkEnrollment = async () => {
        const enrolled = await isUserEnrolled(user.uid, course.id);
        setUserIsEnrolled(enrolled);
    }
    checkEnrollment();
    setIsCurrentUserFaculty(userProfile?.role === 'faculty');
  }, [user, userProfile, course.id]);

  const handleActiveToggle = async (isActive: boolean) => {
    await updateCourse(course.id, { isActive });
    setCourse(prev => ({...prev, isActive}));
    toast({ title: `Course is now ${isActive ? 'active' : 'inactive'}` });
  };

  const handleDelete = async () => {
    try {
        await deleteCourse(course.id);
        toast({
            title: "Course Deleted",
            description: "The course has been permanently removed.",
        });
        router.push("/courses");
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "Could not delete the course.",
        });
    }
  }
  
  const handleEnroll = async () => {
      if (!user) {
          router.push('/login');
          return;
      }
      setIsEnrolling(true);
      try {
          await enrollInCourse(user.uid, course.id);
          setUserIsEnrolled(true);
          toast({
              title: "Enrollment Successful!",
              description: `Welcome to ${course.title}.`
          });
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Enrollment Failed",
              description: error.message || "An unexpected error occurred."
          });
      } finally {
          setIsEnrolling(false);
      }
  }

  // --- Course Structure Editing Functions ---
  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    setLoadingState({ ...loadingState, addSubject: true });
    try {
      const updatedCourse = await addSubject(course.id, newSubject.trim());
      setCourse(updatedCourse);
      toast({ title: "Subject Added!", description: `"${newSubject.trim()}" has been added to the course.` });
      setNewSubject('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to add subject', description: error.message });
    } finally {
      setLoadingState({ ...loadingState, addSubject: false });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    setLoadingState({ ...loadingState, [`delete_subject_${subjectId}`]: true });
    try {
        const updatedCourse = await deleteSubject(course.id, subjectId);
        setCourse(updatedCourse);
        toast({ title: 'Subject Deleted' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete subject', description: error.message });
    } finally {
         setLoadingState({ ...loadingState, [`delete_subject_${subjectId}`]: false });
    }
  }

  const handleAddChapter = async (subjectId: string) => {
    const chapterTitle = newChapters[subjectId]?.trim();
    if (!chapterTitle) return;
     setLoadingState({ ...loadingState, [`add_chapter_${subjectId}`]: true });
     try {
        const updatedCourse = await addChapter(course.id, subjectId, chapterTitle);
        setCourse(updatedCourse);
        toast({ title: 'Chapter Added!', description: `"${chapterTitle}" has been added.` });
        setNewChapters({ ...newChapters, [subjectId]: '' });
     } catch(error: any) {
        toast({ variant: 'destructive', title: 'Failed to add chapter', description: error.message });
     } finally {
        setLoadingState({ ...loadingState, [`add_chapter_${subjectId}`]: false });
     }
  }

  const handleDeleteChapter = async (subjectId: string, chapterId: string) => {
    setLoadingState({ ...loadingState, [`delete_chapter_${chapterId}`]: true });
     try {
        const updatedCourse = await deleteChapter(course.id, subjectId, chapterId);
        setCourse(updatedCourse);
        toast({ title: 'Chapter Deleted' });
     } catch(error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete chapter', description: error.message });
     } finally {
        setLoadingState({ ...loadingState, [`delete_chapter_${chapterId}`]: false });
     }
  }
  // --- End Editing Functions ---

  const CourseFacultyControls = () => (
    <Card className="mb-8 border-primary/30">
      <CardHeader>
        <CardTitle>Faculty Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="active-mode"
            checked={course.isActive}
            onCheckedChange={handleActiveToggle}
          />
          <Label htmlFor="active-mode" className="flex items-center gap-2">
            {course.isActive ? (
              <><Eye className="w-4 h-4" /> Active</>
            ) : (
              <><EyeOff className="w-4 h-4" /> Inactive</>
            )}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-mode"
            checked={isEditMode}
            onCheckedChange={setIsEditMode}
          />
          <Label htmlFor="edit-mode" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit Page
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="mr-2 w-4 h-4" /> Delete Course</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogDescriptionComponent>This will permanently delete the course and all its content. This action cannot be undone.</AlertDialogDescriptionComponent>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Delete Course</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
  
  const descriptionItems = [
    { icon: CalendarDays, text: 'Starts 1 Dec 2024 - Ends 09 Apr 2025' },
    { icon: ShieldCheck, text: 'Validity until 31st March 2026' },
    { icon: Video, text: 'Online lectures' },
    { icon: BookText, text: 'DPPs and Test With Solutions' },
    { icon: Star, text: 'Exam guidance at our offline centers' },
  ];

  const totalSubjects = course.subjects?.map(s => s.title).join(', ') || 'N/A';

  if (authLoading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className="bg-muted/30">
        <div className="container mx-auto px-6 py-12 md:py-20">
            {isCurrentUserFaculty && <CourseFacultyControls />}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="description" className="w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <TabsList>
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="subjects">Curriculum</TabsTrigger>
                                <TabsTrigger value="resources">Resources</TabsTrigger>
                                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                            </TabsList>
                            <Button variant="outline" className="mt-4 sm:mt-0"><MessageSquare className="w-4 h-4 mr-2"/> Share Batch</Button>
                        </div>
                        <Card>
                            <CardContent className="p-6">
                                <TabsContent value="description">
                                     <h3 className="text-2xl font-bold font-headline mb-6">This Course Includes</h3>
                                     <div className="space-y-4">
                                        {descriptionItems.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <item.icon className="w-6 h-6 text-primary"/>
                                                </div>
                                                <span className="font-medium text-foreground/80">{item.text}</span>
                                            </div>
                                        ))}
                                         <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <BookCopy className="w-6 h-6 text-primary"/>
                                            </div>
                                            <span className="font-medium text-foreground/80">
                                                <strong className="text-foreground">Subjects:</strong> {totalSubjects}
                                            </span>
                                        </div>
                                     </div>
                                </TabsContent>
                                <TabsContent value="subjects">
                                    <h3 className="text-2xl font-bold font-headline mb-6">Course Curriculum</h3>
                                    <div className="space-y-4">
                                        <Accordion type="multiple" className="w-full space-y-3">
                                            {(course.subjects || []).length > 0 ? (
                                            course.subjects.map((subject) => (
                                            <AccordionItem value={subject.id} key={subject.id} className="bg-muted/50 rounded-lg border-b-0">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold">
                                                    {subject.title}
                                                    {isEditMode && 
                                                        <Button 
                                                            variant="ghost" size="icon" className="h-8 w-8 ml-auto mr-2"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                                                            disabled={loadingState[`delete_subject_${subject.id}`]}
                                                        >
                                                            {loadingState[`delete_subject_${subject.id}`] ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 text-destructive"/>}
                                                        </Button>
                                                    }
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 pt-0">
                                                    {subject.chapters.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {subject.chapters.map(chapter => (
                                                                <div key={chapter.id} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                                                                    <span>{chapter.title}</span>
                                                                    {isEditMode && 
                                                                        <Button 
                                                                            variant="ghost" size="icon" className="h-7 w-7"
                                                                            onClick={() => handleDeleteChapter(subject.id, chapter.id)}
                                                                            disabled={loadingState[`delete_chapter_${chapter.id}`]}
                                                                        >
                                                                            {loadingState[`delete_chapter_${chapter.id}`] ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 text-destructive"/>}
                                                                        </Button>
                                                                    }
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground mb-4">No chapters yet for this subject.</p>
                                                    )}
                                                    {isEditMode && (
                                                        <div className="flex gap-2 pt-4 border-t mt-4">
                                                            <Input
                                                                placeholder="New chapter title..."
                                                                value={newChapters[subject.id] || ''}
                                                                onChange={(e) => setNewChapters({ ...newChapters, [subject.id]: e.target.value })}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddChapter(subject.id) }}
                                                            />
                                                            <Button 
                                                                size="icon" 
                                                                onClick={() => handleAddChapter(subject.id)}
                                                                disabled={loadingState[`add_chapter_${subject.id}`]}
                                                            >
                                                                {loadingState[`add_chapter_${subject.id}`] ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Plus />}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))
                                        ) : (
                                            !isEditMode && (
                                            <Card>
                                                <CardContent className="p-6 text-center text-muted-foreground">
                                                    No lessons have been added to this course yet.
                                                </CardContent>
                                            </Card>
                                            )
                                        )}
                                        </Accordion>

                                        {isEditMode && isCurrentUserFaculty && (
                                        <Card className="mt-6 bg-card/50">
                                            <CardHeader>
                                                <CardTitle className="text-lg">Add New Subject</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="new-subject"
                                                        placeholder="e.g., Classical Mechanics"
                                                        value={newSubject}
                                                        onChange={(e) => setNewSubject(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject() }}
                                                    />
                                                    <Button 
                                                        onClick={handleAddSubject}
                                                        disabled={loadingState.addSubject}
                                                    >
                                                        {loadingState.addSubject ? <LoaderCircle className="animate-spin" /> : 'Add Subject'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        )}
                                    </div>
                                </TabsContent>
                                 <TabsContent value="resources">
                                     <h3 className="text-2xl font-bold font-headline mb-6">Resources</h3>
                                     <p className="text-muted-foreground">Resources for this course will be available here.</p>
                                 </TabsContent>
                                 <TabsContent value="announcements">
                                     <h3 className="text-2xl font-bold font-headline mb-6">Announcements</h3>
                                     <p className="text-muted-foreground">Important announcements for this course will be posted here.</p>
                                 </TabsContent>
                            </CardContent>
                        </Card>
                    </Tabs>
                    <div className="h-64"></div>
                    <div className="h-64"></div>
                    <div className="h-64"></div>
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative">
                                    <EditableImage
                                        contentId={`course_thumb_${course.id}`}
                                        src={course.thumbnail}
                                        alt={course.title}
                                        width={600}
                                        height={400}
                                        className="w-full aspect-video object-cover"
                                        data-ai-hint={`${course.category} learning`}
                                    />
                                    {course.isFree && <Badge className="absolute top-3 right-3 text-sm">NEW</Badge>}
                                </div>
                                <div className="p-6">
                                     <h2 className="text-2xl font-bold font-headline">
                                        <EditableText contentId={`course_title_${course.id}`} defaultValue={course.title} />
                                     </h2>
                                     <p className="text-muted-foreground mt-1">
                                        <EditableText as="input" contentId={`course_category_${course.id}`} defaultValue={course.category} />
                                     </p>
                                     <div className="flex justify-between items-center mt-4 text-sm">
                                         <span>Taught by <strong className="text-primary">
                                            <EditableText as="input" contentId={`course_mentor_${course.id}`} defaultValue={course.mentorName} />
                                         </strong></span>
                                         <Badge variant="outline">Hinglish</Badge>
                                     </div>
                                     {userIsEnrolled ? (
                                        <Button asChild size="lg" className="w-full mt-6 text-lg">
                                            <Link href={`/courses/${course.id}/learnzone`}>Go to Course</Link>
                                        </Button>
                                     ) : (
                                         <Button onClick={handleEnroll} size="lg" className="w-full mt-6 text-lg" disabled={isEnrolling}>
                                            {isEnrolling ? <LoaderCircle className="animate-spin" /> : "Enroll Now"}
                                        </Button>
                                     )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
