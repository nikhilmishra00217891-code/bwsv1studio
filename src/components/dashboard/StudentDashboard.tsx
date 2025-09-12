
"use client";

import type { UserProfile, EnrolledCourse, UserMission } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquareHeart, Play, LogOut, ArrowRight, Edit, Target, Clock, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import TodaysMissionDashboard from "@/components/dashboard/TodaysMissionDashboard";

const FocusStatsCard = ({ userProfile, isReadOnly }: { userProfile: UserProfile, isReadOnly: boolean }) => {
    const focusStats = userProfile?.focusStats || { totalMinutes: 0, totalSessions: 0 };
    const hours = Math.floor(focusStats.totalMinutes / 60);
    const minutes = focusStats.totalMinutes % 60;
  
    return (
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary"/>
                <CardTitle className="text-xl font-headline">Focus Zone Stats</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Total Focus Time</span>
                <span className="font-bold">{hours}h {minutes}m</span>
            </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Trophy className="w-4 h-4"/> Sessions Completed</span>
                <span className="font-bold">{focusStats.totalSessions}</span>
            </div>
            <Button variant="outline" className="w-full" asChild disabled={isReadOnly}>
                <Link href="/focus-zone">
                    Start a New Session
                </Link>
            </Button>
        </CardContent>
      </Card>
    );
};

export default function StudentDashboard({
    userProfile,
    enrolledCourses,
    todaysMissions,
    isReadOnly,
}: {
    userProfile: UserProfile,
    enrolledCourses: EnrolledCourse[],
    todaysMissions: UserMission[],
    isReadOnly: boolean,
}) {
  
  const handleLogout = async () => {
    await signOut(auth);
  }

  const openAiMentor = () => {
    const aiMentorButton = document.getElementById('ai-mentor');
    if (aiMentorButton) {
        aiMentorButton.click();
    }
  }

  return (
    <div className="bg-card/50 min-h-screen">
      <div className="container mx-auto px-6 py-16 md:py-24 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline">
                {isReadOnly ? `Viewing ${userProfile?.displayName}'s Dashboard` : `Welcome back, ${userProfile?.displayName || 'Chintu'}!`}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                {isReadOnly ? `This is a read-only view of the student's progress and activity.` : `Ready to continue your learning journey?`}
            </p>
          </div>
          {!isReadOnly && (
             <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <TodaysMissionDashboard missions={todaysMissions} isReadOnly={isReadOnly}/>

            <div>
                <h2 className="text-2xl font-bold font-headline mb-6">Enrolled Courses</h2>
                <div className="space-y-6">
                {enrolledCourses.length > 0 ? (
                    enrolledCourses.map(course => (
                    <Card key={course.courseId} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                        <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 h-48 sm:h-auto relative flex-shrink-0">
                            <Image 
                                src={course.thumbnail} 
                                alt={course.title} 
                                layout="fill"
                                objectFit="cover"
                                data-ai-hint={`${course.category} education`}
                                className="transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <p className="text-sm text-primary font-semibold mb-1">{course.category}</p>
                            <CardTitle className="text-xl font-headline mb-3">{course.title}</CardTitle>
                            <div className="flex items-center gap-4 mb-4 mt-auto">
                            <Progress value={course.progress} className="w-full h-3" />
                            <span className="text-sm font-semibold text-muted-foreground">{course.progress}%</span>
                            </div>
                            <Button asChild className="w-full sm:w-auto self-start" disabled={isReadOnly}>
                            <Link href={`/courses/${course.courseId}/learnzone`}>
                                <Play className="mr-2 h-4 w-4" /> Continue Learning
                            </Link>
                            </Button>
                        </div>
                        </div>
                    </Card>
                    ))
                ) : (
                    <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-xl font-headline">No courses yet!</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                            {isReadOnly ? "This student hasn't enrolled in any courses." : "It looks like you haven't enrolled in any courses."}
                        </p>
                        <Button asChild disabled={isReadOnly}>
                        <Link href="/courses">
                            Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                    </CardContent>
                    </Card>
                )}
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                <Card className="bg-primary text-primary-foreground text-center p-8 transition-all duration-300 hover:shadow-xl hover:scale-105">
                    <CardHeader>
                        <MessageSquareHeart className="w-16 h-16 mx-auto mb-4 opacity-80" />
                        <CardTitle className="text-2xl font-headline">Stuck on a problem?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6">Our AI Mentor is here to help you, 24x7. Just like an elder brother.</p>
                        <Button variant="secondary" size="lg" className="w-full" onClick={openAiMentor} disabled={isReadOnly}>
                           Ask AI Mentor <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
                 <FocusStatsCard userProfile={userProfile} isReadOnly={isReadOnly}/>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Discover New Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Expand your knowledge. New courses added regularly.</p>
                        <Button variant="outline" className="w-full" asChild disabled={isReadOnly}>
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
