

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, LoaderCircle, MessageSquareHeart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Testimonial } from '@/types';
import { listenForAllTestimonials, toggleTestimonialFeature, deleteTestimonial } from '@/lib/data/testimonials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';


export default function ReviewManagementPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState(0); // 0 means all stars
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = listenForAllTestimonials((data) => {
            setTestimonials(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredTestimonials = useMemo(() => {
        if (filter === 0) {
            return testimonials;
        }
        return testimonials.filter(t => t.rating === filter);
    }, [testimonials, filter]);

    const handleFeatureToggle = async (testimonialId: string, isFeatured: boolean) => {
        try {
            await toggleTestimonialFeature(testimonialId, isFeatured);
            toast({ title: `Review ${isFeatured ? 'featured' : 'unfeatured'}.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    };
    
    const handleDelete = async (testimonialId: string) => {
        try {
            await deleteTestimonial(testimonialId);
            toast({ title: "Review Deleted" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
        }
    };
    
    if (isLoading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const starFilters = [5, 4, 3, 2, 1];

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Review Management</h1>
                <p className="text-muted-foreground">Curate the student testimonials that appear on your homepage.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquareHeart className="w-6 h-6 text-primary"/>
                            <div>
                                <CardTitle>Student Testimonials</CardTitle>
                                <CardDescription>Toggle the switch to feature or unfeature a review on the homepage.</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant={filter === 0 ? 'default' : 'outline'} onClick={() => setFilter(0)}>All</Button>
                             {starFilters.map(star => (
                                <Button key={star} variant={filter === star ? 'default' : 'outline'} size="icon" onClick={() => setFilter(star)}>
                                    {star} <Star className="w-4 h-4 ml-1 fill-current"/>
                                </Button>
                             ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Review</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-center">Feature</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTestimonials.length > 0 ? filteredTestimonials.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={t.userAvatar} />
                                                <AvatarFallback>{t.userName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{t.userName}</p>
                                                <p className="text-xs text-muted-foreground">{t.userGrade}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-accent fill-accent" />
                                            <span className="font-semibold">{t.rating}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="max-w-md truncate">{t.text}</p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {t.createdAt ? formatDistanceToNow(t.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={t.isFeatured}
                                            onCheckedChange={(checked) => handleFeatureToggle(t.id, checked)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the review from "{t.userName}". This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(t.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete Review</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No reviews match the current filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
