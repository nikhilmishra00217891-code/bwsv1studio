
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Hash, MessageSquare, Users, Settings, Plus, Send, BrainCircuit, Bot, Menu, X, Share2, Copy, Crown, Trash2, LogOut, MoreVertical, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { listenForUserChambers, createChamber, joinChamber, listenForChannelMessages, sendChannelMessage, removeMember, deleteChamber } from '@/lib/data/parivartan';
import type { Chamber, ChamberMessage, Channel, RoomMember } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CreateJoinDialog = ({ onChamberSelect }: { onChamberSelect: (id: string) => void }) => {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(true);

    const [chamberName, setChamberName] = useState('');
    const [chamberDescription, setChamberDescription] = useState('');
    const [joinChamberId, setJoinChamberId] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile || !chamberName) return;
        setIsLoading(true);
        try {
            const newChamberId = await createChamber(chamberName, chamberDescription, user.uid, userProfile.displayName || 'Anonymous');
            toast({ title: "Chamber Created!", description: `Invite friends with ID: ${newChamberId}` });
            onChamberSelect(newChamberId);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Creation Failed", description: error.message });
        } finally {
            setIsLoading(false);
            const closeButton = document.getElementById('create-join-dialog-close');
            closeButton?.click();
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile || !joinChamberId) return;
        setIsLoading(true);
        try {
            const joinedChamber = await joinChamber(joinChamberId.toUpperCase(), user.uid, userProfile.displayName || 'Anonymous', user.photoURL || '');
            if (joinedChamber) {
                toast({ title: "Joined Chamber!", description: `Welcome to ${joinedChamber.name}.` });
                onChamberSelect(joinedChamber.id);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Join", description: error.message });
        } finally {
            setIsLoading(false);
             const closeButton = document.getElementById('create-join-dialog-close');
            closeButton?.click();
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isCreateMode ? 'Create a New Chamber' : 'Join a Chamber'}</DialogTitle>
                <DialogDescription>
                    {isCreateMode ? "Start a new study group for your Parivaar." : "Enter a Chamber ID to join your friends."}
                </DialogDescription>
            </DialogHeader>
            {isCreateMode ? (
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <Label htmlFor="chamberName">Chamber Name</Label>
                        <Input id="chamberName" value={chamberName} onChange={(e) => setChamberName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="chamberDescription">Description (Optional)</Label>
                        <Textarea id="chamberDescription" value={chamberDescription} onChange={(e) => setChamberDescription(e.target.value)} />
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="link" onClick={() => setIsCreateMode(false)}>Want to join instead?</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : 'Create'}</Button>
                    </DialogFooter>
                </form>
            ) : (
                <form onSubmit={handleJoin} className="space-y-4">
                    <div>
                        <Label htmlFor="joinChamberId">Chamber ID</Label>
                        <Input id="joinChamberId" placeholder="Enter ID..." value={joinChamberId} onChange={(e) => setJoinChamberId(e.target.value)} className="uppercase" required/>
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="link" onClick={() => setIsCreateMode(true)}>Create a new chamber?</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : 'Join'}</Button>
                    </DialogFooter>
                </form>
            )}
             <DialogClose id="create-join-dialog-close" className="hidden"/>
        </DialogContent>
    )
}

const ChamberList = ({ userChambers, activeChamberId, onChamberSelect }: { userChambers: Chamber[], activeChamberId: string | null, onChamberSelect: (id: string) => void }) => (
    <div className="w-20 bg-card/50 p-3 flex flex-col items-center gap-4 border-r">
        <Tooltip>
            <TooltipTrigger asChild>
                 <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-primary">
                    BWS
                </div>
            </TooltipTrigger>
             <TooltipContent side="right"><p>Home</p></TooltipContent>
        </Tooltip>
        <div className="w-full h-[2px] bg-border my-2"/>
        {userChambers.map(chamber => (
             <Tooltip key={chamber.id}>
                <TooltipTrigger asChild>
                    <button 
                        onClick={() => onChamberSelect(chamber.id)}
                        className={cn("w-14 h-14 rounded-full bg-muted flex items-center justify-center font-bold text-lg transition-all hover:rounded-2xl",
                            activeChamberId === chamber.id && "rounded-2xl bg-primary text-primary-foreground"
                        )}
                    >
                        {chamber.name.charAt(0)}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{chamber.name}</p>
                </TooltipContent>
            </Tooltip>
        ))}
        <Dialog>
            <Tooltip>
                <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <button className="w-14 h-14 rounded-full bg-muted flex items-center justify-center transition-all hover:bg-primary hover:rounded-2xl">
                            <Plus />
                        </button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent side="right">
                    <p>Create or Join a Chamber</p>
                </TooltipContent>
            </Tooltip>
            <CreateJoinDialog onChamberSelect={onChamberSelect} />
        </Dialog>
    </div>
);

