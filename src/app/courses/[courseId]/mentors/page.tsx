
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, BookOpen, Bot, Linkedin, Youtube, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function MentorsPage({ params }: { params: { courseId: string } }) {
    const course = await getCourseById(params.courseId);

    if (!course) {
        notFound();
    }
    
    // Now we use the dynamic mentor data from the course object
    const mentors = course.mentors || [];

    return (
        <div className="bg-card/50 min-h-screen py-16 md:py-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <Button asChild variant="ghost" className="mb-8">
                    <Link href={`/courses/${params.courseId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
                    </Link>
                </Button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Meet Your Mentors</h1>
                    <p className="text-lg text-muted-foreground mt-4">The team dedicated to your success for "{course.title}".</p>
                </div>

                <div className="space-y-12">
                    {mentors.length > 0 ? mentors.map((mentor) => (
                        <Card key={mentor.id} className="shadow-lg overflow-hidden grid md:grid-cols-3">
                            <div className="relative w-full h-64 md:h-full">
                                <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" />
                            </div>
                            <div className="md:col-span-2">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div>
                                            <CardTitle className="text-2xl font-headline">{mentor.name}</CardTitle>
                                            <CardDescription className="text-base">{mentor.role}</CardDescription>
                                        </div>
                                        <div className="flex gap-2 mt-2 md:mt-0">
                                            {mentor.socials?.youtube && <Button asChild variant="outline" size="icon"><a href={mentor.socials.youtube} target="_blank" rel="noopener noreferrer"><Youtube className="w-4 h-4 text-red-500"/></a></Button>}
                                            {mentor.socials?.linkedin && <Button asChild variant="outline" size="icon"><a href={mentor.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4"/></a></Button>}
                                            {mentor.socials?.instagram && <Button asChild variant="outline" size="icon"><a href={mentor.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4"/></a></Button>}
                                            {mentor.socials?.facebook && <Button asChild variant="outline" size="icon"><a href={mentor.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="w-4 h-4"/></a></Button>}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{mentor.bio}</p>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            <strong>Subjects:</strong> {mentor.subjects.join(', ')}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Bot className="w-4 h-4 text-primary" />
                                            <strong>Teaching Philosophy:</strong> {mentor.philosophy}
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    )) : (
                         <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <p>No mentors have been assigned to this course yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
