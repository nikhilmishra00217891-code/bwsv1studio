

"use client";

import { useState, useEffect, FormEvent, useRef, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParams } from "next/navigation";
import {
  listenForCourseAnnouncements,
  createCourseAnnouncement,
  toggleCourseAnnouncementReaction,
  toggleCourseAnnouncementPin,
  deleteCourseAnnouncement,
  voteOnCoursePoll,
} from "@/lib/data/announcements";
import { getUrlMetadata } from "@/app/actions";
import type { CourseAnnouncement, UrlMetadata, Reaction, Poll, PollOption } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, Send, Pin, MessageSquare, Link as LinkIcon, Trash2, Heart, PinOff, Plus, XCircle, BarChart3, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

const LinkPreview = ({ metadata }: { metadata: UrlMetadata }) => {
    return (
        <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="block mt-3">
            <Card className="flex flex-col sm:flex-row overflow-hidden transition-all duration-200 hover:border-primary/50">
                {metadata.image && (
                     <div className="flex-shrink-0 w-full sm:w-32 h-32 sm:h-auto relative">
                        <Image src={metadata.image} alt={metadata.title || 'Link preview'} fill className="object-cover"/>
                    </div>
                )}
                <div className="p-3 flex flex-col justify-center overflow-hidden flex-grow">
                    <p className="text-xs text-muted-foreground truncate">{metadata.siteName}</p>
                    <p className="font-semibold truncate">{metadata.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
                </div>
            </Card>
        </a>
    )
}

const CreatePollDialog = ({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSubmit: (poll: Poll) => void }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuestion('');
            setOptions(['', '']);
        }
    }, [isOpen]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const poll: Poll = {
            question,
            options: options.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, voterIds: [] })),
        };
        onSubmit(poll);
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Poll</DialogTitle>
                    <DialogDescription>Ask a question and let the course members vote.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="poll-question">Poll Question</Label>
                        <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        required
                                    />
                                    {options.length > 2 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-destructive">
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 5 && (
                            <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                                <Plus className="w-4 h-4 mr-2" /> Add Option
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : "Create Poll"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AnnouncementComposer = ({ courseId }: { courseId: string }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);

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
    
    const handleSendPoll = async (poll: Poll) => {
         if (!user) return;
        
        setIsSubmitting(true);

        try {
            await createCourseAnnouncement(courseId, {
                authorId: user.uid,
                authorName: user.displayName || 'Faculty',
                authorAvatar: user.photoURL || '',
                type: 'poll',
                poll,
            });
            setIsCreatePollOpen(false);
            toast({ title: "Poll Posted!" });
        } catch (error) {
            console.error("Failed to send poll", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
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
                        <div className="flex justify-between items-center">
                            <Button type="button" variant="outline" onClick={() => setIsCreatePollOpen(true)}>
                                <BarChart3 className="mr-2 h-4 w-4"/>
                                Create Poll
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !content.trim()}>
                                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>}
                                Post Announcement
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <CreatePollDialog isOpen={isCreatePollOpen} onOpenChange={setIsCreatePollOpen} onSubmit={handleSendPoll}/>
        </>
    );
};

const PollMessage = ({ announcement, courseId }: { announcement: CourseAnnouncement, courseId: string }) => {
    const poll = announcement.poll;
    const { user } = useAuth();
    const { toast } = useToast();

    const totalVotes = useMemo(() => poll?.options.reduce((acc, opt) => acc + (opt.voterIds?.length || 0), 0) || 0, [poll]);
    const userVoteIndex = useMemo(() => poll?.options.findIndex(opt => opt.voterIds?.includes(user?.uid || '')), [poll, user]);

    const handleVote = async (optionIndex: number) => {
        if (!user || userVoteIndex !== -1) return;
        
        try {
            await voteOnCoursePoll(courseId, announcement.id, optionIndex, user.uid);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Vote Failed', description: error.message });
        }
    };

    if (!poll) return null;

    return (
         <div className="w-full">
            <p className="font-bold mb-4">{poll.question}</p>
            <div className="space-y-3">
                {poll.options.map((option, index) => {
                    const voteCount = option.voterIds?.length || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const hasVotedForThis = userVoteIndex === index;

                    return (
                        <button
                            key={index}
                            onClick={() => handleVote(index)}
                            className={cn(
                                "w-full text-left p-2 rounded-lg border-2 transition-all relative overflow-hidden",
                                userVoteIndex !== -1 ? "cursor-default" : "hover:border-primary/50",
                                hasVotedForThis ? "border-primary bg-primary/10" : "border-border"
                            )}
                            disabled={userVoteIndex !== -1}
                        >
                            <motion.div 
                                className="absolute top-0 left-0 h-full bg-primary/20 -z-10"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ ease: "easeInOut", duration: 0.5 }}
                            />
                            <div className="flex justify-between items-center text-sm z-10 relative">
                                <span className="font-semibold">{option.text}</span>
                                <div className="flex items-center gap-2">
                                    {userVoteIndex !== -1 && <span className="font-mono text-xs">{percentage.toFixed(0)}%</span>}
                                    {hasVotedForThis && <Check className="w-4 h-4 text-primary"/>}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{totalVotes} total votes</p>
        </div>
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
                    <div className="flex-grow overflow-hidden">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <Avatar className="w-8 h-8 border sm:hidden">
                                    <AvatarImage src={announcement.authorAvatar} alt={announcement.authorName} />
                                    <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{announcement.authorName}</p>
                                    <p className="text-xs text-muted-foreground">{announcement.createdAt ? formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</p>
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
                        
                        {announcement.type === 'poll' && announcement.poll ? (
                            <div className="mt-3">
                                <PollMessage announcement={announcement} courseId={courseId} />
                            </div>
                        ) : (
                             <p className="mt-3 whitespace-pre-wrap break-words">{announcement.content}</p>
                        )}
                        
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
