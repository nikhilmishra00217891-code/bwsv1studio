
'use client';

import type { Course } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteCourse, updateCourse } from "@/lib/data";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  CheckCircle2,
  Clock,
  Heart,
  PlayCircle,
  Eye,
  EyeOff,
  Trash2,
  LoaderCircle,
  Youtube,
  Pencil,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { EditableText } from "@/components/common/EditableText";
import { useEditMode } from "@/components/common/EditModeProvider";
import Link from "next/link";
import { EditableImage } from "../common/EditableImage";

const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                return videoId;
            }
        }
    } catch (e) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    return null;
}

export default function CoursePageClient({ initialCourse }: { initialCourse: Course }) {
  const [course, setCourse] = useState(initialCourse);
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isCurrentUserFaculty, setIsCurrentUserFaculty] = useState(false);
  const { isEditMode, setIsEditMode } = useEditMode();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  useEffect(() => {
    setIsCurrentUserFaculty(userProfile?.role === 'faculty');
  }, [userProfile]);

  const handleSaveCourse = async (data: Partial<Course>) => {
    try {
        await updateCourse(course.id, data);
        setCourse(prev => ({...prev, ...data}));
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

  const totalLessons = useMemo(() => {
    return course.subjects?.reduce((acc, subject) => 
        acc + subject.chapters.reduce((chAcc, chapter) => chAcc + chapter.lessons.length, 0), 
    0) || 0;
  }, [course.subjects]);

  const CourseHero = ({ course }: { course: Course }) => (
    <div className="relative bg-card/50 rounded-xl overflow-hidden p-6 md:p-8 border border-primary/20 shadow-lg shadow-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
        <EditableImage
            contentId={`course_thumb_${course.id}`}
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover opacity-20"
            data-ai-hint="learning online course"
        />
        <div className="relative z-20 grid md:grid-cols-3 gap-8 items-end text-foreground">
            <div className="md:col-span-2">
                 <EditableText as="badge" contentId={`course_category_${course.id}`} defaultValue={course.category} />
                <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight animate-drop-in">
                   <EditableText contentId={`course_title_${course.id}`} defaultValue={course.title} />
                </h1>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> <span>8 hours total</span></div>
                <div className="flex items-center gap-2"><BookText className="w-5 h-5 text-primary" /> <span>{totalLessons} lessons</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>25% complete</span></div>
            </div>
        </div>
    </div>
  )

  const CourseMentor = ({ course }: { course: Course }) => (
      <Dialog>
          <div className="bg-card p-6 rounded-lg flex flex-col sm:flex-row items-center gap-6">
               <div className="relative">
                    <EditableImage contentId={`course_mentor_avatar_${course.id}`} src="https://i.postimg.cc/d1W1VcYF/aman-kumar.png" alt="Mentor Avatar" width={80} height={80} className="rounded-full border-4 border-primary" data-ai-hint="mentor portrait" />
                </div>
              <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-bold font-headline">
                    <EditableText contentId={`course_mentor_${course.id}`} defaultValue={course.mentorName} /> & Team
                  </h3>
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
                   <div className="relative w-24 h-24">
                       <EditableImage contentId={`course_mentor_avatar_${course.id}`} src="https://i.postimg.cc/d1W1VcYF/aman-kumar.png" alt="Mentor Avatar" fill className="rounded-full border-4 border-primary" data-ai-hint="mentor portrait" />
                   </div>
                  <DialogTitle className="text-2xl font-headline"><EditableText contentId={`course_mentor_${course.id}`} defaultValue={course.mentorName} /> & Team</DialogTitle>
                  <DialogDescription>Your guides, friends, and mentors on this journey.</DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center text-muted-foreground">
                   <EditableText multiline contentId={`course_mentor_bio_${course.id}`} defaultValue="With over a decade of experience in making complex topics feel like a story, our mentors are here to ensure you not only crack your exams but also fall in love with the subject. We believe in the 'Parivaar' philosophy - teaching with the care of an elder brother." />
              </div>
          </DialogContent>
      </Dialog>
  )
  
  const CourseVideo = ({ course }: { course: Course }) => {
    const videoId = extractYouTubeVideoId(course.youtubeLink || "");
    
    if(isEditMode) {
      return (
        <div className="space-y-2">
          <Label htmlFor="youtubeLink">YouTube Video Link</Label>
          <Input 
            id="youtubeLink"
            defaultValue={course.youtubeLink} 
            onBlur={(e) => handleSaveCourse({youtubeLink: e.target.value})}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      )
    }
    
    if (!videoId) {
        return (
            <div className="bg-card rounded-lg border aspect-video flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <Youtube className="w-12 h-12 mx-auto mb-2"/>
                    <p>No video has been linked for this course yet.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-lg overflow-hidden border aspect-video">
            <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen>
            </iframe>
        </div>
    )
  }

  const CourseOverview = ({ course }: { course: Course }) => (
      <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
               <h3 className="text-2xl font-bold font-headline">About This Course</h3>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    <EditableText multiline contentId={`course_description_${course.id}`} defaultValue={course.description} />
                </div>
               <div className="flex flex-wrap gap-2">
                  <Badge>Exam Prep 🔥</Badge>
                  <Badge>Conceptual 🧠</Badge>
                  <Badge>Quick Revision ⚡</Badge>
               </div>
          </div>
          <div className="space-y-4">
              <CourseVideo course={course} />
               <Button size="lg" className="w-full !h-14 text-lg" asChild>
                  <Link href={`/courses/${course.id}/learnzone`}>
                    <PlayCircle className="mr-2 h-6 w-6" /> Go to Course
                  </Link>
              </Button>
          </div>
      </div>
  )

  const CourseCurriculum = ({ course }: { course: Course }) => (
      <div>
          <h3 className="text-2xl font-bold font-headline mb-4">Course Flow</h3>
          <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                  No lessons have been added to this course yet.
              </CardContent>
          </Card>
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
          <TabsTrigger value="curriculum" className="py-2.5">Course Flow</TabsTrigger>
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
