
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { listenForRoomUpdates } from '@/lib/data/rooms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoaderCircle, Copy, Check, Users, Rocket, Brain, Trophy, VenetianMask, StarIcon, Award, Bird, FerrisWheel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Room, RoomMember } from '@/types';

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

const MemberCard = ({ member, isHost }: { member: RoomMember, isHost: boolean }) => {
    const AvatarIcon = avatarIcons[member.avatar] || Brain;
    return (
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Avatar>
                <AvatarFallback className="bg-primary/20">
                    <AvatarIcon className="w-6 h-6 text-primary" />
                </AvatarFallback>
            </Avatar>
            <div className="font-semibold">{member.displayName}</div>
            {isHost && (
                <div className="ml-auto text-primary animate-pulse" title="Room Host">
                    <span className="text-2xl">⚡</span>
                </div>
            )}
        </div>
    )
}

export default function FocusZoneRoomPage() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId as string;
    const { toast } = useToast();

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = listenForRoomUpdates(roomId, (updatedRoom) => {
            setRoom(updatedRoom);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        toast({ title: "Room ID Copied!" });
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Entering Room...</p>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex h-screen items-center justify-center text-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Room Not Found</CardTitle>
                        <CardDescription>The room you're looking for doesn't exist or has been closed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/focus-zone/lobby')}>Back to Lobby</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const isHost = user?.uid === room.hostId;

    return (
         <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-20 md:py-28 animate-fade-in">
            <div className="container mx-auto px-6 max-w-2xl">
                 <Card className="shadow-2xl border-primary/20">
                     <CardHeader className="text-center">
                        <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 w-fit mx-auto">
                            <Users className="w-12 h-12 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold font-headline">Focus Room Lobby</CardTitle>
                        <CardDescription>Waiting for the host to start the session.</CardDescription>
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <span className="text-sm font-mono p-2 bg-muted rounded-md border">{roomId}</span>
                            <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                     </CardHeader>
                     <CardContent>
                        <h3 className="font-bold text-center mb-4">{room.members.length} Member(s) in Room</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                            {room.members.map(member => (
                                <MemberCard key={member.uid} member={member} isHost={member.uid === room.hostId} />
                            ))}
                        </div>
                        
                        <div className="mt-8 text-center">
                            {isHost ? (
                                <Button size="lg" disabled>
                                    Start Session (Coming Soon)
                                </Button>
                            ) : (
                                <p className="text-muted-foreground">The host will start the session soon...</p>
                            )}
                        </div>
                     </CardContent>
                 </Card>
            </div>
         </div>
    );
}
