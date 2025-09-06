
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createRoom, joinRoom } from '@/lib/data/rooms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Plus, LogIn, Users } from 'lucide-react';
import type { RoomMember } from '@/types';

export default function FocusZoneLobby() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState('');

    const handleCreateRoom = async () => {
        if (!user || !userProfile) {
            toast({ variant: "destructive", title: "You must be logged in" });
            return;
        }
        setIsLoading(true);
        try {
            const member: RoomMember = {
                uid: user.uid,
                displayName: userProfile.displayName || "Anonymous",
                photoURL: userProfile.photoURL || "",
                avatar: userProfile.avatar || "brain",
                focusStats: userProfile.focusStats || { totalMinutes: 0, totalSessions: 0 },
                currentCycle: 'work',
                timerSettings: { workMinutes: 25, breakMinutes: 5 },
                tasks: [],
                isTasksPublic: false,
            };
            const roomId = await createRoom('focus-zone', member);
            toast({ title: "Room created!", description: `Let's get focused!` });
            router.push(`/focus-zone/room/${roomId}`);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create room", description: error.message });
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinRoomId.trim()) {
            toast({ variant: "destructive", title: "Room ID required" });
            return;
        }
        if (!user || !userProfile) {
            toast({ variant: "destructive", title: "You must be logged in" });
            return;
        }
        setIsLoading(true);
        try {
            const member: RoomMember = {
                uid: user.uid,
                displayName: userProfile.displayName || "Anonymous",
                photoURL: userProfile.photoURL || "",
                avatar: userProfile.avatar || "brain",
                focusStats: userProfile.focusStats || { totalMinutes: 0, totalSessions: 0 },
                currentCycle: 'work',
                timerSettings: { workMinutes: 25, breakMinutes: 5 },
                tasks: [],
                isTasksPublic: false,
            };
            const room = await joinRoom(joinRoomId.trim().toUpperCase(), member);
            if (room) {
                 router.push(`/focus-zone/room/${room.id}`);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to join room", description: error.message });
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-20 md:py-28 animate-fade-in">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                        <Users className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Focus Zone Lobby</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Create a private study room for your group, or join an existing one.
                    </p>
                </div>
                <div className="max-w-md mx-auto grid grid-cols-1 gap-8">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Create a New Room</CardTitle>
                            <CardDescription>Start a new group focus session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full">
                                {isLoading ? <LoaderCircle className="animate-spin" /> : <><Plus className="mr-2" /> Create Room</>}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                         <CardHeader>
                            <CardTitle>Join an Existing Room</CardTitle>
                             <CardDescription>Enter the Room ID to join your friends.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJoinRoom} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomId">Room ID</Label>
                                    <Input 
                                        id="roomId"
                                        placeholder="Enter Room ID..."
                                        value={joinRoomId}
                                        onChange={(e) => setJoinRoomId(e.target.value)}
                                        disabled={isLoading}
                                        className="uppercase"
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? <LoaderCircle className="animate-spin" /> : <><LogIn className="mr-2" /> Join Room</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