const ChannelPanel = ({ chamber, activeChannelId, onChannelSelect, className, onClose }: { chamber: Chamber | null, activeChannelId: string | null, onChannelSelect: (id: string) => void, className?: string, onClose?: () => void }) => {
     const { user } = useAuth();
     const { toast } = useToast();

     const isUserAdmin = user?.uid === chamber?.creatorId;

     const handleCopyId = () => {
         if(!chamber) return;
         navigator.clipboard.writeText(chamber.id);
         toast({ title: "Chamber ID Copied!", description: chamber.id });
     }
     
     const handleLeaveChamber = async () => {
         if (!user || !chamber) return;
         try {
             await removeMember(chamber.id, user.uid);
             toast({ title: 'Left Chamber', description: `You have left ${chamber.name}.` });
         } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error Leaving', description: error.message });
         }
     }
     
     const handleDeleteChamber = async () => {
         if (!chamber) return;
         try {
             await deleteChamber(chamber.id);
             toast({ title: 'Chamber Deleted', description: `${chamber.name} has been permanently deleted.` });
         } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error Deleting', description: error.message });
         }
     }

     return (
        <div className={cn("bg-card flex-col border-r w-full max-w-xs md:w-64 md:flex", className)}>
            <header className="p-4 font-bold text-lg border-b shadow-sm h-16 flex items-center justify-between">
                <span className="truncate">{chamber?.name || 'Parivartan'}</span>
                <div className="flex items-center">
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8">
                            <X className="h-5 w-5"/>
                        </Button>
                    )}
                </div>
            </header>
            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground px-2 mb-2">Text Channels</p>
                    {chamber?.channels.map(channel => (
                        <button 
                            key={channel.id}
                            onClick={() => onChannelSelect(channel.id)}
                            className={cn("w-full text-left flex items-center gap-2 p-2 rounded hover:bg-muted font-semibold",
                                activeChannelId === channel.id && "bg-primary/10 text-primary"
                            )}
                        >
                            <Hash className="w-5 h-5" /> {channel.name}
                        </button>
                    ))}
                    <p className="text-xs font-bold uppercase text-muted-foreground px-2 mb-2 mt-4">Tools</p>
                    <button className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-muted">
                        <BrainCircuit className="w-5 h-5" /> Whiteboard
                    </button>
                </div>
            </ScrollArea>
             {user && (
                 <div className="p-2 border-t mt-auto bg-card/50">
                    <div className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.photoURL || ''} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold truncate">{user.displayName}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top">
                                <DropdownMenuItem onClick={handleCopyId}><Copy className="mr-2"/> Copy Chamber ID</DropdownMenuItem>
                                {isUserAdmin ? (
                                    <>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2"/> Delete Chamber
                                                 </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the chamber and all its content for everyone. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteChamber} className={cn(buttonVariants({variant: "destructive"}))}>Delete Chamber</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <LogOut className="mr-2"/> Leave Chamber
                                                 </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Leave Chamber?</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure you want to leave this chamber?</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleLeaveChamber} className={cn(buttonVariants({variant: "destructive"}))}>Leave</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
             )}
        </div>
    )
};


