
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookText,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  PlayCircle,
  Video,
} from "lucide-react";
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { courseId: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const course = await getCourseById(params.courseId)
 
  if (!course) {
    return {
      title: "Course Not Found",
    }
  }
 
  return {
    title: `${course.title} - BiharWaleSirji`,
    description: course.description,
  }
}

const CourseHero = ({ course }: { course: NonNullable<Awaited<ReturnType<typeof getCourseById>>> }) => (
    <div className="relative bg-card/50 rounded-xl overflow-hidden p-6 md:p-8 border border-primary/20 shadow-lg shadow-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
        <Image 
            src={course.thumbnail}
            alt={course.title}
            layout="fill"
            objectFit="cover"
            className="opacity-20"
        />
        <div className="relative z-20 grid md:grid-cols-3 gap-8 items-end text-foreground">
            <div className="md:col-span-2">
                 <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                 <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight animate-drop-in">{course.title}</h1>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> <span>8 hours total ⏳</span></div>
                <div className="flex items-center gap-2"><BookText className="w-5 h-5 text-primary" /> <span>{course.lessons.length} lessons 📖</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>25% complete ✅</span></div>
            </div>
        </div>
    </div>
)

const CourseMentor = ({ course }: { course: NonNullable<Awaited<ReturnType<typeof getCourseById>>> }) => (
    <div className="bg-card p-6 rounded-lg flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="w-20 h-20 border-4 border-primary">
            <AvatarImage src="https://placehold.co/100x100.png" />
            <AvatarFallback>{course.mentorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow text-center sm:text-left">
            <h3 className="text-xl font-bold font-headline">{course.mentorName}</h3>
            <p className="text-muted-foreground">Your Mentor</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Know Your Mentor</Button>
            <Button variant="outline" size="icon"><Heart /></Button>
        </div>
    </div>
)

const CourseOverview = ({ course }: { course: NonNullable<Awaited<ReturnType<typeof getCourseById>>> }) => (
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
            <div className="bg-card rounded-lg overflow-hidden border">
                <video src="https://placehold.co/1920x1080.mp4" muted autoPlay loop className="w-full aspect-video"></video>
            </div>
             <Button size="lg" className="w-full !h-14 text-lg">
                <PlayCircle className="mr-2 h-6 w-6" /> Enroll Now
            </Button>
        </div>
    </div>
)


const CourseCurriculum = ({ course }: { course: NonNullable<Awaited<ReturnType<typeof getCourseById>>> }) => (
    <div>
        <h3 className="text-2xl font-bold font-headline mb-4">Course Curriculum</h3>
        <Accordion type="multiple" className="w-full space-y-3">
             {course.lessons.map((lesson, index) => (
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
            ))}
        </Accordion>
    </div>
)

export default async function SingleCoursePage({ params }: Props) {
  const course = await getCourseById(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
        <div className="container mx-auto px-6 py-12 md:py-20 space-y-12">
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
    </div>
  );
}

    