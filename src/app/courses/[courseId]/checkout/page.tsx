
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCourseById, enrollInCourse } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, ArrowLeft, IndianRupee, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    const { toast } = useToast();

    useEffect(() => {
        if (courseId) {
            getCourseById(courseId)
                .then(courseData => {
                    setCourse(courseData);
                })
                .finally(() => setDataLoading(false));
        }
    }, [courseId]);

    const handleEnroll = async () => {
        if (!user) {
            router.push(`/login?redirect=/courses/${courseId}/checkout`);
            return;
        }
        if (!course) return;

        setIsEnrolling(true);
        if (course.price === 0) {
            // Handle free course enrollment
            try {
                await enrollInCourse(user.uid, course.id);
                toast({
                    title: "Enrollment Successful!",
                    description: `You can now access ${course.title}.`,
                });
                router.push(`/courses/${course.id}/learnzone`);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Enrollment Failed",
                    description: error.message || "An unexpected error occurred.",
                });
                setIsEnrolling(false);
            }
        } else {
            // Handle paid course - Placeholder for now
            toast({
                title: "Coming Soon!",
                description: "Payment integration for paid courses is under development.",
            });
            setIsEnrolling(false);
        }
    };
    
    const isLoading = authLoading || dataLoading;

    if (isLoading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!course) {
         return (
             <div className="flex h-screen items-center justify-center">
                <Card className="max-w-md text-center">
                     <CardHeader><CardTitle>Course Not Found</CardTitle></CardHeader>
                     <CardContent>
                        <p>The course you are looking for does not exist.</p>
                        <Button asChild className="mt-4"><Link href="/courses">Explore Courses</Link></Button>
                     </CardContent>
                </Card>
            </div>
        )
    }
    
    const coursePrice = typeof course.price === 'number' ? course.price : 0;
    
    return (
        <div className="bg-card/50 min-h-screen py-20 md:py-28 animate-fade-in">
             <div className="container mx-auto px-6 max-w-2xl">
                 <Button asChild variant="ghost" className="mb-6">
                    <Link href={`/courses/${course.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Course Details
                    </Link>
                </Button>
                <Card className="shadow-xl border-primary/20">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-headline">Complete Your Enrollment</CardTitle>
                        <CardDescription>You're one step away from starting your new course.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/50">
                            <div className="relative w-32 h-20 rounded-md overflow-hidden shrink-0">
                                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="font-bold">{course.title}</h3>
                                <p className="text-sm text-muted-foreground">{course.category} • By {course.mentorName}</p>
                            </div>
                        </Card>
                        
                        <div className="border-t border-b py-6 space-y-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-bold flex items-center gap-1">
                                    <IndianRupee className="w-5 h-5"/>
                                    {coursePrice.toFixed(2)}
                                </span>
                            </div>
                             <div className="flex justify-between items-center text-lg font-bold text-primary">
                                <span>Total to Pay</span>
                                <span className="flex items-center gap-1">
                                     <IndianRupee className="w-5 h-5"/>
                                     {coursePrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Button onClick={handleEnroll} disabled={isEnrolling} size="lg" className="w-full h-12 text-lg">
                            {isEnrolling ? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2"/>
                                    {course.price === 0 ? "Enroll for Free" : "Proceed to Pay"}
                                </>
                            )}
                        </Button>
                         <p className="text-xs text-muted-foreground text-center">
                            By clicking the button, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
