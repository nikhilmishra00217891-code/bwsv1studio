
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
import Link from 'next/link';

export default function WarzoneLobbyPage() {
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
            };
            const roomId = await createRoom('warzone', member);
            toast({ title: "Warzone created!", description: `Assemble your team!` });
            router.push(`/warzone/room/${roomId}`);
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
            // The joinRoom function now adds user to joinRequests. 
            // The room page will handle the logic.
            await joinRoom(joinRoomId.trim().toUpperCase(), {
                 uid: user.uid,
                displayName: userProfile.displayName || "Anonymous",
                photoURL: userProfile.photoURL || "",
                avatar: userProfile.avatar || "brain",
            });
            router.push(`/warzone/room/${joinRoomId.trim().toUpperCase()}`);
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
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Multiplayer Warzone</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Create a private quiz room for your group, or join an existing one.
                    </p>
                </div>
                <div className="max-w-md mx-auto grid grid-cols-1 gap-8">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Create a New Warzone</CardTitle>
                            <CardDescription>Start a new multiplayer quiz battle.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full">
                                {isLoading ? <LoaderCircle className="animate-spin" /> : <><Plus className="mr-2" /> Create Room</>}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                         <CardHeader>
                            <CardTitle>Join an Existing Warzone</CardTitle>
                             <CardDescription>Enter the Room ID to join the battle.</CardDescription>
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

                    <div className="text-center">
                        <Button variant="link" asChild>
                            <Link href="/warzone">Back to Mode Selection</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
