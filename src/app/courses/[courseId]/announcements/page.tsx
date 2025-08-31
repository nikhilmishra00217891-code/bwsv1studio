
"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Send, Radio, Link as LinkIcon, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CourseAnnouncement } from '@/types';
import { listenForCourseAnnouncements, createCourseAnnouncement } from '@/lib/data/announcements';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AnnouncementComposer = ({ courseId }: { courseId: string }) => {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [announcementType, setAnnouncementType] = useState<'standard' | 'alert'>('standard');
    const [attachmentUrl, setAttachmentUrl] = useState('');

    const handlePost = async (e: FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || !userProfile) return;

        setIsLoading(true);
        try {
            const announcementData: Omit<CourseAnnouncement, 'id' | 'createdAt' | 'reactions' | 'isPinned'> = {
                authorId: user.uid,
                authorName: userProfile.displayName || "Faculty",
                authorAvatar: userProfile.photoURL || "",
                content: content.trim(),
                type: announcementType,
                attachments: attachmentUrl ? [{ type: 'link', url: attachmentUrl }] : [],
            };
            await createCourseAnnouncement(courseId, announcementData);
            toast({ title: 'Announcement Posted!' });
            setContent('');
            setAttachmentUrl('');
            setAnnouncementType('standard');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to post', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <CardContent className="p-6">
                <form onSubmit={handlePost} className="space-y-4">
                    <Textarea 
                        placeholder="What's the update for your students?"
                        className="min-h-[120px]"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                             <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Attach a link (optional)"
                                className="pl-9"
                                value={attachmentUrl}
                                onChange={e => setAttachmentUrl(e.target.value)}
                                disabled={isLoading}
                                type="url"
                            />
                        </div>
                        <RadioGroup defaultValue="standard" value={announcementType} onValueChange={(v) => setAnnouncementType(v as any)} className="flex items-center gap-4" disabled={isLoading}>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="standard" id="type-standard" />
                                <Label htmlFor="type-standard" className="flex items-center gap-1.5"><Info className="w-4 h-4"/> Standard</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="alert" id="type-alert" />
                                <Label htmlFor="type-alert" className="flex items-center gap-1.5 text-destructive"><AlertTriangle className="w-4 h-4"/> Alert</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading || !content.trim()}>
                            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Post Announcement'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default function CourseAnnouncementsPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { userProfile, loading: authLoading } = useAuth();
    const [announcements, setAnnouncements] = useState<CourseAnnouncement[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const isFaculty = userProfile?.role === 'faculty';
    
    useEffect(() => {
        if (!courseId) return;

        const unsubscribe = listenForCourseAnnouncements(courseId, (newAnnouncements) => {
            setAnnouncements(newAnnouncements);
            setDataLoading(false);
        });

        return () => unsubscribe();
    }, [courseId]);

    if (authLoading || dataLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold font-headline">Course Announcements</h1>
            </header>
             <ScrollArea className="flex-grow">
                <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
                    {isFaculty && <AnnouncementComposer courseId={courseId} />}

                    {announcements.length > 0 ? (
                        announcements.map(announcement => (
                             <Card key={announcement.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold">{announcement.authorName}</p>
                                                <p className="text-xs text-muted-foreground">{announcement.createdAt ? formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</p>
                                            </div>
                                            <p className="mt-2 whitespace-pre-wrap">{announcement.content}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                         <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No announcements for this course yet.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