const MemberList = ({ chamber, className, onClose }: { chamber: Chamber | null, className?: string, onClose?: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleRemoveMember = async (memberId: string) => {
        if (!chamber) return;
        try {
            await removeMember(chamber.id, memberId);
            toast({title: "Member Removed"});
        } catch (error: any) {
            toast({variant: 'destructive', title: "Error Removing Member", description: error.message });
        }
    }
    
    if (!chamber || !user) return null;
    const isUserAdmin = user.uid === chamber.creatorId;

    return (
        <div className={cn("bg-card flex-col p-4 border-l w-full max-w-xs md:w-64 md:flex", className)}>
             <header className="font-bold text-muted-foreground uppercase text-sm mb-4 flex items-center justify-between">
                <h3>Online — {chamber.members.length}</h3>
                 {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                        <X className="h-5 w-5"/>
                    </Button>
                )}
            </header>
            <div className="space-y-3">
                {chamber.members.map(member => (
                     <div key={member.uid} className="flex items-center gap-3 group">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={member.photoURL || ''} />
                            <AvatarFallback>{member.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                             <span className="font-semibold text-sm">{member.displayName}</span>
                             {member.uid === chamber.creatorId && <p className="text-xs text-amber-500 font-bold flex items-center gap-1"><Crown className="w-3 h-3"/>Admin</p>}
                        </div>
                        {isUserAdmin && user.uid !== member.uid && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Remove {member.displayName}?</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to remove this member from the chamber?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveMember(member.uid)} className={cn(buttonVariants({variant: 'destructive'}))}>Remove</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const ChatArea = ({ chamber, channel }: { chamber: Chamber | null, channel: Channel | null }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChamberMessage[]>([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useState<HTMLDivElement>(null);

    useEffect(() => {
        if (!chamber || !channel) {
            setMessages([]);
            return;
        };
        const unsubscribe = listenForChannelMessages(chamber.id, channel.id, setMessages);
        return () => unsubscribe();
    }, [chamber, channel]);
    
     useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages, scrollAreaRef]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user || !chamber || !channel) return;
        
        setIsSending(true);
        try {
            await sendChannelMessage(chamber.id, channel.id, {
                text: message,
                senderId: user.uid,
                senderName: user.displayName || 'Anonymous',
                senderAvatar: user.photoURL || '',
            });
            setMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
         <div className="flex-1 flex flex-col">
            <header className="p-4 border-b shadow-sm h-16 flex items-center justify-between">
                 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => document.dispatchEvent(new CustomEvent('toggle-channel-panel'))}>
                    <Menu/>
                </Button>
                <div className="flex items-center gap-2">
                    <Hash className="w-6 h-6 text-muted-foreground" />
                    <h2 className="font-bold text-lg">{channel?.name || 'Select a channel'}</h2>
                </div>
                <p className="text-sm text-muted-foreground hidden lg:block">{chamber?.description || 'The general chat channel for our Parivaar.'}</p>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => document.dispatchEvent(new CustomEvent('toggle-member-panel'))}>
                    <Users />
                </Button>
            </header>

            <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {messages.map(msg => (
                         <div key={msg.id} className="flex gap-4">
                            <Avatar>
                                <AvatarImage src={msg.senderAvatar}/>
                                <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{msg.senderName} <span className="text-xs text-muted-foreground font-normal ml-2">{msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), {addSuffix: true}) : 'sending...'}</span></p>
                                <div className={cn("bg-card p-3 rounded-lg rounded-tl-none mt-1 max-w-md", msg.isAiResponse && "border border-primary/50")}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                     {!messages.length && channel && (
                        <div className="text-center text-muted-foreground py-16">
                            <p>This is the beginning of the #{channel?.name} channel.</p>
                            <p className="text-sm">Be the first to say something!</p>
                        </div>
                     )}
                     {!channel && chamber && (
                         <div className="text-center text-muted-foreground py-16">
                            <p>Select a channel to start chatting.</p>
                         </div>
                     )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card">
                 <form onSubmit={handleSendMessage}>
                     <div className="relative">
                        <Input
                            placeholder={`Message #${channel?.name || '...'}`}
                            className="h-12 pr-24 bg-card/50"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={!channel || isSending}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" size="icon" variant="ghost" className="text-muted-foreground"><Bot /></Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Mention @bws to ask the AI</p>
                                </TooltipContent>
                            </Tooltip>
                            <Button type="submit" size="icon" variant="ghost" disabled={!message.trim() || isSending}>
                                {isSending ? <LoaderCircle className="animate-spin"/> : <Send />}
                            </Button>
                        </div>
                    </div>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Remember: Share only Google Drive links for resources. Direct uploads are disabled to save costs.
                </p>
            </div>
        </div>
    )
}

const WelcomePlaceholder = ({ onActionClick }: { onActionClick: () => void }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold font-headline">Welcome to Parivartan Chamber!</h2>
        <p className="text-muted-foreground mt-2 max-w-md">Your new space for collaborative learning. Create a new chamber or join an existing one using an ID to get started.</p>
        <div className="mt-6">
            <Button onClick={onActionClick}>Create or Join a Chamber</Button>
        </div>
    </div>
)

const ParivartanChamberPage = () => {
    const { user, loading } = useAuth();
    const [userChambers, setUserChambers] = useState<Chamber[]>([]);
    const [activeChamberId, setActiveChamberId] = useState<string | null>(null);
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

    const [isChannelPanelOpen, setIsChannelPanelOpen] = useState(false);
    const [isMemberListOpen, setIsMemberListOpen] = useState(false);
    const [isCreateJoinDialogOpen, setIsCreateJoinDialogOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = listenForUserChambers(user.uid, (chambers) => {
            setUserChambers(chambers);
            // If there's no active chamber, or the active one is no longer available, set a new one.
            if ((!activeChamberId || !chambers.some(c => c.id === activeChamberId)) && chambers.length > 0) {
                const firstChamber = chambers[0];
                setActiveChamberId(firstChamber.id);
                setActiveChannelId(firstChamber.channels[0]?.id || null);
            } else if (chambers.length === 0) {
                // No chambers left, reset state
                setActiveChamberId(null);
                setActiveChannelId(null);
            }
        });
        return () => unsubscribe();
    }, [user, activeChamberId]);

    useEffect(() => {
        const toggleChannel = () => setIsChannelPanelOpen(p => !p);
        const toggleMembers = () => setIsMemberListOpen(p => !p);
        document.addEventListener('toggle-channel-panel', toggleChannel);
        document.addEventListener('toggle-member-panel', toggleMembers);
        return () => {
            document.removeEventListener('toggle-channel-panel', toggleChannel);
            document.removeEventListener('toggle-member-panel', toggleMembers);
        }
    }, []);

    const handleChamberSelect = (chamberId: string) => {
        setActiveChamberId(chamberId);
        const selectedChamber = userChambers.find(c => c.id === chamberId);
        if (selectedChamber) {
            setActiveChannelId(selectedChamber.channels[0]?.id || null);
        }
        setIsChannelPanelOpen(false); // Close mobile panel on select
        setIsCreateJoinDialogOpen(false); // Close dialog on select
    };
    
    const handleChannelSelect = (channelId: string) => {
        setActiveChannelId(channelId);
        setIsChannelPanelOpen(false); // Close mobile panel on select
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Please log in to access the Parivartan Chamber.</p>
            </div>
        );
    }

    const activeChamber = userChambers.find(c => c.id === activeChamberId);
    const activeChannel = activeChamber?.channels.find(c => c.id === activeChannelId);

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground">
                <ChamberList userChambers={userChambers} activeChamberId={activeChamberId} onChamberSelect={handleChamberSelect} />

                {/* --- Mobile Sidebars (Absolute Positioned) --- */}
                {isChannelPanelOpen && (
                    <div className="absolute inset-0 z-40 md:hidden">
                        <ChannelPanel 
                            chamber={activeChamber || null}
                            activeChannelId={activeChannelId}
                            onChannelSelect={handleChannelSelect}
                            className="h-full animate-in slide-in-from-left-full duration-300" 
                            onClose={() => setIsChannelPanelOpen(false)}
                        />
                    </div>
                )}
                {isMemberListOpen && (
                    <div className="absolute inset-0 z-40 md:hidden">
                         <MemberList 
                            chamber={activeChamber || null}
                            className="h-full animate-in slide-in-from-right-full duration-300 ml-auto"
                            onClose={() => setIsMemberListOpen(false)}
                         />
                    </div>
                )}

                {activeChamber ? (
                  <>
                    <ChannelPanel 
                        chamber={activeChamber}
                        activeChannelId={activeChannelId}
                        onChannelSelect={handleChannelSelect}
                        className="hidden md:flex" 
                    />
                    <ChatArea chamber={activeChamber} channel={activeChannel || null} />
                    <MemberList chamber={activeChamber} className="hidden md:flex" />
                  </>
                ) : (
                     <Dialog open={isCreateJoinDialogOpen} onOpenChange={setIsCreateJoinDialogOpen}>
                        <WelcomePlaceholder onActionClick={() => setIsCreateJoinDialogOpen(true)} />
                        <CreateJoinDialog onChamberSelect={handleChamberSelect} />
                     </Dialog>
                )}
            </div>
        </TooltipProvider>
    );
};

export default ParivartanChamberPage;
