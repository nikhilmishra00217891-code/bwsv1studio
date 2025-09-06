
'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useParams, useRouter } from 'next/navigation';
import type { Room, RoomMember, ChatMessage } from '@/types';
import { listenForRoomUpdates, removeMemberFromRoom, listenForChatMessages, sendChatMessage, deleteRoom, transferHost, updateMemberStatusInRoom } from '@/lib/data/rooms';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { FocusZoneTimer } from '@/components/focus/FocusZoneTimer';

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
        const shareUrl = `${window.location.origin}/focus-zone/room/${room.id}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join my Focus Session!',
                text: `Join my study session on BiharWaleSirji! Room ID: ${room.id}`,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Invite Link Copied!", description: "Share feature not supported, invite link copied instead." });
        }
    };
    
    if (!room || !user) {
        return (
             <Card className="w-full max-w-sm">
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
    const sortedMembers = [...room.members].sort((a, b) => (b.focusStats?.totalMinutes || 0) - (a.focusStats?.totalMinutes || 0));


     return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users/> Member List
                </CardTitle>
                <CardDescription>
                    {room.members.length} member(s) in room. Ranked by focus time.
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
                        {sortedMembers.map(member => (
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
                 {isHost && (
                    <Button disabled className="w-full mt-4">Start Synced Session (Coming Soon)</Button>
                )}
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
        // Scroll to bottom when new messages arrive
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
                <CardTitle>Live Chat</CardTitle>
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

const MultiplayerFocusRoom = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<Room | null>(null);
    const [isJoining, setIsJoining] = useState(true);
    const [removedMessage, setRemovedMessage] = useState<string | null>(null);
    const [showExitDialog, setShowExitDialog] = useState(false);
    
    useEffect(() => {
        if (roomId) {
            const unsubscribe = listenForRoomUpdates(roomId, (updatedRoom) => {
                if (updatedRoom) {
                    setRoom(updatedRoom);
                    // If user is now in the member list, stop the joining process
                    if (user && updatedRoom.members.some(m => m.uid === user.uid)) {
                        setIsJoining(false);
                    }
                    // If user was previously in the room but is no longer, they were removed.
                    else if (room && room.members.some(m => m.uid === user.uid) && !updatedRoom.members.some(m => m.uid === user.uid)) {
                        setRemovedMessage('You have been removed from the room by the host.');
                    }
                } else {
                    setRemovedMessage('This room no longer exists.');
                }
            });
            return () => unsubscribe();
        }
    }, [roomId, user, room]);


    const handleConfirmLeave = async () => {
        if (!user || !room) return;
        
        await removeMemberFromRoom(room.id, user.uid);
        router.push('/focus-zone/lobby');
    };

    const handleHostDeleteRoom = async () => {
        if (room && room.hostId === user?.uid) {
            await deleteRoom(room.id);
            toast({ title: "Room Deleted", description: "The focus room has been disbanded." });
            setShowExitDialog(false);
            router.push('/focus-zone/lobby');
        }
    }

    const handleHostTransfer = async (newHostId: string) => {
        if(room && user) {
            await transferHost(room.id, newHostId);
            // After transferring, leave the room.
            await removeMemberFromRoom(room.id, user.uid);
            toast({ title: "Host Transferred & Left Room!", description: "You are no longer the host."});
            setShowExitDialog(false);
            router.push('/focus-zone/lobby');
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
    const hasOtherMembers = room ? room.members.length > 1 : false;

    if (removedMessage) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><LogOut className="w-6 h-6 text-destructive"/> Session Ended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{removedMessage}</p>
                        <Button className="mt-4" onClick={() => router.push('/focus-zone/lobby')}>Back to Lobby</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
     if (isJoining || !room) {
        return (
             <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Joining Room...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-card/50 py-16 md:py-24 animate-fade-in flex flex-col">
            <div className="absolute top-6 left-6 z-50">
                <Button variant="outline" onClick={() => setShowExitDialog(true)}>
                    Leave Room
                </Button>
            </div>
            
            <div className="container mx-auto px-6 flex-grow">
                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <FocusZoneTimer 
                            isMultiplayer={true} 
                            roomId={room.id}
                        />
                    </div>
                     <div className="space-y-6">
                        <MemberListPanel room={room} onRemoveMember={handleRemoveMember}/>
                        <ChatBox roomId={roomId} />
                    </div>
                </div>
            </div>

             <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    {isHost && hasOtherMembers ? (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Host Controls</AlertDialogTitle>
                                <AlertDialogDescription>
                                    As the host, if you leave, the room will be deleted for everyone. To prevent this, you can make someone else the host before you go.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <p className="font-semibold">Transfer Host & Leave</p>
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
                                <Button variant="secondary" onClick={() => setShowExitDialog(false)} className="w-full sm:w-auto">Cancel</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full sm:w-auto">Leave & Delete Room</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            This will permanently delete the room for all members. This action cannot be undone.
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
                        </>
                    ) : (
                         <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {isHost && !hasOtherMembers ? "Since you are the last one here, the room will be deleted." : "You will be removed from the room."}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmLeave}>Confirm Leave</AlertDialogAction>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default function FocusZoneRoomPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Loading Room...</p>
            </div>
        }>
            <MultiplayerFocusRoom />
        </Suspense>
    )
}
