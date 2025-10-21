

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, LoaderCircle, MessageSquareHeart } from 'lucide-react';
import type { Testimonial } from '@/types';
import { useRouter } from 'next/navigation';
import { listenForAllTestimonials } from '@/lib/data/testimonials';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const ReviewCard = ({ testimonial }: { testimonial: Testimonial }) => {
    return (
        <Card className="h-full flex flex-col">
            <CardContent className="flex flex-col items-center text-center p-6 flex-grow">
                <Avatar className="w-16 h-16 mb-4 border-4 border-primary/20">
                    <AvatarImage src={testimonial.userAvatar} alt={testimonial.userName}/>
                    <AvatarFallback>{testimonial.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-lg">{testimonial.userName}</p>
                <p className="text-sm text-muted-foreground">{testimonial.userGrade}</p>
                <div className="flex text-accent my-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : ''}`} />)}
                </div>
                <blockquote className="text-foreground/80 italic mt-2 flex-grow border-t pt-4">
                    &ldquo;{testimonial.text}&rdquo;
                </blockquote>
                 <p className="text-xs text-muted-foreground mt-4">
                    {testimonial.createdAt ? formatDistanceToNow(testimonial.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                </p>
            </CardContent>
        </Card>
    );
};

export default function ReviewsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [filter, setFilter] = useState(0); // 0 for all

    useEffect(() => {
        setDataLoading(true);
        // We fetch all testimonials and filter on the client side
        const unsubscribe = listenForAllTestimonials((data) => {
            setTestimonials(data);
            setDataLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const { averageRating, filteredTestimonials } = useMemo(() => {
        if (testimonials.length === 0) {
            return { averageRating: 0, filteredTestimonials: [] };
        }
        const totalRating = testimonials.reduce((acc, t) => acc + t.rating, 0);
        const avg = totalRating / testimonials.length;

        const filtered = filter === 0 
            ? testimonials 
            : testimonials.filter(t => t.rating === filter);

        return { averageRating: avg, filteredTestimonials: filtered };
    }, [testimonials, filter]);

    const handleWriteReview = () => {
        if (!user) {
            router.push('/login?redirect=/reviews/form');
        } else {
            router.push('/reviews/form');
        }
    };
    
    const starFilters = [5, 4, 3, 2, 1];

    if (loading || dataLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-card/50 min-h-screen py-16 md:py-24">
            <div className="container mx-auto px-6 max-w-5xl">
                 <div className="text-center mb-12">
                    <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                        <MessageSquareHeart className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Voices of Our Parivaar</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Read what our students have to say about their journey with us.
                    </p>

                    <Card className="max-w-xs mx-auto mt-8">
                        <CardContent className="p-4">
                             <p className="text-sm text-muted-foreground">Overall Rating</p>
                             <div className="flex items-center justify-center gap-2 mt-1">
                                 <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
                                 <Star className="w-7 h-7 text-accent fill-accent" />
                             </div>
                              <p className="text-xs text-muted-foreground mt-1">based on {testimonials.length} reviews</p>
                        </CardContent>
                    </Card>

                    <Button size="lg" className="mt-8" onClick={handleWriteReview}>
                        Write Your Own Review
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    <Button variant={filter === 0 ? 'default' : 'outline'} onClick={() => setFilter(0)}>All Reviews</Button>
                    {starFilters.map(star => (
                        <Button key={star} variant={filter === star ? 'default' : 'outline'} onClick={() => setFilter(star)} className="flex items-center gap-1">
                            {star} <Star className="w-4 h-4" />
                        </Button>
                    ))}
                </div>


                {filteredTestimonials.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTestimonials.map(testimonial => (
                            <ReviewCard key={testimonial.id} testimonial={testimonial} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">No reviews match your filter. Try selecting 'All Reviews'.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
