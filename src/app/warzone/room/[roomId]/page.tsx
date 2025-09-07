

'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Users,
    Rocket,
    Trophy,
    VenetianMask,
    StarIcon,
    Award,
    Bird,
    FerrisWheel,
    LoaderCircle,
    Copy,
    Share2,
    Send,
    LogOut,
    XCircle,
    Crown,
    AlertTriangle,
    Brain,
    Swords,
    Check,
    X,
    ChevronsRight,
    BookOpen,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    ShieldX,
    Timer,
    Percent,
    Eye,
    UserCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useParams, useRouter } from 'next/navigation';
import type { Room, RoomMember, ChatMessage, Question } from '@/types';
import { listenForRoomUpdates, removeMemberFromRoom, listenForChatMessages, sendChatMessage, deleteRoom, transferHost, updateQuizSettings, startQuiz, submitAnswer, finishQuizForMember, resetRoomForNewQuiz, admitUserToRoom, denyUserFromRoom, joinRoom } from '@/lib/data/rooms';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { GenerateQuizInput } from '@/ai/flows';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const avatarIcons: { [key: string]: React.ElementType } = {
  rocket: Rocket,
  brain: Brain,
  trophy: Trophy,
  ninja: VenetianMask,
  star: StarIcon,
  award: Award,
  eagle: Bird,
  dragon: FerrisWheel,
};

const MemberCard = React.memo(({ member, isHost, currentUserId, onRemove }: { member: RoomMember, isHost: boolean, currentUserId: string, onRemove: (memberId: string) => void }) => {
    const AvatarIcon = avatarIcons[member.avatar] || Brain;
    const canRemove = isHost && member.uid !== currentUserId;

    return (
        <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg group">
            <Avatar>
                <AvatarFallback className="bg-primary/20">
                    <AvatarIcon className="w-5 h-5 text-primary" />
                </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm flex-grow text-left">{member.displayName}</span>
            {member.uid === currentUserId && <span className="text-xs text-muted-foreground">(You)</span>}
            {isHost && member.uid === currentUserId && (
                <div className="ml-auto" title="Room Host">
                    <Crown className="w-4 h-4 text-amber-500" />
                </div>
            )}
             {canRemove && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        >
                            <XCircle className="w-4 h-4 text-destructive"/>
                        </Button>
                    </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Remove {member.displayName}?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>This will remove the member from the warzone.</AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRemove(member.uid)} className={cn(buttonVariants({variant: "destructive"}))}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
        </div>
    )
});
MemberCard.displayName = 'MemberCard';

