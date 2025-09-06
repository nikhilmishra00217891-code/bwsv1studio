
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
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
    EyeOff,
    Crown,
    UserCheck,
    AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import type { Task, FocusStats } from '@/types';
import { updateMemberStatusInRoom } from '@/lib/data/rooms';

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

export const FocusZoneTimer = ({ isMultiplayer, roomId }: { isMultiplayer: boolean, roomId?: string }) => {
    const router = useRouter();
    const { user, userProfile, setUserProfile } = useAuth();
    const { toast } = useToast();
    
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
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
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
        getPlaylistFromDB().then(tracks => {
            if (tracks.length > 0) {
                setPlaylist(tracks);
                if(currentTrackIndex === null) {
                    setCurrentTrackIndex(0);
                }
            }
        }).catch(err => console.error("Could not load playlist from IndexedDB", err));
    }, [isMounted, currentTrackIndex]);

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
                     setUserProfile(userProfile);
                });
            }
        }
        
        const sessionEndAudio = document.getElementById('session-end-audio') as HTMLAudioElement;
        if(sessionEndAudio) sessionEndAudio.play().catch(e => console.log("Chime blocked"));
        
    }, [mode, user, userProfile, workMinutes, setUserProfile]);

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

    useEffect(() => {
        if (mode === 'transition') {
            const transitionTimer = setTimeout(() => {
                const newMode = lastCompletedMode === 'work' ? 'break' : 'work';
                setMode(newMode);
                setTimeLeft((newMode === 'work' ? workMinutes : breakMinutes) * 60);
                setIsActive(true); 
                toast({
                    title: `Time for a ${newMode === 'work' ? 'Work Session' : 'Break'}!`,
                    description: newMode === 'work' ? "Let's get back to it." : "Time to relax and recharge.",
                });
            }, 3000); 

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
    
    return (
        <>
            <div className="flex flex-col items-center gap-8">
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
            <div className="lg:col-span-1 mt-8 lg:mt-0 space-y-6">
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
            <audio ref={audioRef} onEnded={playNextTrack} />
            <audio id="session-end-audio" src="/chime.mp3" preload="auto" />
        </>
    );
};
