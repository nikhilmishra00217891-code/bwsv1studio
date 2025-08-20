
'use client';

import type { Course } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteCourse, updateCourse, isFaculty as checkIsFaculty } from "@/lib/data";
import { useRouter } from "next/navigation";
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
  LoaderCircle,
  Youtube,
  Save,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEditMode } from "@/components/common/EditModeProvider";

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
        // Fallback for invalid URLs, just in case
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    return null;
}

// A generic, reusable inline editor component
function InlineEditor<T extends HTMLInputElement | HTMLTextAreaElement>({
  value,
  onSave,
  children,
  className,
  as: Component = 'input',
  multiline = false
}: {
  value: string;
  onSave: (newValue: string) => void;
  children: React.ReactNode;
  className?: string;
  as?: 'input' | 'textarea';
  multiline?: boolean;
}) {
  const { isEditMode } = useEditMode();
  const [internalValue, setInternalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<T>(null);
  
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
        if (Component === 'textarea' && multiline) {
             inputRef.current.style.height = 'auto';
             inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }
  }, [isEditing, Component, multiline]);

  const handleSave = () => {
    if (internalValue !== value) {
      onSave(internalValue);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<T>) => {
      if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          handleSave();
      }
      if (e.key === 'Escape') {
          setInternalValue(value);
          setIsEditing(false);
      }
  }

  if (isEditMode) {
    return isEditing ? (
      <Component
        ref={inputRef as any}
        value={internalValue}
        onChange={(e: React.ChangeEvent<T>) => {
            setInternalValue(e.target.value);
             if (Component === 'textarea' && multiline) {
                (e.target as HTMLTextAreaElement).style.height = 'auto';
                (e.target as HTMLTextAreaElement).style.height = `${e.target.scrollHeight}px`;
            }
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
            Component === 'input' ? "w-full bg-primary/10 border-2 border-dashed border-primary/50 focus-visible:ring-primary text-inherit font-inherit leading-inherit tracking-inherit p-1 rounded-md" : "w-full bg-primary/10 border-2 border-dashed border-primary/50 focus-visible:ring-primary text-inherit font-inherit leading-inherit tracking-inherit p-2 resize-none overflow-hidden rounded-md",
            className
        )}
      />
    ) : (
      <div onClick={() => setIsEditing(true)} className={cn("cursor-pointer border-2 border-dashed border-transparent hover:border-primary/50 p-1 rounded-md", className)}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}


export default function CoursePageClient({ initialCourse }: { initialCourse: Course }) {
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
  
  const handleSave = async (field: keyof Course, value: any) => {
    try {
        await updateCourse(course.id, { [field]: value });
        setCourse(prev => ({...prev, [field]: value}));
        toast({
            title: "Course Updated",
            description: `The ${field} has been saved.`
        });
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your changes.",
        })
    }
  }

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
                 <InlineEditor value={course.category} onSave={(val) => handleSave('category', val)}>
                    <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                 </InlineEditor>
                 <InlineEditor value={course.title} onSave={(val) => handleSave('title', val)}>
                    <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight animate-drop-in">{course.title}</h1>
                 </InlineEditor>
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
                  <InlineEditor value={course.mentorName} onSave={(val) => handleSave('mentorName', val)}>
                    <h3 className="text-xl font-bold font-headline">{course.mentorName} & Team</h3>
                  </InlineEditor>
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
  
  const CourseVideo = ({ course }: { course: Course }) => {
    const { isEditMode } = useEditMode();
    const videoId = extractYouTubeVideoId(course.youtubeLink || "");

    if (isEditMode) {
        return (
            <div className="space-y-2">
                <Label htmlFor="youtubeLink">YouTube Video Link</Label>
                <Input 
                    id="youtubeLink"
                    placeholder="Paste a YouTube link here..."
                    defaultValue={course.youtubeLink}
                    onBlur={(e) => handleSave('youtubeLink', e.target.value)}
                />
                 {!videoId && course.youtubeLink && <p className="text-sm text-destructive">Invalid YouTube URL.</p>}
            </div>
        )
    }

    if (!videoId) {
        return (
            <div className="bg-card rounded-lg border aspect-video flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <Youtube className="w-12 h-12 mx-auto mb-2"/>
                    <p>No video has been linked for this course yet.</p>
                     {isCurrentUserFaculty && <p className="text-sm">(Faculty can add a link in Edit Mode)</p>}
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
               <InlineEditor value={course.description} onSave={(val) => handleSave('description', val)} as="textarea" multiline>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
               </InlineEditor>
               <div className="flex flex-wrap gap-2">
                  <Badge>Exam Prep 🔥</Badge>
                  <Badge>Conceptual 🧠</Badge>
                  <Badge>Quick Revision ⚡</Badge>
               </div>
          </div>
          <div className="space-y-4">
              <CourseVideo course={course} />
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

    