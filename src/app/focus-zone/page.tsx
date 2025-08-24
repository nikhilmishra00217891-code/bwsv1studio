
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Music, 
    Volume2, 
    SkipForward, 
    SkipBack, 
    ListMusic, 
    UploadCloud,
    Brain,
    Coffee
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const FocusZonePage = () => {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
    const [isActive, setIsActive] = useState(false);

    const [playlist, setPlaylist] = useState<File[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const handleSessionEnd = useCallback(() => {
        const newMode = mode === 'work' ? 'break' : 'work';
        setMode(newMode);
        setTimeLeft((newMode === 'work' ? workMinutes : breakMinutes) * 60);
        setIsActive(true); // Keep the timer running for the next session
        
        const sessionEndAudio = document.getElementById('session-end-audio') as HTMLAudioElement;
        if(sessionEndAudio) sessionEndAudio.play();
        
        toast({
            title: `Time for a ${newMode === 'work' ? 'Work Session' : 'Break'}!`,
            description: newMode === 'work' ? "Let's get back to it." : "Time to relax and recharge.",
        });
    }, [mode, workMinutes, breakMinutes, toast]);

    // This effect runs the timer countdown
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);
    
    // This effect handles the session change when time runs out
    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            handleSessionEnd();
        }
    }, [timeLeft, isActive, handleSessionEnd]);
    
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(workMinutes * 60);
            setMode('work');
        }
    }, [workMinutes]);

    const handleWorkMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseInt(e.target.value, 10);
        if (isNaN(minutes) || minutes < 1) {
            setWorkMinutes(1);
            setBreakMinutes(Math.ceil(1 / 5));
        } else {
            setWorkMinutes(minutes);
            setBreakMinutes(Math.ceil(minutes / 5));
        }
    };

    useEffect(() => {
        // This effect now correctly sets the time for the new session after `mode` changes
        if (!isActive) { // Only reset if timer is not active
             setTimeLeft((mode === 'work' ? workMinutes : breakMinutes) * 60);
        }
    }, [mode, workMinutes, breakMinutes]);


    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeLeft(workMinutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    const progress = (timeLeft / ((mode === 'work' ? workMinutes : breakMinutes) * 60)) * 100;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const audioFiles = newFiles.filter(file => file.type.startsWith('audio/'));
            setPlaylist(prev => [...prev, ...audioFiles]);
            if (currentTrackIndex === null && audioFiles.length > 0) {
                setCurrentTrackIndex(0);
            }
            toast({
                title: "Music added!",
                description: `${audioFiles.length} song(s) added to your cosmos.`,
            })
        }
    };
    
    const playMusic = useCallback((index: number) => {
        if (index >= 0 && index < playlist.length && audioRef.current) {
            setCurrentTrackIndex(index);
            const trackUrl = URL.createObjectURL(playlist[index]);
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
            if (currentTrackIndex === null && playlist.length > 0) {
                 playMusic(0);
            } else {
                audioRef.current.play().then(() => setIsPlayingMusic(true));
            }
        }
    };
    
    const playNextTrack = useCallback(() => {
        if (currentTrackIndex !== null && playlist.length > 0) {
            const nextIndex = (currentTrackIndex + 1) % playlist.length;
            playMusic(nextIndex);
        }
    }, [currentTrackIndex, playlist.length, playMusic]);
    
    const playPrevTrack = useCallback(() => {
         if (currentTrackIndex !== null && playlist.length > 0) {
            const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            playMusic(prevIndex);
        }
    }, [currentTrackIndex, playlist.length, playMusic]);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-card/50 py-16 md:py-24 animate-fade-in">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Timer Section */}
                <div className="flex flex-col items-center gap-8">
                     <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Focus Zone</h1>
                        <p className="text-lg text-muted-foreground mt-2">Your personal space for deep work.</p>
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
                                    "stroke-current stroke-round",
                                    mode === 'work' ? 'text-primary' : 'text-accent'
                                )}
                                fill="transparent"
                                initial={{ pathLength: 1 }}
                                animate={{ pathLength: progress / 100 }}
                                transition={{ duration: 1, ease: 'linear' }}
                            />
                        </motion.svg>
                        <div className="relative text-center">
                            <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                {mode === 'work' ? <Brain className="w-5 h-5"/> : <Coffee className="w-5 h-5"/>}
                                {mode === 'work' ? 'Focus Session' : 'Break Time'}
                            </div>
                            <div className="text-6xl md:text-7xl font-bold font-mono tracking-tighter my-2">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button onClick={toggleTimer} size="lg" className="w-32">
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
                            <div className="text-2xl text-muted-foreground pb-2">:</div>
                             <div>
                                <Label>Break (mins)</Label>
                                <div className="h-10 flex items-center justify-center rounded-md border bg-muted px-3 font-bold text-muted-foreground">
                                    {breakMinutes}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                            <p className="text-xs text-muted-foreground mb-4">Files are not stored on our servers.</p>
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

                                <div className="flex items-center justify-center gap-4">
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

                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><ListMusic className="w-5 h-5"/> Playlist</h4>
                                    <ScrollArea className="h-48 border rounded-md">
                                        <div className="p-2 space-y-1">
                                            {playlist.map((file, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => playMusic(index)}
                                                    className={cn(
                                                        "w-full text-left p-2 rounded-md text-sm transition-colors",
                                                        currentTrackIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                                                    )}
                                                >
                                                   <span className="truncate">{index + 1}. {file.name}</span>
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
        </div>
    );
};

export default FocusZonePage;

    