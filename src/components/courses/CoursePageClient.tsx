
'use client';

import type { Course } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteCourse, enrollInCourse, isUserEnrolled, updateCourse } from "@/lib/data";
import { saveTextContent, getTextContent } from "@/lib/data/content";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
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
  PlayCircle
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
import CourseStructureEditor from "./CourseStructureEditor";


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
  
  const handleSaveCourse = async (data: Partial<Course>) => {
    try {
        const updatedCourse = await updateCourse(course.id, data);
        setCourse(updatedCourse);
        toast({
            title: "Course Updated",
            description: `Your changes have been saved.`
        });
    } catch(error) {
        console.error("Update error:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your changes.",
        })
    }
  }

  const handleActiveToggle = async (isActive: boolean) => {
    handleSaveCourse({isActive});
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
                    <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({variant: "destructive"}))}>Delete Course</AlertDialogAction>
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

  const CourseCurriculum = ({ course }: { course: Course }) => (
      <div>
          <Accordion type="multiple" className="w-full space-y-3">
               {course.subjects && course.subjects.length > 0 ? (
                course.subjects.map((subject, index) => (
                  <AccordionItem value={`item-${index}`} key={subject.id} className="bg-card rounded-lg border-b-0">
                      <AccordionTrigger className="p-4 hover:no-underline font-semibold">
                          {subject.title}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                          <p className="text-muted-foreground mb-4">This subject contains {subject.chapters.length} chapter(s). Go to the learnzone to view lessons.</p>
                          <Button variant="secondary" asChild>
                              <Link href={`/courses/${course.id}/learnzone`}>
                                <PlayCircle className="mr-2 h-4 w-4" /> Go to Subject
                              </Link>
                          </Button>
                      </AccordionContent>
                  </AccordionItem>
              ))
              ) : (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No subjects have been added to this course yet.
                        {isEditMode && " Use the Course Structure Editor below to add subjects."}
                    </CardContent>
                </Card>
              )}
          </Accordion>
      </div>
  );

  const totalSubjects = course.subjects?.map(s => s.title).join(', ') || 'N/A';

  if (authLoading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className="bg-muted/30">
        <div className="container mx-auto px-6 py-12 md:py-20">
            {isCurrentUserFaculty && <CourseFacultyControls />}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="description" className="w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <TabsList>
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="subjects">Subjects</TabsTrigger>
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
                                    <CourseCurriculum course={course} />
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
                    {isEditMode && isCurrentUserFaculty && <CourseStructureEditor course={course} onCourseUpdate={setCourse} />}
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
