

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCourseById, enrollInCourse } from "@/lib/data/courses";
import { applyCoupon } from "@/lib/data/coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, ArrowLeft, IndianRupee, CheckCircle2, TicketPercent, XCircle, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    const { toast } = useToast();

    const [couponCode, setCouponCode] = useState('');
    const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState('');

    useEffect(() => {
        if (courseId) {
            getCourseById(courseId)
                .then(courseData => {
                    setCourse(courseData);
                })
                .finally(() => setDataLoading(false));
        }
    }, [courseId]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsVerifyingCoupon(true);
        const result = await applyCoupon(courseId, couponCode);
        if (result.success && result.discount) {
            setAppliedDiscount(result.discount);
            setAppliedCoupon(couponCode);
            toast({ title: "Coupon Applied!", description: `${result.discount}% discount has been applied.` });
        } else {
            toast({ variant: 'destructive', title: "Invalid Coupon", description: result.message });
            setCouponCode('');
        }
        setIsVerifyingCoupon(false);
    }
    
    const removeCoupon = () => {
        setAppliedDiscount(0);
        setAppliedCoupon('');
        setCouponCode('');
    }

    const handleEnroll = async () => {
        if (!user) {
            router.push(`/login?redirect=/courses/${courseId}/checkout`);
            return;
        }
        if (!course) return;

        setIsEnrolling(true);
        // In a real app, you would handle payment here if finalPrice > 0
        // For this demo, we'll enroll even for paid courses.

        try {
            await enrollInCourse(user.uid, course.id, appliedCoupon);
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
    const discountAmount = (coursePrice * appliedDiscount) / 100;
    const finalPrice = coursePrice - discountAmount;
    
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
                        
                        <div className="border-t pt-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><TicketPercent className="w-5 h-5 text-primary"/> Apply Coupon</h3>
                            {appliedDiscount > 0 ? (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-100/50 border border-green-300 dark:bg-green-900/20">
                                    <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                                        <Tag className="w-4 h-4"/>
                                        <p>Code <span className="font-mono">{appliedCoupon}</span> applied!</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-700 dark:text-green-300" onClick={removeCoupon}>
                                        <XCircle className="w-4 h-4"/>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input 
                                        placeholder="Enter coupon code..."
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={isVerifyingCoupon}
                                        className="h-11"
                                    />
                                    <Button onClick={handleApplyCoupon} disabled={isVerifyingCoupon || !couponCode.trim()} className="h-11">
                                        {isVerifyingCoupon ? <LoaderCircle className="animate-spin" /> : "Apply"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-b py-6 space-y-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-bold flex items-center gap-1">
                                    <IndianRupee className="w-5 h-5"/>
                                    {coursePrice.toFixed(2)}
                                </span>
                            </div>
                             {appliedDiscount > 0 && (
                                <div className="flex justify-between items-center text-lg text-green-600 dark:text-green-400">
                                    <span className="text-muted-foreground">Discount ({appliedDiscount}%)</span>
                                    <span className="font-bold flex items-center gap-1">
                                        - <IndianRupee className="w-5 h-5"/>
                                        {discountAmount.toFixed(2)}
                                    </span>
                                </div>
                            )}
                             <div className="flex justify-between items-center text-2xl font-bold text-primary">
                                <span>Total to Pay</span>
                                <span className="flex items-center gap-1">
                                     <IndianRupee className="w-6 h-6"/>
                                     {finalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Button onClick={handleEnroll} disabled={isEnrolling} size="lg" className="w-full h-14 text-xl">
                            {isEnrolling ? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2"/>
                                    {finalPrice === 0 ? "Enroll for Free" : "Proceed to Pay"}
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

    