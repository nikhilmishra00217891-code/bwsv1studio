import { getEnrolledCourses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquareHeart, Play, LogOut, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - BiharWaleSirji",
    description: "Your personal learning dashboard.",
}

export default async function DashboardPage() {
  // In a real app, you would get the user's ID from the session
  const enrolledCourses = await getEnrolledCourses("mock-user-id");

  return (
    <div className="bg-card/50 min-h-screen">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Welcome back, Chintu!</h1>
            <p className="text-lg text-muted-foreground mt-2">Ready to continue your learning journey?</p>
          </div>
          <Button variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-6">Your Enrolled Courses</h2>
            <div className="space-y-6">
              {enrolledCourses.map(course => (
                <Card key={course.courseId} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 h-48 sm:h-auto relative flex-shrink-0">
                         <Image 
                            src={course.thumbnail} 
                            alt={course.title} 
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={`${course.category} education`}
                         />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-sm text-primary font-semibold mb-1">{course.category}</p>
                      <CardTitle className="text-xl font-headline mb-3">{course.title}</CardTitle>
                      <div className="flex items-center gap-4 mb-4 mt-auto">
                        <Progress value={course.progress} className="w-full h-3" />
                        <span className="text-sm font-semibold text-muted-foreground">{course.progress}%</span>
                      </div>
                      <Button asChild className="w-full sm:w-auto self-start">
                        <Link href={`/courses?course=${course.courseId}`}>
                            <Play className="mr-2 h-4 w-4" /> Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                <Card className="bg-primary text-primary-foreground text-center p-8">
                    <CardHeader>
                        <MessageSquareHeart className="w-16 h-16 mx-auto mb-4 opacity-80" />
                        <CardTitle className="text-2xl font-headline">Stuck on a problem?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6">Our AI Mentor is here to help you, 24x7. Just like an elder brother.</p>
                        <Button variant="secondary" size="lg" className="w-full">
                           Ask AI Mentor <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Discover New Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Expand your knowledge. New courses added regularly.</p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/courses">
                                Browse All Courses
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
