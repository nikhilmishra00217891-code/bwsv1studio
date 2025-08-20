
'use client';

import { getCourseById, updateCourse, deleteCourse, isFaculty as checkIsFaculty } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  BookText,
  CheckCircle2,
  Clock,
  Heart,
  PlayCircle,
  Video,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  LoaderCircle,
} from "lucide-react";
import type { Course } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


// This is the client component that contains all interactive logic.
function CoursePageClient({ initialCourse }: { initialCourse: Course }) {
  const [course, setCourse] = useState(initialCourse);
  const { user, loading: authLoading } = useAuth();
  const [isCurrentUserFaculty, setIsCurrentUserFaculty] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  useEffect(() => {
    const checkFaculty = async () => {
      if (user) {
        const facultyStatus = await checkIsFaculty(user.uid);
        setIsCurrentUserFaculty(facultyStatus);
      } else {
        setIsCurrentUserFaculty(false);
      }
    };
    if (!authLoading) {
      checkFaculty();
    }
  }, [user, authLoading]);

  const handleActiveToggle = async (isActive: boolean) => {
    try {
      await updateCourse(course.id, { isActive });
      setCourse({ ...course, isActive });
      toast({
        title: "Course Updated",
        description: `Course is now ${isActive ? "active" : "inactive"}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not change the course status.",
      });
    }
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
        <div className="flex items-center gap-2">
          <Button variant="outline"><Pencil className="mr-2 w-4 h-4" /> Edit Course</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="mr-2 w-4 h-4" /> Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogDescription>This will permanently delete the course and all its content. This action cannot be undone.</AlertDialogDescription>
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

  const CourseHero = ({ course }: { course: Course }) => (
    <div className="relative bg-card/50 rounded-xl overflow-hidden p-6 md:p-8 border border-primary/20 shadow-lg shadow-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
        <Image 
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover opacity-20"
        />
        <div className="relative z-20 grid md:grid-cols-3 gap-8 items-end text-foreground">
            <div className="md:col-span-2">
                 <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                 <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight animate-drop-in">{course.title}</h1>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> <span>8 hours total</span></div>
                <div className="flex items-center gap-2"><BookText className="w-5 h-5 text-primary" /> <span>{course.lessons.length} lessons</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>25% complete</span></div>
            </div>
        </div>
    </div>
  )

  const CourseMentor = ({ course }: { course: Course }) => (
      <Dialog>
          <div className="bg-card p-6 rounded-lg flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-primary">
                  <AvatarImage src="https://placehold.co/100x100.png" />
                  <AvatarFallback>{course.mentorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-bold font-headline">{course.mentorName} & Team</h3>
                  <p className="text-muted-foreground">Your Mentors</p>
              </div>
              <div className="flex gap-2">
                  <DialogTrigger asChild>
                      <Button variant="outline">Know Your Mentors</Button>
                  </DialogTrigger>
                  <Button variant="outline" size="icon"><Heart /></Button>
              </div>
          </div>
          <DialogContent>
              <DialogHeader className="items-center text-center">
                   <Avatar className="w-24 h-24 border-4 border-primary">
                      <AvatarImage src="https://placehold.co/100x100.png" />
                      <AvatarFallback>{course.mentorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <DialogTitle className="text-2xl font-headline">{course.mentorName} & Team</DialogTitle>
                  <DialogDescription>Your guides, friends, and mentors on this journey.</DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center text-muted-foreground">
                  <p>
                      With over a decade of experience in making complex topics feel like a story, our mentors are here to ensure you not only crack your exams but also fall in love with the subject. We believe in the 'Parivaar' philosophy - teaching with the care of an elder brother.
                  </p>
              </div>
          </DialogContent>
      </Dialog>
  )

  const CourseOverview = ({ course }: { course: Course }) => (
      <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
               <h3 className="text-2xl font-bold font-headline">About This Course</h3>
               <p className="text-muted-foreground leading-relaxed">{course.description}</p>
               <div className="flex flex-wrap gap-2">
                  <Badge>Exam Prep 🔥</Badge>
                  <Badge>Conceptual 🧠</Badge>
                  <Badge>Quick Revision ⚡</Badge>
               </div>
          </div>
          <div className="space-y-4">
              <div className="bg-card rounded-lg overflow-hidden border aspect-video">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen>
                  </iframe>
              </div>
               <Button size="lg" className="w-full !h-14 text-lg">
                  <PlayCircle className="mr-2 h-6 w-6" /> Enroll Now
              </Button>
          </div>
      </div>
  )

  const CourseCurriculum = ({ course }: { course: Course }) => (
      <div>
          <h3 className="text-2xl font-bold font-headline mb-4">Course Curriculum</h3>
          <Accordion type="multiple" className="w-full space-y-3">
               {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <AccordionItem value={`item-${index}`} key={lesson.id} className="bg-card rounded-lg border-b-0">
                      <AccordionTrigger className="p-4 hover:no-underline font-semibold">
                           <div className="flex items-center gap-4">
                              {lesson.type === 'video' ? <Video className="w-5 h-5 text-primary" /> : <BookText className="w-5 h-5 text-primary" />}
                              <span>{lesson.title}</span>
                           </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                          <p className="text-muted-foreground mb-4">Lesson content details would go here. A short description of what this lesson covers.</p>
                          <Button variant="secondary">
                              <PlayCircle className="mr-2 h-4 w-4" /> Go to Lesson
                          </Button>
                      </AccordionContent>
                  </AccordionItem>
              ))
              ) : (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No lessons have been added to this course yet.
                    </CardContent>
                </Card>
              )}
          </Accordion>
      </div>
  )
  
  if (authLoading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 space-y-12">
        {isCurrentUserFaculty && <CourseFacultyControls />}
        <CourseHero course={course} />
        <CourseMentor course={course} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto h-auto">
            <TabsTrigger value="overview" className="py-2.5">Overview</TabsTrigger>
            <TabsTrigger value="curriculum" className="py-2.5">Curriculum</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-8">
            <CourseOverview course={course} />
          </TabsContent>
          <TabsContent value="curriculum" className="mt-8">
            <CourseCurriculum course={course} />
          </TabsContent>
        </Tabs>
    </div>
  );
}

// This is the server component that fetches the data.
export default async function SingleCoursePage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        return notFound();
    }

    return (
        <div className="animate-fade-in">
            <CoursePageClient initialCourse={course} />
        </div>
    );
}
