
"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParams } from "next/navigation";
import {
  listenForCourseAnnouncements,
  createCourseAnnouncement,
  toggleCourseAnnouncementReaction,
  toggleCourseAnnouncementPin,
  deleteCourseAnnouncement,
} from "@/lib/data/announcements";
import { getUrlMetadata } from "@/app/actions";
import type { CourseAnnouncement, UrlMetadata, Reaction } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, Send, Pin, MessageSquare, Link as LinkIcon, Trash2, Heart, PinOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";

const LinkPreview = ({ metadata }: { metadata: UrlMetadata }) => {
    return (
        <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="block mt-3">
            <Card className="flex h-28 sm:h-32 overflow-hidden transition-all duration-200 hover:border-primary/50">
                <div className="p-3 flex flex-col justify-center overflow-hidden flex-grow">
                    <p className="text-xs text-muted-foreground truncate">{metadata.siteName}</p>
                    <p className="font-semibold truncate">{metadata.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
                </div>
                {metadata.image && (
                     <div className="flex-shrink-0 w-24 sm:w-32 h-full relative">
                        <Image src={metadata.image} alt={metadata.title || 'Link preview'} fill className="object-cover"/>
                    </div>
                )}
            </Card>
        </a>
    )
}

const AnnouncementComposer = ({ courseId }: { courseId: string }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            let metadata: UrlMetadata | null = null;
            if(attachmentUrl.trim()) {
                metadata = await getUrlMetadata(attachmentUrl.trim());
                 if (!metadata) {
                    toast({
                        variant: "destructive",
                        title: "Invalid URL",
                        description: "Could not fetch preview for the provided link. Please check the URL.",
                    });
                    setIsSubmitting(false);
                    return;
                }
            }
            
            await createCourseAnnouncement(courseId, {
                authorId: user.uid,
                authorName: user.displayName || 'Faculty',
                authorAvatar: user.photoURL || '',
                content: content.trim(),
                type: 'standard',
                attachment: metadata,
            });

            setContent('');
            setAttachmentUrl('');
            toast({ title: "Announcement Posted!" });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Failed to post announcement." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="mb-8">
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea 
                        placeholder="Share something with the course..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className="min-h-24"
                    />
                    <div className="flex items-center gap-2">
                        <LinkIcon className="text-muted-foreground"/>
                         <Input 
                            placeholder="Optional: Attach a link for a rich preview"
                            value={attachmentUrl}
                            onChange={(e) => setAttachmentUrl(e.target.value)}
                            type="url"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || !content.trim()}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>}
                            Post Announcement
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

const AnnouncementCard = ({ announcement, courseId, isFaculty }: { announcement: CourseAnnouncement; courseId: string; isFaculty: boolean }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleReaction = async (emoji: string) => {
        if (!user) return;
        try {
            await toggleCourseAnnouncementReaction(courseId, announcement.id, emoji, user.uid);
        } catch (error) {
            console.error("Failed to react", error);
            toast({ variant: 'destructive', title: 'Could not save reaction.'});
        }
    }
    
    const handlePin = async () => {
        try {
            await toggleCourseAnnouncementPin(courseId, announcement.id);
            toast({ title: announcement.isPinned ? "Unpinned!" : "Pinned!", description: "The announcement pin status has been updated."})
        } catch (error) {
             console.error("Failed to pin", error);
             toast({ variant: 'destructive', title: 'Could not update pin status.'});
        }
    }

    const handleDelete = async () => {
         try {
            await deleteCourseAnnouncement(courseId, announcement.id);
            toast({ title: "Announcement Deleted" });
        } catch (error) {
             console.error("Failed to delete", error);
             toast({ variant: 'destructive', title: 'Could not delete announcement.'});
        }
    }

    const heartReaction = announcement.reactions.find(r => r.emoji === '❤️');
    const hasUserHearted = heartReaction?.userIds.includes(user?.uid || '');

    return (
        <Card className={cn(
            "w-full transition-all duration-300",
            announcement.isPinned && "border-primary/50 shadow-lg"
        )}>
            <CardContent className="p-4 sm:p-6">
                {announcement.isPinned && (
                    <div className="flex items-center gap-2 text-xs text-primary font-semibold mb-3">
                        <Pin className="h-4 w-4"/> PINNED ANNOUNCEMENT
                    </div>
                )}
                <div className="flex items-start gap-4">
                     <Avatar className="w-10 h-10 border hidden sm:flex">
                        <AvatarImage src={announcement.authorAvatar} alt={announcement.authorName} />
                        <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <Avatar className="w-8 h-8 border sm:hidden">
                                    <AvatarImage src={announcement.authorAvatar} alt={announcement.authorName} />
                                    <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{announcement.authorName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true })}</p>
                                </div>
                            </div>
                            {isFaculty && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MessageSquare className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handlePin}>
                                            {announcement.isPinned ? <PinOff className="mr-2 h-4 w-4"/> : <Pin className="mr-2 h-4 w-4"/>}
                                            {announcement.isPinned ? "Unpin" : "Pin"}
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                     <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this announcement. This cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: 'destructive'})}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                        <p className="mt-3 whitespace-pre-wrap">{announcement.content}</p>
                        {announcement.attachment && <LinkPreview metadata={announcement.attachment} />}
                        
                        <div className="mt-4">
                            <Button 
                                variant={hasUserHearted ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => handleReaction('❤️')}
                                className={cn(hasUserHearted && "text-red-500")}
                            >
                                <Heart className={cn("mr-2 h-4 w-4", hasUserHearted && "fill-current")}/> 
                                {heartReaction?.userIds.length || 0}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CourseAnnouncementsPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const params = useParams();
    const courseId = params.courseId as string;
    const [isFaculty, setIsFaculty] = useState(false);
    const [announcements, setAnnouncements] = useState<CourseAnnouncement[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && userProfile) {
            setIsFaculty(userProfile.role === 'faculty');
        }
    }, [authLoading, userProfile]);

    useEffect(() => {
        if (!courseId) return;
        setDataLoading(true);
        const unsubscribe = listenForCourseAnnouncements(courseId, (newAnnouncements) => {
            setAnnouncements(newAnnouncements);
            setDataLoading(false);
        });
        return () => unsubscribe();
    }, [courseId]);

    if (authLoading || dataLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col p-4 md:p-8">
            {isFaculty && <AnnouncementComposer courseId={courseId} />}
            {announcements.length > 0 ? (
                <div className="space-y-6">
                    {announcements.map((announcement) => (
                        <AnnouncementCard key={announcement.id} announcement={announcement} courseId={courseId} isFaculty={isFaculty}/>
                    ))}
                </div>
            ) : (
                <Card className="flex-grow flex items-center justify-center">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p className="font-semibold text-lg">No Announcements Yet</p>
                        <p>This space is quiet for now. Check back later for updates!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
