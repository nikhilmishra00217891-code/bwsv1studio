
"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Music, 
    SkipForward, 
    SkipBack, 
    ListMusic, 
    UploadCloud,
    Brain,
    Coffee,
    Shuffle,
    Repeat,
    Timer,
    Plus,
    Trash2,
    ArrowLeft,
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
    PartyPopper,
    Eye,
    EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Room, RoomMember, ChatMessage, Task, FocusStats } from '@/types';
import { listenForRoomUpdates, removeMemberFromRoom, listenForChatMessages, sendChatMessage, updateMemberStatusInRoom } from '@/lib/data/rooms';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';


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

// --- IndexedDB Helper Functions ---
const DB_NAME = 'FocusZoneDB';
const STORE_NAME = 'playlistStore';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const addTrackToDB = async (file: File) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({ name: file.name, file });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getPlaylistFromDB = async (): Promise<{ id: any, name: string, file: File }[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore( STORE_NAME );
        const request = store.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
};


const clearPlaylistFromDB = async () => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

const MemberInspectionSheet = ({ member }: { member: RoomMember }) => {
    const AvatarIcon = avatarIcons[member.avatar] || Brain;
    const focusStats = member.focusStats || { totalMinutes: 0, totalSessions: 0 };
    const timerSettings = member.timerSettings || { workMinutes: 25, breakMinutes: 5 };
    const hours = Math.floor(focusStats.totalMinutes / 60);
    const minutes = focusStats.totalMinutes % 60;
    
    return (
        <SheetContent>
            <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-4">
                     <Avatar className="w-16 h-16 border-4 border-primary bg-primary/10">
                        <AvatarFallback className="text-4xl flex items-center justify-center">
                            <AvatarIcon className="w-8 h-8 text-primary" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-2xl font-headline">{member.displayName}</p>
                         <Badge variant={member.currentCycle === 'work' ? 'default' : 'secondary'} className="mt-1">
                            {member.currentCycle === 'work' && <Brain className="w-3 h-3 mr-1"/>}
                            {member.currentCycle === 'break' && <Coffee className="w-3 h-3 mr-1"/>}
                            {member.currentCycle === 'transition' && <PartyPopper className="w-3 h-3 mr-1"/>}
                           <span className="capitalize">{member.currentCycle}</span> 
                        </Badge>
                    </div>
                </SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Live Stats</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Timer Settings</span>
                            <span className="font-semibold">{timerSettings.workMinutes}m / {timerSettings.breakMinutes}m</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Focus Time</span>
                            <span className="font-semibold">{hours}h {minutes}m</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Sessions Completed</span>
                            <span className="font-semibold">{focusStats.totalSessions}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Today's Goals</CardTitle></CardHeader>
                    <CardContent>
                        {member.isTasksPublic && member.tasks && member.tasks.length > 0 ? (
                            <ul className="space-y-2">
                                {member.tasks.map(task => (
                                    <li key={task.id} className={cn("flex items-center gap-2 text-sm", task.completed && "line-through text-muted-foreground")}>
                                        <Checkbox checked={task.completed} disabled className="cursor-default" />
                                        {task.text}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                               {member.isTasksPublic ? "No tasks for this session." : "This member's task list is private."}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SheetContent>
    )
}

const MemberCard = React.memo(({ member, isHost, currentUserId, onRemove }: { member: RoomMember, isHost: boolean, currentUserId: string, onRemove: (memberId: string) => void }) => {
    const AvatarIcon = avatarIcons[member.avatar] || Brain;
    const canRemove = isHost && member.uid !== currentUserId;
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg group">
                <Avatar>
                    <AvatarFallback className="bg-primary/20">
                        <AvatarIcon className="w-5 h-5 text-primary" />
                    </AvatarFallback>
                </Avatar>
                <SheetTrigger asChild>
                    <button className="font-semibold text-sm flex-grow text-left hover:underline">{member.displayName}</button>
                </SheetTrigger>
                {member.uid === currentUserId && <span className="text-xs text-muted-foreground">(You)</span>}
                {isHost && member.uid === currentUserId && (
                    <div className="ml-auto" title="Room Host">
                        <span className="text-xl text-primary">⚡</span>
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
            <MemberInspectionSheet member={member} />
        </Sheet>
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
                title: 'Join my Focus Session!',
                text: `Join my study session on BiharWaleSirji! Room ID: ${room.id}`,
                url: window.location.href,
            });
        } else {
            handleCopyRoomId();
            toast({ description: "Share feature not supported, Room ID copied instead." });
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

const FocusZoneUI = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userProfile, setUserProfile } = useAuth();
    const { toast } = useToast();
    
    const roomId = searchParams.get('roomId');
    const isMultiplayer = !!roomId;

    const [room, setRoom] = useState<Room | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    
    const [mode, setMode] = useState<'work' | 'break' | 'transition'>('work');
    const [lastCompletedMode, setLastCompletedMode] = useState<'work' | 'break' | null>(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [cycles, setCycles] = useState(0);

    const [playlist, setPlaylist] = useState<{ id: any, name: string, file: File }[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoop, setIsLoop] = useState(false);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [isTasksPublic, setIsTasksPublic] = useState(false);
    
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [removedMessage, setRemovedMessage] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Multiplayer room listener
    useEffect(() => {
        if (isMultiplayer && roomId) {
            const unsubscribe = listenForRoomUpdates(roomId, (updatedRoom) => {
                 if (updatedRoom) {
                    setRoom(updatedRoom);
                    // Check if current user is still in the room
                    if (user && !updatedRoom.members.some(m => m.uid === user.uid)) {
                        setRemovedMessage('You have been removed from the room by the host.');
                    }
                } else {
                    // Room was deleted or not found
                    setRemovedMessage('This room no longer exists.');
                }
            });
            return () => unsubscribe();
        }
    }, [isMultiplayer, roomId, user]);

    // Real-time status sync for multiplayer
    useEffect(() => {
        if (isMultiplayer && roomId && user) {
            const statusUpdate: Partial<RoomMember> = {
                currentCycle: mode,
                tasks: isTasksPublic ? tasks : [],
                isTasksPublic: isTasksPublic,
                timerSettings: { workMinutes, breakMinutes },
                focusStats: userProfile?.focusStats || { totalMinutes: 0, totalSessions: 0 }
            };
            updateMemberStatusInRoom(roomId, user.uid, statusUpdate);
        }
    }, [mode, tasks, isTasksPublic, workMinutes, breakMinutes, isMultiplayer, roomId, user, userProfile?.focusStats]);


    useEffect(() => {
        if (!isMounted) return;
        // Load playlist from IndexedDB once on mount
        getPlaylistFromDB().then(tracks => {
            if (tracks.length > 0) {
                setPlaylist(tracks);
                if(currentTrackIndex === null) {
                    setCurrentTrackIndex(0);
                }
            }
        }).catch(err => console.error("Could not load playlist from IndexedDB", err));
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted) return;
        try {
            const savedDuration = localStorage.getItem('focusZoneWorkMinutes');
            if (savedDuration) {
                const parsedDuration = parseInt(savedDuration, 10);
                if(!isNaN(parsedDuration) && parsedDuration > 0) {
                    setWorkMinutes(parsedDuration);
                    if (!isActive) {
                        setTimeLeft(parsedDuration * 60);
                    }
                }
            }
        } catch (error) {
            console.error("Could not load settings from localStorage", error);
        }
    }, [isMounted, isActive]);

    useEffect(() => {
        if (!isMounted) return;
        try {
            localStorage.setItem('focusZoneWorkMinutes', String(workMinutes));
        } catch (error) {
            console.error("Could not save settings to localStorage", error);
        }
    }, [workMinutes, isMounted]);

    useEffect(() => {
        if (!isActive && mode === 'work') {
            setTimeLeft(workMinutes * 60);
        } else if (!isActive && mode === 'break') {
            setTimeLeft(breakMinutes * 60);
        }
        setBreakMinutes(Math.ceil(workMinutes / 5));
    }, [workMinutes, breakMinutes, isActive, mode]);


    const handleSessionEnd = useCallback(() => {
        setIsActive(false);
        setLastCompletedMode(mode);
        setMode('transition');
        
        if (mode === 'work') {
            setCycles(prev => prev + 1);
            if (user && userProfile) {
                const newTotalMinutes = (userProfile.focusStats?.totalMinutes || 0) + workMinutes;
                const newTotalSessions = (userProfile.focusStats?.totalSessions || 0) + 1;
                
                const updatedProfile = {
                    ...userProfile,
                    focusStats: {
                        totalMinutes: newTotalMinutes,
                        totalSessions: newTotalSessions
                    }
                };
                setUserProfile(updatedProfile);
                updateUserProfile(user.uid, {
                    focusStats: {
                        totalMinutes: newTotalMinutes,
                        totalSessions: newTotalSessions
                    }
                }).catch(err => {
                     console.error("Failed to update focus stats", err);
                     setUserProfile(userProfile); // Revert on error
                });
            }
        }
        
        const sessionEndAudio = document.getElementById('session-end-audio') as HTMLAudioElement;
        if(sessionEndAudio) sessionEndAudio.play().catch(e => console.log("Chime blocked"));
        
    }, [mode, user, userProfile, workMinutes, setUserProfile]);

    // This effect runs the timer countdown
    useEffect(() => {
        if (!isActive || mode === 'transition') return;

        if (timeLeft <= 0) {
            handleSessionEnd();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, handleSessionEnd, mode]);

    // This effect handles the transition state
    useEffect(() => {
        if (mode === 'transition') {
            const transitionTimer = setTimeout(() => {
                const newMode = lastCompletedMode === 'work' ? 'break' : 'work';
                setMode(newMode);
                setTimeLeft((newMode === 'work' ? workMinutes : breakMinutes) * 60);
                setIsActive(true); // Automatically start the next session
                toast({
                    title: `Time for a ${newMode === 'work' ? 'Work Session' : 'Break'}!`,
                    description: newMode === 'work' ? "Let's get back to it." : "Time to relax and recharge.",
                });
            }, 3000); // 3-second transition

            return () => clearTimeout(transitionTimer);
        }
    }, [mode, lastCompletedMode, workMinutes, breakMinutes, toast]);

    const handleWorkMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseInt(e.target.value, 10);
        if (isNaN(minutes) || minutes < 1) {
            setWorkMinutes(1);
        } else {
            setWorkMinutes(minutes);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeLeft(workMinutes * 60);
        setCycles(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    const progress = timeLeft > 0 ? (timeLeft / ((mode === 'work' ? workMinutes : breakMinutes) * 60)) * 100 : 0;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const currentPlaylist = await getPlaylistFromDB();
            const newFiles = Array.from(event.target.files);
            const audioFiles = newFiles.filter(file => file.type.startsWith('audio/'));
            
            const availableSlots = 10 - currentPlaylist.length;
            if (audioFiles.length > availableSlots) {
                toast({
                    variant: "destructive",
                    title: "Playlist Limit Exceeded",
                    description: `You can only add ${availableSlots} more songs. Please select fewer files.`,
                });
                if(fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            for (const file of audioFiles) {
                await addTrackToDB(file);
            }
            
            const updatedPlaylist = await getPlaylistFromDB();
            setPlaylist(updatedPlaylist);

            if (currentTrackIndex === null && updatedPlaylist.length > 0) {
                setCurrentTrackIndex(0);
            }

            toast({
                title: "Music updated!",
                description: `${audioFiles.length} new song(s) added to your cosmos.`,
            });
            
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    
    const playMusic = useCallback((index: number) => {
        if (index >= 0 && index < playlist.length && audioRef.current) {
            setCurrentTrackIndex(index);
            const trackUrl = URL.createObjectURL(playlist[index].file);
            audioRef.current.src = trackUrl;
            audioRef.current.play().then(() => {
                setIsPlayingMusic(true);
            }).catch(e => console.error("Playback failed", e));
        }
    }, [playlist]);
    
    const toggleMusicPlay = () => {
        if (!audioRef.current) return;
        if (isPlayingMusic) {
            audioRef.current.pause();
            setIsPlayingMusic(false);
        } else {
            if (currentTrackIndex !== null) {
                audioRef.current.play().then(() => setIsPlayingMusic(true));
            } else if (playlist.length > 0) {
                 playMusic(0);
            }
        }
    };
    
    const playNextTrack = useCallback(() => {
        if (isLoop && currentTrackIndex !== null) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        if (currentTrackIndex !== null && playlist.length > 0) {
            if(isShuffle) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * playlist.length);
                } while (playlist.length > 1 && randomIndex === currentTrackIndex);
                playMusic(randomIndex);
            } else {
                const nextIndex = (currentTrackIndex + 1) % playlist.length;
                playMusic(nextIndex);
            }
        }
    }, [currentTrackIndex, playlist, playMusic, isShuffle, isLoop]);
    
    const playPrevTrack = useCallback(() => {
         if (currentTrackIndex !== null && playlist.length > 0) {
            const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            playMusic(prevIndex);
        }
    }, [currentTrackIndex, playlist.length, playMusic]);

    const toggleTask = useCallback((taskId: number) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(newTask.trim() === '') return;
        setTasks(prev => [...prev, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    }

    const clearCompletedTasks = () => {
        setTasks(tasks.filter(task => !task.completed));
    }
    
    const handleBackNavigation = () => {
        if (isActive) {
            setShowExitConfirm(true);
        } else if (isMultiplayer) {
            router.push('/focus-zone/lobby');
        } else {
            router.push('/focus-zone');
        }
    };
    
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
                description: 'Could not remove member. Please try again.'
            });
        }
    }, [roomId, toast]);

    const renderTimerContent = () => {
        if (mode === 'transition') {
            return (
                <div className="text-center animate-pop-in">
                    <PartyPopper className="w-24 h-24 text-primary mx-auto" />
                    <div className="text-2xl font-bold mt-4">
                        {lastCompletedMode === 'work' ? 'Focus Session Complete!' : 'Break Over!'}
                    </div>
                </div>
            );
        }

        return (
            <div className="relative text-center">
                <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                    {mode === 'work' ? <Brain className="w-5 h-5"/> : <Coffee className="w-5 h-5"/>}
                    {mode === 'work' ? 'Focus Session' : 'Break Time'}
                </div>
                <div className="text-6xl md:text-7xl font-bold font-mono tracking-tighter my-2">
                    {formatTime(timeLeft)}
                </div>
                <div className="font-semibold text-muted-foreground">
                    Cycle: {cycles}
                </div>
            </div>
        );
    }


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

    if (!isMounted) {
        return (
             <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Loading Focus Zone...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-card/50 py-16 md:py-24 animate-fade-in flex flex-col">
            <div className="absolute top-6 left-6">
                <Button variant="outline" size="icon" onClick={handleBackNavigation}>
                    <ArrowLeft />
                </Button>
            </div>
            
            <div className="container mx-auto px-6 flex-grow">
                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    
                    {/* Timer Section */}
                    <div className="lg:col-span-2 flex flex-col items-center gap-8">
                         <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Focus Zone</h1>
                            <p className="text-lg text-muted-foreground mt-2">
                                 {isMultiplayer ? "Focusing with the Parivaar." : "Your personal space for deep work."}
                            </p>
                        </div>

                        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
                            <motion.div 
                                className="absolute inset-0 rounded-full border-[10px]"
                                style={{ 
                                    borderColor: mode === 'work' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--accent))',
                                }}
                            />
                            <motion.svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 100"
                                initial={{ rotate: -90 }}
                                animate={{ rotate: -90 }}
                            >
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    strokeWidth="10"
                                    className={cn(
                                        "stroke-current",
                                        mode === 'work' ? 'text-primary' : 'text-accent'
                                    )}
                                    fill="transparent"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 1 }}
                                    animate={{ pathLength: mode === 'transition' ? 1 : progress / 100 }}
                                    transition={{ duration: mode === 'transition' ? 0 : 1, ease: 'linear' }}
                                />
                            </motion.svg>
                           {renderTimerContent()}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button onClick={toggleTimer} size="lg" className="w-32" disabled={mode === 'transition'}>
                                {isActive ? <Pause className="mr-2"/> : <Play className="mr-2"/>}
                                {isActive ? 'Pause' : 'Start'}
                            </Button>
                            <Button onClick={resetTimer} size="lg" variant="outline">
                                <RotateCcw className="mr-2"/> Reset
                            </Button>
                        </div>
                        
                        <Card className="w-full max-w-sm">
                            <CardHeader><CardTitle>Customize Session</CardTitle></CardHeader>
                            <CardContent className="flex items-end gap-4">
                                <div>
                                    <Label htmlFor="work-minutes">Focus (mins)</Label>
                                    <Input 
                                        id="work-minutes"
                                        type="number"
                                        value={workMinutes}
                                        onChange={handleWorkMinutesChange}
                                        min={1}
                                        disabled={isActive}
                                    />
                                </div>
                                <div className="pb-2 text-muted-foreground">
                                    <Timer className="w-6 h-6"/>
                                </div>
                                <div>
                                    <Label>Break (mins)</Label>
                                    <div className="h-10 flex items-center justify-center rounded-md border bg-muted px-3 font-bold text-muted-foreground">
                                        {breakMinutes}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {isMultiplayer && (
                            <MemberListPanel room={room} onRemoveMember={handleRemoveMember}/>
                        )}

                        {/* To-Do List Section */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Session Goals</CardTitle>
                                 <p className="text-sm text-muted-foreground">What will you accomplish now?</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                                    <Input 
                                        placeholder="Add a new task..."
                                        value={newTask}
                                        onChange={e => setNewTask(e.target.value)}
                                    />
                                    <Button type="submit" size="icon"><Plus/></Button>
                                </form>
                                <ScrollArea className="h-40">
                                    <div className="space-y-2 pr-4">
                                        {tasks.length > 0 ? tasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                <Checkbox
                                                    id={`task-${task.id}`}
                                                    checked={task.completed}
                                                    onCheckedChange={() => toggleTask(task.id)}
                                                />
                                                <Label htmlFor={`task-${task.id}`} className={cn("flex-grow", task.completed && "line-through text-muted-foreground")}>
                                                    {task.text}
                                                </Label>
                                            </div>
                                        )) : <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one!</p>}
                                    </div>
                                </ScrollArea>
                                <div className="flex items-center justify-between mt-4">
                                    {tasks.some(t => t.completed) && (
                                        <Button variant="outline" size="sm" onClick={clearCompletedTasks}>
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Clear Completed
                                        </Button>
                                    )}
                                    {isMultiplayer && (
                                        <div className="flex items-center space-x-2 ml-auto">
                                            <Checkbox id="tasks-public" checked={isTasksPublic} onCheckedChange={(checked) => setIsTasksPublic(!!checked)} />
                                            <Label htmlFor="tasks-public" className="text-sm flex items-center gap-1 text-muted-foreground">
                                                {isTasksPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4"/>}
                                                Public
                                            </Label>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>


                        {/* Music Section */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Music className="w-6 h-6 text-primary" />
                                    <div>
                                        <CardTitle>Your Musical Cosmos</CardTitle>
                                        <p className="text-sm text-muted-foreground">Load local music to aid your focus.</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                                    <UploadCloud className="w-12 h-12 text-muted-foreground mb-2" />
                                    <p className="font-semibold mb-2">Upload Your Focus Music</p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Your files will be saved on this device. ({playlist.length}/10 songs)
                                    </p>
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        Select Audio Files
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        multiple 
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                
                                {playlist.length > 0 && (
                                    <>
                                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                                            <p className="text-sm text-muted-foreground">Now Playing</p>
                                            <p className="font-bold truncate">
                                                {currentTrackIndex !== null ? playlist[currentTrackIndex].name : "No track selected"}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={playPrevTrack} disabled={playlist.length < 2}>
                                                <SkipBack className="w-6 h-6" />
                                            </Button>
                                            <Button size="icon" className="w-16 h-16 rounded-full" onClick={toggleMusicPlay}>
                                                {isPlayingMusic ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={playNextTrack} disabled={playlist.length < 2}>
                                                <SkipForward className="w-6 h-6" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-center gap-2">
                                            <Button 
                                                variant={isShuffle ? 'secondary' : 'ghost'} 
                                                size="icon" 
                                                onClick={() => setIsShuffle(!isShuffle)}
                                                aria-label="Shuffle"
                                            >
                                                <Shuffle className="w-5 h-5" />
                                            </Button>
                                            <Button 
                                                variant={isLoop ? 'secondary' : 'ghost'} 
                                                size="icon" 
                                                onClick={() => setIsLoop(!isLoop)}
                                                aria-label="Loop"
                                            >
                                                <Repeat className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2"><ListMusic className="w-5 h-5"/> Playlist</h4>
                                            <ScrollArea className="h-48 border rounded-md">
                                                <div className="p-2 space-y-1">
                                                    {playlist.map((track, index) => (
                                                        <button
                                                            key={track.id}
                                                            onClick={() => playMusic(index)}
                                                            className={cn(
                                                                "w-full text-left p-2 rounded-md text-sm transition-colors",
                                                                currentTrackIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                                                            )}
                                                        >
                                                        <span className="truncate">{index + 1}. {track.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {isMultiplayer && roomId && (
                <div className="mt-8 container mx-auto px-6">
                    <ChatBox roomId={roomId} />
                </div>
            )}
            
            <audio ref={audioRef} onEnded={playNextTrack} />
            <audio id="session-end-audio" src="/chime.mp3" preload="auto" />

            <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>

                        <AlertDialogDescription>
                            Your current focus session is still active. Leaving now will reset your progress for this session.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Nope</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push(isMultiplayer ? '/focus-zone/lobby' : '/focus-zone')}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default function FocusZonePage() {
    return (
        // Use Suspense to handle client-side search param reading
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <FocusZoneUI />
        </Suspense>
    )
}
