
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitTestimonial, getUserTestimonial } from '@/lib/data/testimonials';
import type { Testimonial } from '@/types';
import { useRouter } from 'next/navigation';

const StarRating = ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) => {
    return (
        <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button key={starValue} onClick={() => setRating(starValue)}>
                        <Star className={`w-10 h-10 transition-colors ${starValue <= rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} />
                    </button>
                );
            })}
        </div>
    );
}

export default function ReviewsPage() {
    const { user, userProfile, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [existingTestimonial, setExistingTestimonial] = useState<Testimonial | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login?redirect=/reviews');
            return;
        }

        getUserTestimonial(user.uid).then(testimonial => {
            if (testimonial) {
                setExistingTestimonial(testimonial);
                setRating(testimonial.rating);
                setText(testimonial.text);
            }
            setDataLoading(false);
        });

    }, [user, loading, router]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile) return;
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Please provide a rating.' });
            return;
        }
        if (text.trim().length < 20) {
            toast({ variant: 'destructive', title: 'Please write a bit more!', description: 'Your review must be at least 20 characters.' });
            return;
        }
        
        setIsSubmitting(true);
        try {
            const testimonialData: Partial<Testimonial> = {
                userId: user.uid,
                userName: userProfile.displayName || 'Anonymous Student',
                userAvatar: userProfile.avatar,
                userGrade: userProfile.grade || 'N/A',
                rating,
                text,
            };
            
            await submitTestimonial(testimonialData, existingTestimonial?.id);
            
            toast({ title: 'Review Submitted!', description: 'Thank you for your valuable feedback.' });
            router.push('/');

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (loading || dataLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-card/50 py-20 md:py-28 animate-fade-in">
            <div className="container mx-auto max-w-2xl">
                <Card className="shadow-xl border-primary/20">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-headline">Share Your Experience</CardTitle>
                            <CardDescription>Your feedback helps our Parivaar grow. Tell us what you think!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-center block font-semibold text-lg">Your Rating</Label>
                                <StarRating rating={rating} setRating={setRating} />
                            </div>
                             <div className="space-y-4">
                                <Label htmlFor="review-text" className="text-center block font-semibold text-lg">Your Review</Label>
                                <Textarea 
                                    id="review-text"
                                    placeholder="Write about your experience, what you liked, or what could be improved..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="min-h-[180px] text-base"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <LoaderCircle className="animate-spin" /> : (existingTestimonial ? 'Update My Review' : 'Submit My Review')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
