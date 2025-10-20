
"use client";

import type { Course, Lesson, Subject, Chapter, LiveChatMessage, UrlMetadata, Poll } from "@/types";
import { Button } from "../ui/button";
import { PlayCircle, FileText, CheckCircle, Video, BookOpen, Heart, ThumbsUp, Info, ChevronRight, BookText, Send, LoaderCircle, Sparkles, Eye, Clock, Edit, Trash2, Link as LinkIcon, XCircle, Paperclip, BarChart3, Plus, TimerIcon, Pin, PinOff, PartyPopper } from 'lucide-react';
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { listenForLiveChatMessages, toggleLessonCompletion, updateLesson, voteOnPoll, closePoll, setCorrectPollAnswer, toggleLiveChatPin } from "@/lib/data/courses";
import { sendLiveChatMessage } from "@/lib/data/courses";
import { useEffect, useRef, useState, FormEvent, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import StudyMaterialEditor from "./StudyMaterialEditor";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { getUrlMetadata } from "@/app/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Timestamp } from "firebase/firestore";


interface CourseContentProps {
    course: Course;
    selectedSubject: Subject | null;
    selectedChapter: Chapter | null;
    selectedLesson: Lesson | null;
    onSubjectSelect: (subject: Subject) => void;
    onChapterSelect: (chapter: Chapter) => void;
    onLessonClick: (lesson: Lesson) => void;
    isFaculty: boolean;
    onSendPoll?: (poll: Poll) => void; // Keep this for potential direct use
}

const CreatePollDialog = ({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSubmit: (poll: Poll) => void }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [duration, setDuration] = useState<number>(0); // 0 for no timer
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuestion('');
            setOptions(['', '']);
            setDuration(0);
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
        if (!question.trim() || options.some(opt => !opt.trim())) {
            return;
        }
        setIsLoading(true);
        const poll: Poll = {
            question,
            options: options.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, voterIds: [] })),
            status: 'open',
            duration: duration,
            endsAt: duration > 0 ? Timestamp.fromDate(new Date(Date.now() + duration * 1000)) : null,
        };
        onSubmit(poll);
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Poll</DialogTitle>
                    <DialogDescription>Ask a question and let the chamber vote.</DialogDescription>
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
                     <div>
                        <Label htmlFor="poll-duration">Timer</Label>
                         <Select onValueChange={(value) => setDuration(Number(value))} defaultValue="0">
                            <SelectTrigger id="poll-duration">
                                <SelectValue placeholder="Set a timer..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">No Timer</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                            </SelectContent>
                        </Select>
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


const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    let videoId: string | null = null;
    
    // Standard and short URLs
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
        videoId = match[1];
    }

    // Handle /live/ URLs
    if (!videoId) {
        const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
        if (liveMatch) {
            videoId = liveMatch[1];
        }
    }
    
    return videoId;
}

