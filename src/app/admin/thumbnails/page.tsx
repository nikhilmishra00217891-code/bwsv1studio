
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getCourses } from '@/lib/data';
import { updateCourse } from '@/lib/data/courses';
import type { Course } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, LoaderCircle, Edit } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const EditThumbnailDialog = ({ course, onUpdate }: { course: Course; onUpdate: (courseId: string, newThumbnail: string) => void }) => {
    const [newUrl, setNewUrl] = useState(course.thumbnail);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!newUrl.trim()) {
            toast({ variant: 'destructive', title: 'URL cannot be empty.' });
            return;
        }
        setIsSaving(true);
        try {
            await updateCourse(course.id, { thumbnail: newUrl });
            onUpdate(course.id, newUrl);
            toast({ title: 'Thumbnail Updated!' });
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> Edit Thumbnail
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Thumbnail for "{course.title}"</DialogTitle>
                    <DialogDescription>Paste a new image URL. Recommended size: 600x400.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative aspect-video w-full rounded-md border bg-muted overflow-hidden">
                        <Image src={newUrl || 'https://placehold.co/600x400.png'} alt="Thumbnail preview" fill className="object-cover" />
                    </div>
                    <div>
                        <Label htmlFor="thumbnail-url">Image URL</Label>
                        <Input
                            id="thumbnail-url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://i.postimg.cc/..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ThumbnailManagementPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(() => {
            getCourses(true).then(data => {
                setCourses(data);
                setLoading(false);
            });
        });
    }, []);

    const handleUpdate = (courseId: string, newThumbnail: string) => {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, thumbnail: newThumbnail } : c));
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Thumbnail Management</h1>
                <p className="text-muted-foreground">Update the display images for all courses.</p>
            </div>

            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map(course => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="p-0">
                                <div className="aspect-video relative rounded-t-lg overflow-hidden">
                                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <h3 className="font-semibold truncate">{course.title}</h3>
                                <p className="text-sm text-muted-foreground">{course.grade}</p>
                                <div className="mt-4">
                                    <EditThumbnailDialog course={course} onUpdate={handleUpdate} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>No courses have been created yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