const JoinRequestsPanel = ({ room, onAdmit, onDeny }: { room: Room, onAdmit: (user: RoomMember) => void, onDeny: (userId: string) => void }) => {
    const { user } = useAuth();
    if (user?.uid !== room.hostId || !room.joinRequests || room.joinRequests.length === 0) {
        return null;
    }

    return (
        <Card className="shadow-lg border-amber-500/50 animate-fade-in">
            <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2"><UserCheck /> Join Requests</CardTitle>
                <CardDescription>A player wants to join your warzone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {room.joinRequests.map(requestingUser => (
                    <div key={requestingUser.uid} className="flex items-center justify-between p-2 rounded-md bg-muted">
                        <p className="font-semibold">{requestingUser.displayName}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onDeny(requestingUser.uid)}>Deny</Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onAdmit(requestingUser)}>Admit</Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

const MemberListPanel = React.memo(({ room, onRemoveMember }: { room: Room | null, onRemoveMember: (memberId: string) => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleCopyRoomId = () => {
        if (!room) return;
        navigator.clipboard.writeText(room.id);
        toast({ title: 'Room ID Copied!' });
    };

    const handleShare = () => {
        if (!room) return;
        const shareUrl = `${window.location.origin}/warzone/room/${room.id}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join my Warzone!',
                text: `Join my quiz battle on BiharWaleSirji! Room ID: ${room.id}`,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Invite Link Copied!", description: "Share feature not supported, invite link copied instead." });
        }
    };
    
    if (!room || !user) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-6 w-32" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }
    
    const isHost = user?.uid === room.hostId;

     return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users/> Member List
                </CardTitle>
                <CardDescription>
                    {room.members.length} member(s) in room.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <Input readOnly value={room.id} className="font-mono text-center bg-muted" />
                    <Button variant="outline" size="icon" onClick={handleCopyRoomId}><Copy className="w-4 h-4"/></Button>
                    <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="w-4 h-4"/></Button>
                </div>
                <ScrollArea className="h-48">
                    <div className="space-y-2 pr-4">
                        {room.members.map(member => (
                            <MemberCard 
                                key={member.uid} 
                                member={member} 
                                isHost={isHost} 
                                currentUserId={user.uid}
                                onRemove={onRemoveMember}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
});
MemberListPanel.displayName = 'MemberListPanel';


const ChatBox = ({ roomId }: { roomId: string }) => {
    const { user, userProfile } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = listenForChatMessages(roomId, setMessages);
        return () => unsubscribe();
    }, [roomId]);

     useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !userProfile) return;

        setIsSending(true);
        try {
            await sendChatMessage(roomId, {
                senderId: user.uid,
                senderName: userProfile.displayName || 'Anonymous',
                text: newMessage.trim(),
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>War Room Chat</CardTitle>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-64 border rounded-md p-4 mb-4" ref={scrollAreaRef}>
                     <div className="space-y-4 pr-2">
                        {messages.length > 0 ? messages.map(msg => (
                            <div key={msg.id} className="text-sm">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-primary/80">{msg.senderId === user?.uid ? "You" : msg.senderName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}
                                    </span>
                                </div>
                                <p className="break-words">{msg.text}</p>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No messages yet. Say hi!</p>
                        )}
                     </div>
                 </ScrollArea>
                 <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                        placeholder="Type a message and press Enter..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        className="h-12"
                    />
                    <Button type="submit" size="lg" disabled={isSending || !newMessage.trim()}>
                        {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
                    </Button>
                 </form>
            </CardContent>
        </Card>
    )
}

const WarzoneHostSetup = ({ roomId, settings }: { roomId: string, settings?: GenerateQuizInput }) => {
    const defaultSettings = {
        topic: '',
        grade: 'Competitive Exams',
        difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
        numberOfQuestions: 10,
    };
    
    const [quizSettings, setQuizSettings] = useState<GenerateQuizInput>(settings || defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        setQuizSettings(settings || defaultSettings);
    }, [settings]);

    useEffect(() => {
        // Debounced update to Firestore
        const handler = setTimeout(() => {
            if (JSON.stringify(quizSettings) !== JSON.stringify(settings)) {
                updateQuizSettings(roomId, quizSettings);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [quizSettings, roomId, settings]);

    const handleSettingChange = (field: keyof GenerateQuizInput, value: string | number) => {
        setQuizSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleStartBattle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await startQuiz(roomId);
            toast({
                title: "Battle Started!",
                description: "The quiz is now live for all members.",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Failed to Start Quiz",
                description: error.message || "An unknown error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="shadow-lg border-primary/30">
            <form onSubmit={handleStartBattle}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Swords/> Setup the Battle</CardTitle>
                    <CardDescription>As the host, you decide the challenge.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., Photosynthesis, Indian History"
                            value={quizSettings.topic}
                            onChange={(e) => handleSettingChange('topic', e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Select value={quizSettings.grade} onValueChange={(v) => handleSettingChange('grade', v)} required>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Competitive Exams'].map(g => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select value={quizSettings.difficulty} onValueChange={(v) => handleSettingChange('difficulty', v)} required>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numQuestions">Questions</Label>
                            <Select value={String(quizSettings.numberOfQuestions)} onValueChange={(v) => handleSettingChange('numberOfQuestions', parseInt(v))} required>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading || !quizSettings.topic}>
                        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Start Battle for All'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
};

const WaitingForHost = ({ settings }: { settings?: GenerateQuizInput }) => (
    <Card className="shadow-lg">
        <CardHeader>
             <CardTitle>Waiting for Host</CardTitle>
             <CardDescription>The host is setting up the quiz. Get ready for battle!</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
            <LoaderCircle className="w-12 h-12 text-primary animate-spin mx-auto"/>
            {settings && settings.topic ? (
                <div className='text-left space-y-2 pt-4 border-t'>
                    <h4 className="font-semibold">Current Settings:</h4>
                    <p className="text-sm text-muted-foreground"><strong>Topic:</strong> {settings.topic}</p>
                    <p className="text-sm text-muted-foreground"><strong>Grade:</strong> {settings.grade}</p>
                    <p className="text-sm text-muted-foreground"><strong>Difficulty:</strong> {settings.difficulty}</p>
                    <p className="text-sm text-muted-foreground"><strong>Questions:</strong> {settings.numberOfQuestions}</p>
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground pt-4 border-t">No topic selected yet.</p>
            )}
        </CardContent>
    </Card>
);

const AnswerReviewDialog = ({ member, quizData }: { member: RoomMember, quizData: NonNullable<Room['quizData']> }) => (
    <DialogContent className="max-w-3xl">
        <DialogHeader>
            <DialogTitle>Answer Sheet: {member.displayName}</DialogTitle>
            <DialogDescription>Reviewing {member.displayName}'s performance.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
             <div className="space-y-4 pr-6">
                {quizData.questions.map((q, index) => {
                    const userAnswer = member.answers?.[index];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="text-base">Q{index+1}: {q.questionText}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {q.options.map((option, i) => {
                                        const isCorrectOption = option === q.correctAnswer;
                                        const isUserChoice = option === userAnswer;
                                        return (
                                            <div key={i} className={cn(
                                                "flex items-center gap-3 p-2 text-sm rounded-md border",
                                                isCorrectOption ? "bg-green-100/50 border-green-400" : "",
                                                isUserChoice && !isCorrectOption ? "bg-red-100/50 border-red-400" : ""
                                            )}>
                                                {isCorrectOption ? <Check className="w-4 h-4 text-green-600" /> : isUserChoice ? <X className="w-4 h-4 text-red-600" /> : <div className="w-4 h-4"/>}
                                                <span>{option}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <Alert className="mt-4">
                                    <BookOpen className="h-4 w-4" />
                                    <AlertTitle>Explanation</AlertTitle>
                                    <AlertDescription>{q.explanation}</AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </ScrollArea>
    </DialogContent>
)


const QuizResults = ({ room }: { room: Room }) => {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isResetting, setIsResetting] = useState(false);

    const sortedMembers = useMemo(() => {
        return [...room.members].sort((a,b) => (b.score ?? 0) - (a.score ?? 0) || (a.timeTaken ?? Infinity) - (b.timeTaken ?? Infinity));
    }, [room.members]);

    const handlePlayAgain = async () => {
        if (room.hostId !== user?.uid) {
            toast({ variant: 'destructive', title: "Only the host can start a new war." });
            return;
        }
        setIsResetting(true);
        try {
            await resetRoomForNewQuiz(room.id);
            // No need to refresh, listener will update the state
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Failed to reset room", description: error.message });
        } finally {
            setIsResetting(false);
        }
    }

    return (
        <div className="bg-card/50 min-h-screen flex items-center justify-center p-4">
             <div className="w-full max-w-4xl mx-auto animate-fade-in">
                <Card className="shadow-2xl border-primary/20">
                    <CardHeader className="text-center">
                        <Trophy className="h-16 w-16 mx-auto text-amber-400 mb-4"/>
                        <CardTitle className="text-4xl font-headline">Battle Report</CardTitle>
                        <CardDescription>The warzone has concluded. Here are the results!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Accuracy</TableHead>
                                    <TableHead className="text-center">Time</TableHead>
                                    <TableHead className="text-right">Answers</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedMembers.map((member, index) => (
                                    <TableRow key={member.uid}>
                                        <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback><Brain className="w-4 h-4"/></AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold">{member.displayName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {member.status === 'finished' ? `${member.score}/${room.quizData?.questions.length}` : <Badge variant="outline">Playing...</Badge>}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {member.status === 'finished' ? `${member.accuracy?.toFixed(0)}%` : '-'}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {member.status === 'finished' ? `${member.timeTaken}s` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {member.status === 'finished' ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                         <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/> View</Button>
                                                    </DialogTrigger>
                                                    {room.quizData && <AnswerReviewDialog member={member} quizData={room.quizData} />}
                                                </Dialog>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled>View</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className="text-center mt-6">
                            <Button size="lg" onClick={handlePlayAgain} disabled={isResetting || user?.uid !== room.hostId}>
                                {isResetting ? <LoaderCircle className="animate-spin" /> : <>Another War ? <ChevronsRight className="ml-2 h-5 w-5" /></>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        </div>
    )
}

const MultiplayerQuizUI = ({ room }: { room: Room }) => {
    const { user } = useAuth();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
    const startTimeRef = useRef<number>(Date.now());
    const { toast } = useToast();
    
    const quizData = room.quizData!;
    const quizParams = room.quizSettings!;
    
    useEffect(() => {
        if (user) {
            const currentUser = room.members.find(m => m.uid === user.uid);
            setUserAnswers(currentUser?.answers || {});
        }
    }, [room.members, user]);

    const handleAnswer = (answer: string) => {
        if (!user) return;
        
        const newAnswers = {...userAnswers, [currentQuestionIndex]: answer};
        setUserAnswers(newAnswers);

        submitAnswer(room.id, user.uid, currentQuestionIndex, answer);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleFinish = async () => {
        if (!user) return;
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        let score = 0;
        quizData.questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                score++;
            }
        });
        const accuracy = (score / quizData.questions.length) * 100;
        
        try {
            await finishQuizForMember(room.id, user.uid, score, accuracy, timeTaken);
        } catch(error) {
            console.error("Failed to finish quiz:", error);
            toast({
                variant: 'destructive',
                title: "Submission Error",
                description: "Could not submit your final score. Please check your connection."
            })
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
    const selectedAnswer = userAnswers[currentQuestionIndex];

    return (
        <div className="bg-card/50 min-h-screen flex items-center justify-center">
            <div className="p-4 md:p-8 w-full max-w-4xl mx-auto animate-fade-in">
                <div className="text-center mb-6">
                    <p className="text-sm font-semibold text-primary">{quizParams.topic} - {quizParams.difficulty}</p>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">{currentQuestion.questionText}</h1>
                </div>
                
                <div className="mb-6">
                    <Progress value={progress} />
                    <p className="text-center text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
                </div>

                 <Card>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        {currentQuestion.options.map((option, index) => {
                             const isSelected = selectedAnswer === option;
                            return (
                                <Button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    className={cn(
                                        "h-auto py-4 text-base justify-start transition-all duration-300 transform-gpu",
                                        isSelected && "ring-2 ring-primary bg-primary/10"
                                    )}
                                    variant="outline"
                                >
                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 border-primary/50",
                                        isSelected && "bg-primary border-primary"
                                    )}>
                                        {isSelected && <Check className="w-4 h-4 text-primary-foreground"/>}
                                    </div>
                                    <span className="text-left">{option}</span>
                                </Button>
                            )
                        })}
                    </CardContent>
                 </Card>
                 <div className="flex justify-between items-center mt-6">
                     <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Previous
                     </Button>
                      {currentQuestionIndex === quizData.questions.length - 1 ? (
                         <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                           Finish Battle <ChevronsRight className="ml-2 h-4 w-4"/>
                         </Button>
                      ) : (
                         <Button onClick={handleNext}>
                            Next <ArrowRight className="ml-2 h-4 w-4"/>
                         </Button>
                      )}
                 </div>
            </div>
        </div>
    )
}

const WarzoneUI = () => {
    const params = useParams();
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<Room | null>(null);
    const [sessionStatus, setSessionStatus] = useState<'loading' | 'pending' | 'active' | 'denied' | 'not_found'>('loading');
    
    useEffect(() => {
        if (!roomId || !user || !userProfile) return;

        const unsubscribe = listenForRoomUpdates(roomId, async (updatedRoom) => {
            if (updatedRoom) {
                const isMember = updatedRoom.members.some(m => m.uid === user.uid);
                const isPending = updatedRoom.joinRequests?.some(m => m.uid === user.uid);
                
                setRoom(updatedRoom);

                if (isMember) {
                    setSessionStatus('active');
                } else if (isPending) {
                    setSessionStatus('pending');
                } else {
                    // Not a member and not pending, so attempt to join.
                    // This handles users joining via a direct link.
                    try {
                        await joinRoom(roomId, {
                            uid: user.uid,
                            displayName: userProfile.displayName || "Anonymous",
                            photoURL: userProfile.photoURL || "",
                            avatar: userProfile.avatar || "brain",
                        });
                        // After joinRoom, the listener will fire again with updated data,
                        // moving the user to 'pending' state.
                    } catch (err: any) {
                        toast({ variant: 'destructive', title: "Failed to join", description: err.message });
                        setSessionStatus('denied');
                    }
                }
            } else {
                setSessionStatus('not_found');
            }
        });
    
        return () => unsubscribe();
    }, [roomId, user, userProfile, toast]);


    const handleConfirmLeave = async () => {
        if (!user || !room) return;
        
        await removeMemberFromRoom(room.id, user.uid);
        router.push('/warzone/lobby');
    };

    const handleHostDeleteRoom = async () => {
        if (room && room.hostId === user?.uid) {
            await deleteRoom(room.id);
            toast({ title: "Room Deleted", description: "The warzone has been disbanded." });
            router.push('/warzone/lobby');
        }
    }

    const handleHostTransfer = async (newHostId: string) => {
        if(room && user) {
            await transferHost(room.id, newHostId);
            await removeMemberFromRoom(room.id, user.uid);
            toast({ title: "Host Transferred & Left Room!", description: "You are no longer the host."});
            router.push('/warzone/lobby');
        }
    }

    const handleRemoveMember = useCallback(async (memberId: string) => {
        if (!roomId) return;
        try {
            await removeMemberFromRoom(roomId, memberId);
             toast({ title: 'Member removed' });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error removing member',
            });
        }
    }, [roomId, toast]);

    const handleAdmit = async (userToAdmit: RoomMember) => {
        if (!room) return;
        try {
            await admitUserToRoom(room.id, userToAdmit);
            toast({ title: `${userToAdmit.displayName} has joined the session!` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Failed to admit user' });
        }
    }
    
    const handleDeny = async (userIdToDeny: string) => {
        if (!room) return;
        try {
            await denyUserFromRoom(room.id, userIdToDeny);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Failed to deny user' });
        }
    }
    
    if (!user || !userProfile || sessionStatus === 'loading') {
         return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Entering Warzone...</p>
            </div>
        );
    }
    
    if (sessionStatus === 'pending') {
         return (
            <div className="flex h-screen items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><LoaderCircle className="animate-spin" /> Request Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your request to join has been sent. Waiting for the host to let you in.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (sessionStatus === 'denied' || sessionStatus === 'not_found' || !room) {
        const message = sessionStatus === 'not_found' ? 'This room does not exist.' : 'You were not admitted to this room.';
         return (
            <div className="flex h-screen items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><AlertTriangle className="text-destructive"/> Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{message}</p>
                        <Button className="mt-4" onClick={() => router.push('/warzone/lobby')}>Back to Lobby</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    const isHost = room?.hostId === user?.uid;
    const currentUser = room?.members.find(m => m.uid === user?.uid);
    const hasOtherMembers = room ? room.members.length > 1 : false;

    if (room.status === 'finished' || currentUser?.status === 'finished') {
        return <QuizResults room={room} />
    }

    if (room.status === 'in-progress' && room.quizData) {
        return <MultiplayerQuizUI room={room} />
    }

    // Lobby view
    return (
        <div className="min-h-screen bg-card/50 py-16 md:py-24 animate-fade-in flex flex-col">
            <div className="absolute top-6 left-6 z-50">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">Leave Warzone</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                       {isHost && hasOtherMembers ? (
                            <>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Host Controls</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are the host. To leave, you must first transfer the host role to another member. Or, you can delete the room for everyone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-4">
                                    <Label>Transfer Host & Leave</Label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {room.members.filter(m => m.uid !== user?.uid).map(member => (
                                            <div key={member.uid} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{member.displayName}</span>
                                                <Button size="sm" variant="outline" onClick={() => handleHostTransfer(member.uid)}>
                                                    <Crown className="mr-2 h-4 w-4"/> Make Host & Leave
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full sm:w-auto">Disband Warzone</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                This will permanently delete the room for all members. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleHostDeleteRoom} className={cn(buttonVariants({variant: "destructive"}))}>
                                                    Yes, Disband
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </AlertDialogFooter>
                            </>
                        ) : (
                             <>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {isHost && !hasOtherMembers ? "Since you are the last one here, the room will be deleted." : "This will remove you from the current battle."}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Stay</AlertDialogCancel>
                                    <AlertDialogAction onClick={isHost ? handleHostDeleteRoom : handleConfirmLeave}>Leave</AlertDialogAction>
                                </AlertDialogFooter>
                            </>
                        )}
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            
            <div className="container mx-auto px-6 flex-grow">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Warzone Lobby</h1>
                    <p className="text-lg text-muted-foreground mt-2">
                         Waiting for the host to start the battle.
                    </p>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <JoinRequestsPanel room={room} onAdmit={handleAdmit} onDeny={handleDeny} />
                        {isHost ? <WarzoneHostSetup roomId={room.id} settings={room.quizSettings} /> : <WaitingForHost settings={room.quizSettings} />}
                        <ChatBox roomId={roomId} />
                    </div>
                    <div className="lg:col-span-1">
                        <MemberListPanel room={room} onRemoveMember={handleRemoveMember}/>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function WarzoneRoomPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <WarzoneUI />
        </Suspense>
    )
}
