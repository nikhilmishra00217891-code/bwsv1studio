
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Hash, MessageSquare, Users, Settings, Plus, Send, BrainCircuit, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ParivartanChamberPage = () => {
    const { user, loading } = useAuth();
    const [message, setMessage] = useState('');

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    if (!user) {
        // This should ideally be handled by a layout, but as a fallback:
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Please log in to access the Parivartan Chamber.</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground">
                {/* Chamber List (Left Sidebar) */}
                <div className="w-20 bg-card/50 p-3 flex flex-col items-center gap-4 border-r">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl transition-all hover:rounded-lg">
                                BWS
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>BWS Main Hub</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="w-14 h-14 rounded-full bg-muted flex items-center justify-center transition-all hover:bg-primary hover:rounded-2xl">
                                <Plus />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Create or Join a Chamber</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Channel & User Panel (Middle-Left) */}
                <div className="w-64 bg-card flex flex-col border-r">
                    <header className="p-4 font-bold text-lg border-b shadow-sm h-16 flex items-center">
                        BiharWaleSirji
                    </header>
                    <ScrollArea className="flex-grow">
                        <div className="p-4 space-y-2">
                            <p className="text-xs font-bold uppercase text-muted-foreground px-2 mb-2">Text Channels</p>
                            <button className="w-full text-left flex items-center gap-2 p-2 rounded bg-primary/10 text-primary font-semibold">
                                <Hash className="w-5 h-5" /> Kuch-bhi-Pucho
                            </button>
                            <button className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-muted">
                                <Hash className="w-5 h-5" /> Physics-Doubts
                            </button>
                             <p className="text-xs font-bold uppercase text-muted-foreground px-2 mb-2 mt-4">Tools</p>
                             <button className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-muted">
                                <BrainCircuit className="w-5 h-5" /> Whiteboard
                            </button>
                        </div>
                    </ScrollArea>
                    <div className="p-2 border-t mt-auto bg-card/50">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.photoURL || ''} />
                                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold">{user.displayName}</span>
                            </div>
                            <Settings className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Main Content (Chat Area) */}
                <div className="flex-1 flex flex-col">
                    <header className="p-4 border-b shadow-sm h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Hash className="w-6 h-6 text-muted-foreground" />
                            <h2 className="font-bold text-lg">Kuch-bhi-Pucho</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">The general chat channel for our Parivaar.</p>
                    </header>

                    <ScrollArea className="flex-grow p-6">
                        <div className="space-y-6">
                            {/* Placeholder Message */}
                            <div className="flex gap-4">
                                <Avatar><AvatarFallback>AI</AvatarFallback></Avatar>
                                <div>
                                    <p className="font-bold">BWS Buddy <span className="text-xs text-muted-foreground font-normal ml-2">10:00 AM</span></p>
                                    <div className="bg-card p-3 rounded-lg rounded-tl-none mt-1">
                                        Welcome to the Parivartan Chamber! This is where we collaborate and grow together.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-card">
                         <div className="relative">
                            <Input
                                placeholder="Message #Kuch-bhi-Pucho"
                                className="h-12 pr-24 bg-card/50"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                // onKeyDown for sending message
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="text-muted-foreground"><Bot /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Mention @bws to ask the AI</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Button size="icon" variant="ghost"><Send /></Button>
                            </div>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Remember: Share only Google Drive links for resources. Direct uploads are disabled to save costs.
                        </p>
                    </div>
                </div>

                 {/* Member List (Right Sidebar) */}
                <div className="w-64 bg-card p-4 border-l">
                    <h3 className="font-bold text-muted-foreground uppercase text-sm mb-4">Online — 1</h3>
                    <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.photoURL || ''} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm">{user.displayName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default ParivartanChamberPage;
