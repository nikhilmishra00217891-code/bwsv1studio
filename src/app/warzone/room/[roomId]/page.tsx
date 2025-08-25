
"use client";

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useParams, useRouter } from 'next/navigation';
import type { Room, RoomMember, ChatMessage } from '@/types';
import { listenForRoomUpdates, removeMemberFromRoom, listenForChatMessages, sendChatMessage, deleteRoom, transferHost } from '@/lib/data/rooms';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => onRemove(member.uid)}
                >
                    <XCircle className="w-4 h-4 text-destructive"/>
                </Button>
             )}
        </div>
    )
});
MemberCard.displayName = 'MemberCard';

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
        if (navigator.share) {
            navigator.share({
                title: 'Join my Warzone!',
                text: `Join my quiz battle on BiharWaleSirji! Room ID: ${room.id}`,
                url: window.location.href,
            });
        } else {
            handleCopyRoomId();
            toast({ description: "Share feature not supported, Room ID copied instead." });
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

const WarzoneHostSetup = () => {
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState('10');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleStartBattle = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would update the room state and trigger the quiz for all members.
         toast({
            title: "Quiz Started!",
            description: "This would start the quiz for all members in a real app.",
        });
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
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Select value={grade} onValueChange={setGrade} required>
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
                            <Select value={difficulty} onValueChange={setDifficulty} required>
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
                            <Select value={numQuestions} onValueChange={setNumQuestions} required>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Start Battle for All'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
};

const WaitingForHost = () => (
    <Card className="shadow-lg">
        <CardHeader>
             <CardTitle>Waiting for Host</CardTitle>
             <CardDescription>The host is setting up the quiz. Get ready for battle!</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <LoaderCircle className="w-12 h-12 text-primary animate-spin mx-auto"/>
        </CardContent>
    </Card>
);

const WarzoneUI = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<Room | null>(null);
    const [removedMessage, setRemovedMessage] = useState<string | null>(null);
    const [showHostLeaveDialog, setShowHostLeaveDialog] = useState(false);

    // Multiplayer room listener
    useEffect(() => {
        if (roomId) {
            const unsubscribe = listenForRoomUpdates(roomId, (updatedRoom) => {
                 if (updatedRoom) {
                    setRoom(updatedRoom);
                    if (user && !updatedRoom.members.some(m => m.uid === user.uid)) {
                        setRemovedMessage('You have been removed from the room by the host.');
                    }
                } else {
                    setRemovedMessage('This room no longer exists.');
                }
            });
            return () => unsubscribe();
        }
    }, [roomId, user]);

    const handleAttemptToLeave = async () => {
        if (!user || !room) return;
        
        const isHost = room.hostId === user.uid;
        const hasOtherMembers = room.members.length > 1;

        if (isHost && hasOtherMembers) {
            setShowHostLeaveDialog(true);
        } else {
             handleConfirmLeave();
        }
    };
    
    const handleConfirmLeave = async () => {
        if (!user || !room) return;
        
        const isHost = room.hostId === user.uid;
        const isLastMember = room.members.length === 1 && isHost;
        
        if(isLastMember) {
             await deleteRoom(room.id);
        } else {
            await removeMemberFromRoom(room.id, user.uid);
        }
        router.push('/warzone/lobby');
    };

    const handleHostDeleteRoom = async () => {
        if (room && room.hostId === user?.uid) {
            await deleteRoom(room.id);
            toast({ title: "Room Deleted", description: "The warzone has been disbanded." });
            setShowHostLeaveDialog(false);
            router.push('/warzone/lobby');
        }
    }

    const handleHostTransfer = async (newHostId: string) => {
        if(room && user) {
            await transferHost(room.id, newHostId);
            await removeMemberFromRoom(room.id, user.uid); // Now leave as a normal member
            toast({ title: "Host Transferred & Left Room!", description: "You are no longer the host."});
            setShowHostLeaveDialog(false);
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

    const isHost = room?.hostId === user?.uid;

    if (removedMessage) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><LogOut className="w-6 h-6 text-destructive"/> Battle Ended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{removedMessage}</p>
                        <Button className="mt-4" onClick={() => router.push('/warzone/lobby')}>Back to Lobby</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (!room) {
        return (
             <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Entering Warzone...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-card/50 py-16 md:py-24 animate-fade-in flex flex-col">
            <div className="absolute top-6 left-6 z-50">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">Leave Warzone</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove you from the current battle. Your progress may not be saved.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Stay</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAttemptToLeave}>Leave</AlertDialogAction>
                        </AlertDialogFooter>
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
                        {isHost ? <WarzoneHostSetup /> : <WaitingForHost />}
                        <ChatBox roomId={roomId} />
                    </div>
                    <div className="lg:col-span-1">
                        <MemberListPanel room={room} onRemoveMember={handleRemoveMember}/>
                    </div>
                </div>
            </div>

            <AlertDialog open={showHostLeaveDialog} onOpenChange={setShowHostLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Host Controls</AlertDialogTitle>
                        <AlertDialogDescription>
                            As the host, if you leave, the room will be deleted for everyone. To prevent this, you can make someone else the host before you go.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <Label>Transfer Host Role</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {room.members.filter(m => m.uid !== user?.uid).map(member => (
                                <div key={member.uid} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                    <span className="font-semibold">{member.displayName}</span>
                                    <Button size="sm" variant="outline" onClick={() => handleHostTransfer(member.uid)}>
                                        <Crown className="mr-2 h-4 w-4"/> Make Host
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
                        <Button variant="secondary" onClick={() => setShowHostLeaveDialog(false)} className="w-full sm:w-auto">Cancel</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full sm:w-auto">Leave & Delete Room</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This will permanently delete the warzone for all members. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleHostDeleteRoom} className={cn(buttonVariants({variant: "destructive"}))}>
                                        Yes, delete room
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