const LiveChat = ({ course, subject, chapter, lesson, isFaculty }: { course: Course; subject: Subject; chapter: Chapter; lesson: Lesson; isFaculty: boolean; }) => {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [canSendMessage, setCanSendMessage] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = listenForLiveChatMessages(
            course.id, subject.id, chapter.id, lesson.id,
            setMessages
        );
        return () => unsubscribe();
    }, [course.id, subject.id, chapter.id, lesson.id]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !canSendMessage) return;

        setIsSending(true);
        setCanSendMessage(false);

        try {
            await sendLiveChatMessage(
                course.id, subject.id, chapter.id, lesson.id,
                {
                    senderId: user.uid,
                    senderName: user.displayName || "Student",
                    text: newMessage.trim(),
                    messageType: 'text'
                }
            );
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
            toast({ variant: 'destructive', title: 'Could not send message' });
        } finally {
            setIsSending(false);
            setTimeout(() => setCanSendMessage(true), 10000); // 10-second cooldown
        }
    };
    
    const handleSendPoll = async (poll: Poll) => {
        if (!user || !userProfile) return;

        try {
            await sendLiveChatMessage(
                course.id, subject.id, chapter.id, lesson.id,
                {
                    senderId: user.uid,
                    senderName: userProfile.displayName || "Faculty",
                    messageType: 'poll',
                    poll: poll,
                    isPinned: true, // Auto-pin polls
                }
            );
            setIsCreatePollOpen(false);
            toast({ title: 'Poll created and pinned!' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleVote = async (messageId: string, optionIndex: number) => {
        if (!user) return;
        try {
            await voteOnPoll(course.id, subject.id, chapter.id, lesson.id, messageId, optionIndex, user.uid);
        } catch(error: any) {
             toast({ variant: 'destructive', title: 'Vote Failed', description: error.message });
        }
    }

    const handleSetCorrect = async (messageId: string, optionIndex: number) => {
        if (!isFaculty) return;
        try {
            await setCorrectPollAnswer(course.id, subject.id, chapter.id, lesson.id, messageId, optionIndex);
            toast({ title: "Correct answer set!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to set answer', description: error.message });
        }
    }
    
    const handlePinToggle = async (messageId: string) => {
        if (!isFaculty) return;
        try {
            await toggleLiveChatPin(course.id, subject.id, chapter.id, lesson.id, messageId);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Action failed', description: error.message });
        }
    }
    
    const PollMessage = ({ msg, isPinnedView = false }: { msg: LiveChatMessage, isPinnedView?: boolean }) => {
        const poll = msg.poll;
        const [timeLeft, setTimeLeft] = useState<number | null>(null);

        useEffect(() => {
            if (poll?.status === 'closed' || !poll?.endsAt) {
                setTimeLeft(0);
                return;
            }

            const interval = setInterval(() => {
                const endsAtMs = (poll.endsAt as Timestamp).toMillis();
                const nowMs = Date.now();
                const newTimeLeft = Math.max(0, Math.round((endsAtMs - nowMs) / 1000));
                setTimeLeft(newTimeLeft);

                if (newTimeLeft === 0 && poll.status === 'open') {
                    clearInterval(interval);
                    closePoll(course.id, subject.id, chapter.id, lesson.id, msg.id);
                }
            }, 1000);
            
            return () => clearInterval(interval);
        }, [poll, msg.id]);
        
        if (!poll) return null;
        
        const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.voterIds?.length || 0), 0);
        const userVoteIndex = poll.options.findIndex(opt => opt.voterIds?.includes(user?.uid || ''));
        const isPollOpen = poll.status === 'open' && timeLeft !== 0;

        const didUserVoteCorrectly = userVoteIndex !== -1 && userVoteIndex === poll.correctOptionIndex;

        return (
             <div className="text-sm p-3 my-2 bg-card rounded-lg border relative group">
                 {isFaculty && (
                     <button onClick={() => handlePinToggle(msg.id)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                         {msg.isPinned ? <PinOff className="w-4 h-4"/> : <Pin className="w-4 h-4"/>}
                    </button>
                 )}
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold">{poll.question}</p>
                    {poll.duration && (
                        <Badge variant={isPollOpen ? "default" : "secondary"} className="flex items-center gap-1">
                            <TimerIcon className="w-3 h-3"/>
                            {isPollOpen && timeLeft !== null ? `${timeLeft}s` : "Finished"}
                        </Badge>
                    )}
                </div>
                <div className="space-y-2">
                    {poll.options.map((option, index) => {
                        const voteCount = option.voterIds?.length || 0;
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                        const hasVotedForThis = userVoteIndex === index;
                        const isCorrectAnswer = poll.correctOptionIndex === index;

                        return (
                            <div key={index}>
                                <div
                                    onClick={() => isPollOpen && userVoteIndex === -1 && handleVote(msg.id, index)}
                                    className={cn(
                                        "w-full text-left p-2 rounded-md border-2 relative overflow-hidden transition-all",
                                        (isPollOpen && userVoteIndex === -1) && "cursor-pointer hover:border-primary/50",
                                        hasVotedForThis && "border-primary",
                                        !isPollOpen && isCorrectAnswer && "border-green-500 bg-green-500/10"
                                    )}
                                >
                                    <motion.div
                                        className={cn(
                                            "absolute top-0 left-0 h-full -z-10",
                                            hasVotedForThis && !isPollOpen && !isCorrectAnswer ? "bg-red-500/10" : "bg-primary/10"
                                        )}
                                        initial={{ width: 0 }}
                                        animate={{ width: isPollOpen ? '0%' : `${percentage}%` }}
                                        transition={{ ease: "easeInOut", duration: 0.5 }}
                                    />
                                    <div className="flex justify-between items-center z-10 relative">
                                        <span className={cn("font-semibold", hasVotedForThis && "text-primary")}>{option.text}</span>
                                        {!isPollOpen && <span className="text-xs font-mono">{percentage.toFixed(0)}%</span>}
                                    </div>
                                </div>
                                {isFaculty && !isPollOpen && (
                                     <button 
                                        className={cn("mt-1 text-xs h-7 flex items-center gap-1", isCorrectAnswer ? "text-green-600 font-bold" : "text-muted-foreground hover:text-foreground")}
                                        onClick={(e) => { e.stopPropagation(); handleSetCorrect(msg.id, index); }}
                                    >
                                        {isCorrectAnswer ? <><CheckCircle className="w-3 h-3"/> Correct Answer</> : 'Set as Correct'}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
                 <p className="text-xs text-muted-foreground mt-2 text-right">{totalVotes} vote(s)</p>
                  {!isPollOpen && didUserVoteCorrectly && (
                     <div className="mt-2 text-center text-sm font-semibold text-green-600 bg-green-100 p-2 rounded-md flex items-center justify-center gap-2">
                        <PartyPopper className="w-4 h-4"/> You chose the correct answer!
                    </div>
                )}
            </div>
        )
    }

    const renderMessage = (msg: LiveChatMessage) => {
        if (msg.messageType === 'poll') {
            return <PollMessage key={msg.id} msg={msg} />
        }
        return (
             <div key={msg.id} className="flex items-start gap-2 text-sm relative group">
                <Avatar className="w-6 h-6">
                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-baseline gap-2">
                        <p className="font-bold text-primary/90">{msg.senderName}</p>
                        <p className="text-xs text-muted-foreground">{msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}</p>
                    </div>
                    <p>{msg.text}</p>
                </div>
                {isFaculty && (
                     <button onClick={() => handlePinToggle(msg.id)} className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                         {msg.isPinned ? <PinOff className="w-4 h-4"/> : <Pin className="w-4 h-4"/>}
                    </button>
                 )}
            </div>
        )
    }
    
    const pinnedMessages = messages.filter(m => m.isPinned).sort((a,b) => (b.pinnedAt?.toMillis() || 0) - (a.pinnedAt?.toMillis() || 0));

    return (
        <Card className="mt-8 flex flex-col h-[80vh]">
            <CardContent className="p-0 flex-grow flex flex-col">
                <div className="flex items-center gap-2 border-b p-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Discussion</h3>
                </div>
                 {pinnedMessages.length > 0 && (
                    <div className="p-2 border-b bg-muted/50">
                        {pinnedMessages.map(msg => <PollMessage key={msg.id} msg={msg} isPinnedView />)}
                    </div>
                )}
                <ScrollArea className="flex-grow px-4" ref={scrollAreaRef}>
                    <div className="space-y-4 py-4">
                        {messages.filter(m => !m.isPinned).map(renderMessage)}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t relative">
                        {isFaculty && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button size="icon" variant="ghost" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                        <Paperclip className="w-4 h-4"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-1">
                                    <Button variant="ghost" onClick={() => setIsCreatePollOpen(true)} className="w-full justify-start">
                                        <BarChart3 className="mr-2 h-4 w-4"/> Poll
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        )}
                        <Input 
                            placeholder={canSendMessage ? "Say something..." : "Please wait..."}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            disabled={isSending || !canSendMessage}
                            className={cn(isFaculty && "pl-10")}
                        />
                        <Button type="submit" disabled={isSending || !canSendMessage || !newMessage.trim()}>
                            {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
                        </Button>
                    </form>
                </div>
            </CardContent>
            <CreatePollDialog isOpen={isCreatePollOpen} onOpenChange={setIsCreatePollOpen} onSubmit={handleSendPoll} />
        </Card>
    )
}

const LinkPreview = ({ metadata, onRemove, isFaculty }: { metadata: UrlMetadata, onRemove?: () => void, isFaculty: boolean }) => {
    return (
        <div className="relative group">
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
            {isFaculty && onRemove && (
                 <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={onRemove}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
            )}
        </div>
    )
}


const SubjectGrid = ({ course, onSubjectSelect }: { course: Course, onSubjectSelect: (subject: Subject) => void }) => {
    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{course.title}</h1>
                <p className="text-muted-foreground mt-1">Select a subject to begin your learning journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(course.subjects || []).map(subject => (
                    <button 
                        key={subject.id}
                        onClick={() => onSubjectSelect(subject)}
                        className="text-left w-full"
                    >
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-200 h-full">
                             <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-primary bg-primary/10 shrink-0",
                                    )}>
                                        {subject.title.substring(0, 2)}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">{subject.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={subject.progress || 0} className="w-24 h-1.5" />
                                            <span className="text-xs text-muted-foreground">{subject.progress || 0}%</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </button>
                ))}
            </div>
             <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                <p>Completion % depends on lecture and DPP progress!</p>
            </div>
        </div>
    )
}

const ChapterGrid = ({ course, subject, onChapterSelect }: { course: Course; subject: Subject, onChapterSelect: (chapter: Chapter) => void; }) => {
    const { userProfile } = useAuth();
    const isFaculty = userProfile?.role === 'faculty';

    return (
        <div className="p-4 md:p-8">
             <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{subject.title}</h1>
            </div>
            <Tabs defaultValue="chapters">
                <TabsList>
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="material">Study Material</TabsTrigger>
                </TabsList>
                 <TabsContent value="chapters" className="mt-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(subject.chapters || []).map((chapter, index) => (
                            <button key={chapter.id} onClick={() => onChapterSelect(chapter)} className="text-left">
                                <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-200 h-full p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-500 mb-1">CH - {String(index + 1).padStart(2, '0')}</p>
                                            <h3 className="font-bold text-lg">{chapter.title}</h3>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-muted-foreground shrink-0"/>
                                    </div>
                                     <p className="text-xs text-muted-foreground mt-2">Lecture: {chapter.lessons.length}</p>
                                </Card>
                            </button>
                        ))}
                    </div>
                </TabsContent>
                 <TabsContent value="material" className="mt-6">
                     <StudyMaterialEditor
                        courseId={course.id}
                        subjectId={subject.id}
                        chapters={subject.chapters}
                        isFaculty={isFaculty}
                     />
                </TabsContent>
            </Tabs>
        </div>
    )
}

const LectureView = ({ course, subject, chapter, lesson }: { course: Course; subject: Subject; chapter: Chapter; lesson: Lesson }) => {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const videoId = extractYouTubeVideoId(lesson.content || "");
    const isFaculty = userProfile?.role === 'faculty';
    
    const [notes, setNotes] = useState(lesson.notes || '');
    const [attachment, setAttachment] = useState<UrlMetadata | null>(lesson.notesAttachment || null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isCompleted = useMemo(() => 
        userProfile?.progress?.[course.id]?.completedLessons?.includes(lesson.id) || false,
    [userProfile, course.id, lesson.id]);
    
    useEffect(() => {
        setNotes(lesson.notes || '');
        setAttachment(lesson.notesAttachment || null);
    }, [lesson]);
    
    const handleToggleComplete = async () => {
        if (!user) return;
        try {
            await toggleLessonCompletion(user.uid, course.id, lesson.id);
            toast({
                title: isCompleted ? "Marked as Incomplete" : "Marked as Complete!",
            })
        } catch (error) {
            toast({ variant: 'destructive', title: "Something went wrong" });
        }
    }

    const handleNotesSave = async () => {
        setIsLoading(true);
        try {
            let newAttachment: UrlMetadata | null = attachment;
            const urlRegex = /(https?:\/\/[^\s]+)/;
            const urlMatch = notes.match(urlRegex);

            if (urlMatch && (!attachment || attachment.url !== urlMatch[0])) {
                const metadata = await getUrlMetadata(urlMatch[0]);
                if (metadata) {
                    newAttachment = { ...metadata, url: urlMatch[0] };
                }
            } else if (!urlMatch) {
                newAttachment = null;
            }

            await updateLesson(course.id, subject.id, chapter.id, { 
                ...lesson, 
                notes,
                notesAttachment: newAttachment
            });

            setAttachment(newAttachment);
            setIsEditing(false);
            toast({ title: "Notes Saved!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to save notes.', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteNotes = async () => {
        setIsLoading(true);
         try {
            await updateLesson(course.id, subject.id, chapter.id, { 
                ...lesson, 
                notes: '',
                notesAttachment: null
            });
            setNotes('');
            setAttachment(null);
            setIsEditing(false);
            toast({ title: "Notes Deleted" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to delete notes.' });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="grid lg:grid-cols-3 gap-8 p-4 md:p-8 max-w-full">
            <div className="lg:col-span-2">
                <div className="aspect-video bg-card rounded-lg overflow-hidden border shadow-lg relative">
                    {videoId ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&mute=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen>
                        </iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">No video available for this lesson.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase">{lesson.type}</p>
                        <h2 className="text-2xl md:text-3xl font-bold font-headline mt-1">{lesson.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="icon"><Heart /></Button>
                        <Button variant="outline" size="icon"><ThumbsUp /></Button>
                        <Button size="lg" className="w-full" onClick={handleToggleComplete} variant={isCompleted ? "secondary" : "default"}>
                            <CheckCircle className="mr-2"/> {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </Button>
                    </div>
                </div>

                <Card className="mt-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-headline">Lecture Notes</CardTitle>
                            {isFaculty && !isEditing && (notes || attachment) && (
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete the notes for this lesson.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteNotes}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isFaculty ? (
                            isEditing || (!notes && !attachment) ? (
                                <div className="space-y-4">
                                    <Label htmlFor="lecture-notes">
                                        {isEditing ? "Editing notes..." : "Add notes for this lesson. Paste a link to generate a preview."}
                                    </Label>
                                    <Textarea
                                        id="lecture-notes"
                                        placeholder="Type notes or paste a link here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-24"
                                    />
                                    <div className="flex justify-end gap-2">
                                        {isEditing && <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>}
                                        <Button onClick={handleNotesSave} disabled={isLoading}>
                                            {isLoading ? <LoaderCircle className="animate-spin mr-2"/> : <Send className="mr-2 h-4 w-4" />}
                                            Save Notes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {notes && <p className="whitespace-pre-wrap">{notes}</p>}
                                    {attachment && <LinkPreview metadata={attachment} isFaculty={false} />}
                                </div>
                            )
                        ) : (
                             <div className="prose prose-sm dark:prose-invert max-w-none">
                                {notes && <p className="whitespace-pre-wrap">{notes}</p>}
                                {attachment && <LinkPreview metadata={attachment} isFaculty={false}/>}
                                {(!notes && !attachment) && (
                                    <p className="text-muted-foreground italic">No notes available for this lesson yet.</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <LiveChat course={course} subject={subject} chapter={chapter} lesson={lesson} isFaculty={isFaculty} />
            </div>
        </div>
    )
}

const LessonListView = ({ chapter, onLessonClick, courseId }: { chapter: Chapter, onLessonClick: (lesson: Lesson) => void, courseId: string }) => {
    const { userProfile } = useAuth();
    const liveAndScheduledLessons = chapter.lessons.filter(l => l.status === 'live' || l.status === 'scheduled');
    const recordedLessons = chapter.lessons.filter(l => l.status === 'recorded');

    const completedLessons = useMemo(() => new Set(userProfile?.progress?.[courseId]?.completedLessons || []), [userProfile, courseId]);

    const renderLessonList = (lessons: Lesson[]) => (
        <div className="space-y-3">
            {lessons.map(lesson => (
                <button key={lesson.id} onClick={() => onLessonClick(lesson)} className="w-full text-left">
                    <Card className="hover:bg-muted/80">
                        <CardContent className="p-4 flex items-center gap-4">
                            {completedLessons.has(lesson.id) ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                                <BookText className="w-6 h-6 text-muted-foreground"/>
                            )}
                            <span className={cn("font-semibold", completedLessons.has(lesson.id) && "text-muted-foreground line-through")}>{lesson.title}</span>
                        </CardContent>
                    </Card>
                </button>
            ))}
        </div>
    );

    return (
        <div className="p-4 md:p-8">
             <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">{chapter.title}</h1>
            </div>
             <Tabs defaultValue="recorded">
                <TabsList>
                    <TabsTrigger value="recorded">Recorded ({recordedLessons.length})</TabsTrigger>
                     <TabsTrigger value="live" className="relative">
                        Live & Upcoming ({liveAndScheduledLessons.length})
                        {liveAndScheduledLessons.length > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px] font-bold">
                                    <Eye className="w-2.5 h-2.5"/>
                                </span>
                            </div>
                        )}
                    </TabsTrigger>
                </TabsList>
                 <TabsContent value="recorded" className="mt-6">
                     {recordedLessons.length > 0 ? renderLessonList(recordedLessons) : (
                         <Card className="p-8 text-center text-muted-foreground">No recorded sessions available for this chapter yet.</Card>
                     )}
                 </TabsContent>
                 <TabsContent value="live" className="mt-6">
                    {liveAndScheduledLessons.length > 0 ? (
                        <div className="space-y-3">
                            {liveAndScheduledLessons.map(lesson => (
                                <button key={lesson.id} onClick={() => onLessonClick(lesson)} className="w-full text-left">
                                    <Card className="hover:bg-primary/5 hover:border-primary/40 transition-colors border-2 border-transparent ring-2 ring-red-500/50 shadow-lg shadow-red-500/10">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <Video className="w-6 h-6 text-primary"/>
                                            <div>
                                                <span className="font-semibold">{lesson.title}</span>
                                                {lesson.status === 'scheduled' && lesson.scheduledTime && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(lesson.scheduledTime as any), 'PPP p')}</p>
                                                )}
                                            </div>
                                            <Badge variant="destructive" className="ml-auto animate-pulse">
                                                {lesson.status === 'live' ? 'LIVE' : 'SCHEDULED'}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-8 text-center text-muted-foreground">No sessions are live right now.</Card>
                    )}
                 </TabsContent>
            </Tabs>
        </div>
    )
}

export function CourseContent({ course, selectedSubject, selectedChapter, selectedLesson, onSubjectSelect, onChapterSelect, onLessonClick, isFaculty }: CourseContentProps) {

    if (selectedLesson && selectedSubject && selectedChapter) {
        return <LectureView course={course} subject={selectedSubject} chapter={selectedChapter} lesson={selectedLesson} />;
    }

    if (selectedChapter) {
        return <LessonListView chapter={selectedChapter} onLessonClick={onLessonClick} courseId={course.id} />;
    }

    if (selectedSubject) {
        return <ChapterGrid course={course} subject={selectedSubject} onChapterSelect={onChapterSelect} />;
    }

    return <SubjectGrid course={course} onSubjectSelect={onSubjectSelect} />;
}
