

"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Send, Radio, Link as LinkIcon, AlertTriangle, Info, Trash2, Pin, PinOff, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CourseAnnouncement, UrlMetadata } from '@/types';
import { listenForCourseAnnouncements, createCourseAnnouncement, deleteCourseAnnouncement, toggleCourseAnnouncementReaction, toggleCourseAnnouncementPin } from '@/lib/data/announcements';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { getUrlMetadata } from '@/app/actions';

const LinkPreview = ({ metadata }: { metadata: UrlMetadata }) => (
    <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="block mt-3 group">
        <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
            {metadata.image && (
                <div className="aspect-video relative overflow-hidden">
                    <Image src={metadata.image} alt={metadata.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
            )}
            <div className="p-3">
                <p className="text-xs text-muted-foreground uppercase">{metadata.siteName}</p>
                <h4 className="font-bold truncate">{metadata.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
            </div>
        </Card>
    </a>
)

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
        
        let metadata: UrlMetadata | null = null;
        if(attachmentUrl) {
            try {
                metadata = await getUrlMetadata(attachmentUrl);
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Invalid URL', description: 'Could not fetch preview for the provided link.' });
                 setIsLoading(false);
                 return;
            }
        }
        
        try {
            const announcementData: Omit<CourseAnnouncement, 'id' | 'createdAt' | 'reactions' | 'isPinned'> = {
                authorId: user.uid,
                authorName: userProfile.displayName || "Faculty",
                authorAvatar: userProfile.photoURL || "",
                content: content.trim(),
                type: announcementType,
                attachment: metadata ? { ...metadata, url: attachmentUrl } : null,
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
            <CardContent className="p-4 md:p-6">
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

const AnnouncementCard = ({ announcement, courseId, isFaculty }: { announcement: CourseAnnouncement; courseId: string; isFaculty: boolean }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const heartReaction = announcement.reactions?.find(r => r.emoji === '❤️');
    const hasUserHearted = heartReaction?.userIds.includes(user?.uid || '');

    const handleDelete = async () => {
        try {
            await deleteCourseAnnouncement(courseId, announcement.id);
            toast({ title: 'Announcement Deleted' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
        }
    }
    
    const handleReaction = async () => {
        if (!user) return;
        try {
            await toggleCourseAnnouncementReaction(courseId, announcement.id, '❤️', user.uid);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Reaction Failed', description: error.message });
        }
    }
    
    const handlePin = async () => {
        try {
            await toggleCourseAnnouncementPin(courseId, announcement.id);
            toast({ title: announcement.isPinned ? 'Announcement Unpinned' : 'Announcement Pinned!' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
        }
    }
    
    return (
        <Card className={cn(
            "relative",
            announcement.type === 'alert' && "border-destructive/50 bg-destructive/5",
            announcement.isPinned && "border-primary/50 bg-primary/5"
        )}>
             {announcement.isPinned && <Pin className="w-4 h-4 text-primary absolute top-3 left-3" />}
            <CardContent className="p-4 md:p-6 relative group">
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                             <div>
                                <p className="font-bold">{announcement.authorName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {announcement.createdAt ? formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                </p>
                             </div>
                             {isFaculty && (
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePin}>
                                        {announcement.isPinned ? <PinOff className="w-4 h-4 text-primary"/> : <Pin className="w-4 h-4"/>}
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete this announcement. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({variant: "destructive"}))}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>
                        {announcement.type === 'alert' && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm font-semibold mt-2">
                                <AlertTriangle className="w-4 h-4" />
                                URGENT ALERT
                            </div>
                        )}
                        <p className="mt-2 whitespace-pre-wrap">{announcement.content}</p>
                        
                        {announcement.attachment && (
                            <LinkPreview metadata={announcement.attachment} />
                        )}

                        <div className="flex items-center gap-4 mt-4">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("rounded-full", hasUserHearted && "border-red-500 bg-red-500/10 text-red-500")}
                                onClick={handleReaction}
                            >
                                <Heart className={cn("w-4 h-4 mr-2", hasUserHearted && "fill-current")}/>
                                {heartReaction?.userIds.length || 0}
                            </Button>
                        </div>
                    </div>
                </div>
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

    const pinnedAnnouncements = announcements.filter(a => a.isPinned);
    const regularAnnouncements = announcements.filter(a => !a.isPinned);


    if (authLoading || dataLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-grow">
                <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
                    {isFaculty && <AnnouncementComposer courseId={courseId} />}

                    {pinnedAnnouncements.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2"><Pin className="w-4 h-4"/> Pinned</h3>
                            {pinnedAnnouncements.map(announcement => (
                                <AnnouncementCard key={announcement.id} announcement={announcement} courseId={courseId} isFaculty={isFaculty} />
                            ))}
                             <hr className="my-6"/>
                        </div>
                    )}

                    {regularAnnouncements.length > 0 ? (
                        regularAnnouncements.map(announcement => (
                             <AnnouncementCard key={announcement.id} announcement={announcement} courseId={courseId} isFaculty={isFaculty} />
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
