

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Hash, MessageSquare, Users, Settings, Plus, Send, BrainCircuit, Bot, Menu, X, Share2, Copy, Crown, Trash2, LogOut, MoreVertical, AlertTriangle, UserCog, ShieldCheck, CheckSquare, Square, PencilRuler, Pencil, Pin, Reply, Smile, Heart, CornerDownRight, PinOff, ChevronsDown, ChevronsUp, XCircle, Library, Paperclip, BarChart3, FolderKanban, Target, Swords, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { listenForUserChambers, createChamber, joinChamber, listenForChannelMessages, sendChannelMessage, removeMember, deleteChamber, createChannel, updateChannel, deleteChannel, createRole, deleteRole, assignRole, transferHost, updateRolePermissions, toggleReaction, togglePinMessage, voteOnPoll } from '@/lib/data/parivartan';
import type { Chamber, ChamberMessage, Channel, RoomMember, Role, Permission, Poll, PollOption } from '@/types';
import { PERMISSIONS } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

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
            const newChamberId = await createChamber(chamberName, chamberDescription, user.uid, userProfile.displayName || 'Anonymous', user.photoURL || '');
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

const ChamberList = ({ userChambers, activeChamberId, onChamberSelect, onNewClick, className, onClose }: { userChambers: Chamber[], activeChamberId: string | null, onChamberSelect: (id: string) => void, onNewClick: () => void, className?: string, onClose?: () => void }) => (
    <div className={cn("w-20 bg-card/50 p-3 flex flex-col items-center gap-4 border-r", className)}>
        <div className="flex items-center justify-between w-full">
            <Tooltip>
                <TooltipTrigger asChild>
                     <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-primary">
                        BWS
                    </div>
                </TooltipTrigger>
                 <TooltipContent side="right"><p>Home</p></TooltipContent>
            </Tooltip>
            {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                    <X />
                </Button>
            )}
        </div>
        <div className="w-full h-[2px] bg-border my-2"/>
        <ScrollArea className="flex-grow w-full">
            <div className="flex flex-col items-center gap-4">
                {userChambers.map(chamber => (
                    <Tooltip key={chamber.id}>
                        <TooltipTrigger asChild>
                            <button 
                                onClick={() => onChamberSelect(chamber.id)}
                                className={cn("w-14 h-14 rounded-full bg-muted flex items-center justify-center font-bold text-lg transition-all hover:rounded-2xl shrink-0",
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
            </div>
        </ScrollArea>
        <div className="mt-auto">
             <Tooltip>
                <TooltipTrigger asChild>
                    <button onClick={onNewClick} className="w-14 h-14 rounded-full bg-muted flex items-center justify-center transition-all hover:bg-primary hover:rounded-2xl">
                        <Plus />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Create or Join a Chamber</p>
                </TooltipContent>
            </Tooltip>
        </div>
    </div>
);

const ChannelDialog = ({
  mode,
  chamberId,
  channel,
  isOpen,
  onOpenChange,
}: {
  mode: "create" | "rename";
  chamberId: string;
  channel?: Channel;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === "rename" && channel) {
      setName(channel.name);
    } else {
      setName("");
    }
  }, [mode, channel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      if (mode === "create") {
        await createChannel(chamberId, name);
        toast({ title: "Channel created!" });
      } else if (mode === "rename" && channel) {
        await updateChannel(chamberId, channel.id, name);
        toast({ title: "Channel renamed!" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Channel" : "Rename Channel"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="channelName">Channel Name</Label>
                <div className="flex items-center gap-2">
                     <span className="text-muted-foreground">π</span>
                    <Input id="channelName" value={name} onChange={(e) => setName(e.target.value)} required autoFocus/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : "Save"}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const RolePermissionsDialog = ({ chamber, role, isOpen, onOpenChange }: { chamber: Chamber, role: Role | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (role) {
            setPermissions(role.permissions || []);
        }
    }, [role, isOpen]);
    
    if (!role) return null;

    const handlePermissionToggle = (permission: Permission) => {
        setPermissions(prev => 
            prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
        );
    }

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateRolePermissions(chamber.id, role.id, permissions);
            toast({ title: "Permissions Updated!" });
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Permissions for "{role.name}"</DialogTitle>
                    <DialogDescription>Select which actions members with this role can perform.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="space-y-4 py-4">
                        {Object.entries(PERMISSIONS).map(([key, label]) => (
                            <div key={key} className="flex items-center space-x-3">
                                <Checkbox 
                                    id={`perm-${key}`} 
                                    checked={permissions.includes(key as Permission)}
                                    onCheckedChange={() => handlePermissionToggle(key as Permission)}
                                />
                                <Label htmlFor={`perm-${key}`} className="font-medium">{label}</Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? <LoaderCircle className="animate-spin"/> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ChamberSettingsDialog = ({ chamber, isOpen, onOpenChange }: { chamber: Chamber, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const [newRoleName, setNewRoleName] = useState('');
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    
    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        setIsCreatingRole(true);
        try {
            await createRole(chamber.id, newRoleName.trim());
            toast({ title: "Role Created!" });
            setNewRoleName('');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create role", description: error.message });
        } finally {
            setIsCreatingRole(false);
        }
    };
    
    const handleDeleteRole = async (roleId: string) => {
        try {
            await deleteRole(chamber.id, roleId);
            toast({ title: "Role Deleted" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to delete role", description: error.message });
        }
    }

    const handleAssignRole = async (memberId: string, roleId: string, shouldAssign: boolean) => {
        try {
            await assignRole(chamber.id, memberId, roleId, shouldAssign);
        } catch (error: any) {
             toast({ variant: "destructive", title: "Failed to update role", description: error.message });
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                 <DialogContent className="max-w-4xl flex flex-col h-[calc(100%-4rem)]">
                    <DialogHeader>
                        <DialogTitle>Chamber Settings: {chamber.name}</DialogTitle>
                        <DialogDescription>Manage roles and members for your chamber.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow grid md:grid-cols-2 gap-8 overflow-y-auto pr-4 -mr-6 py-4">
                        {/* Roles Section */}
                        <Card className="flex flex-col">
                            <CardHeader><CardTitle className="text-lg">Roles</CardTitle></CardHeader>
                            <CardContent className="flex-grow flex flex-col gap-2">
                                <div className="space-y-2 flex-grow overflow-y-auto">
                                    {(chamber.roles || []).map(role => (
                                        <div key={role.id} className="flex items-center justify-between p-2 rounded-md bg-muted group">
                                            <span className="font-semibold">{role.name}</span>
                                            <div className="flex items-center">
                                                {(role.name !== 'Admin' && role.name !== 'Member') && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => setEditingRole(role)}>
                                                            <PencilRuler className="w-4 h-4"/>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                                                    <Trash2 className="w-4 h-4 text-destructive"/>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Delete "{role.name}"?</AlertDialogTitle></AlertDialogHeader>
                                                                <AlertDialogDescription>This will remove the role from all members who have it. This cannot be undone.</AlertDialogDescription>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteRole(role.id)} className={buttonVariants({variant: "destructive"})}>Delete Role</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-4 border-t mt-auto shrink-0">
                                    <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="New role name..."/>
                                    <Button onClick={handleCreateRole} disabled={isCreatingRole}>
                                        {isCreatingRole ? <LoaderCircle className="animate-spin"/> : <Plus />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Members Section */}
                        <Card className="flex flex-col">
                            <CardHeader><CardTitle className="text-lg">Members ({chamber.members.length})</CardTitle></CardHeader>
                            <CardContent className="flex-grow overflow-y-auto">
                                <div className="space-y-4">
                                    {(chamber.members || []).map(member => (
                                        <div key={member.uid} className="border-b last:border-b-0 pb-4">
                                            <p className="font-bold">{member.displayName}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                                {(chamber.roles || []).map(role => {
                                                    const isAbsoluteAdmin = member.uid === chamber.creatorId && role.name === 'Admin';
                                                    const isDefaultMemberRole = role.name === 'Member';
                                                    return (
                                                        <div key={role.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${member.uid}-${role.id}`}
                                                                checked={(member.roleIds || []).includes(role.id)}
                                                                onCheckedChange={(checked) => handleAssignRole(member.uid, role.id, !!checked)}
                                                                disabled={isAbsoluteAdmin || isDefaultMemberRole}
                                                            />
                                                            <label
                                                                htmlFor={`${member.uid}-${role.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {role.name}
                                                                {isAbsoluteAdmin && <Crown className="w-3 h-3 ml-1 inline text-amber-500"/>}
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <RolePermissionsDialog chamber={chamber} role={editingRole} isOpen={!!editingRole} onOpenChange={() => setEditingRole(null)} />
        </>
    )
}

const ChannelPanel = ({ chamber, activeChannelId, onChannelSelect, className, onClose, hasPermission }: { chamber: Chamber | null, activeChannelId: string | null, onChannelSelect: (id: string) => void, className?: string, onClose?: () => void, hasPermission: (permission: Permission) => boolean }) => {
     const { user } = useAuth();
     const { toast } = useToast();
     const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
     const [isRenameChannelOpen, setIsRenameChannelOpen] = useState(false);
     const [isSettingsOpen, setIsSettingsOpen] = useState(false);
     const [channelToEdit, setChannelToEdit] = useState<Channel | undefined>(undefined);

    
    const isAbsoluteAdmin = user?.uid === chamber?.creatorId;

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
     
    const handleHostLeave = async (newHostId: string) => {
        if (!user || !chamber) return;

        try {
            await transferHost(chamber.id, newHostId);
            toast({ title: 'Host Transferred!', description: 'You have successfully left the chamber.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Transferring', description: error.message });
        }
    };
     
    const handleDeleteChamber = async () => {
        if (!chamber || !isAbsoluteAdmin) return;
        try {
            await deleteChamber(chamber.id);
            toast({ title: 'Chamber Deleted', description: `${chamber.name} has been permanently deleted.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Deleting', description: error.message });
        }
    }

    const handleDeleteChannel = async (channelId: string) => {
        if(!chamber) return;
        try {
            await deleteChannel(chamber.id, channelId);
            toast({title: "Channel Deleted"});
        } catch (error: any) {
            toast({variant: 'destructive', title: "Error", description: error.message});
        }
    }
    
    const otherMembers = chamber?.members.filter(m => m.uid !== user?.uid) || [];

     return (
        <>
            <div className={cn("bg-card flex flex-col border-r w-full max-w-xs md:w-64", className)}>
                <header className="p-4 font-bold text-lg border-b shadow-sm h-16 flex items-center justify-between">
                    <span className="truncate">{chamber?.name || 'Parivartan'}</span>
                    <div className="flex items-center">
                        {isAbsoluteAdmin && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="h-8 w-8">
                                        <Settings className="h-5 w-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom"><p>Chamber Settings</p></TooltipContent>
                            </Tooltip>
                        )}
                        {onClose && (
                            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8">
                                <X className="h-5 w-5"/>
                            </Button>
                        )}
                    </div>
                </header>
                <ScrollArea className="flex-grow">
                    <div className="p-4 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground px-2 mb-2">
                             <span>Text Channels</span>
                             {hasPermission('manageChannels') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => setIsCreateChannelOpen(true)} className="hover:text-foreground">
                                            <Plus className="w-4 h-4"/>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Create Channel</p></TooltipContent>
                                </Tooltip>
                             )}
                        </div>
                        {chamber?.channels.map(channel => (
                            <div key={channel.id} className="group flex items-center gap-1">
                                <button 
                                    onClick={() => onChannelSelect(channel.id)}
                                    className={cn("w-full text-left flex items-center gap-2 p-2 rounded hover:bg-muted font-semibold",
                                        activeChannelId === channel.id && "bg-primary/10 text-primary"
                                    )}
                                >
                                    <span className="text-muted-foreground">π</span> {channel.name}
                                </button>
                                {hasPermission('manageChannels') && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => { setChannelToEdit(channel); setIsRenameChannelOpen(true);}}>
                                                <Pencil className="mr-2 h-4 w-4"/> Rename
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete #{channel.name}?</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogDescription>This cannot be undone. All messages in this channel will be lost.</AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteChannel(channel.id)} className={buttonVariants({variant: 'destructive'})}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                {user && (
                    <div className="p-2 border-t mt-auto bg-card/50">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user.photoURL || ''} />
                                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold truncate">{user.displayName}</span>
                                    </div>
                                    <MoreVertical className="h-4 w-4" />
                                </div>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent side="top" className="w-56">
                                <DropdownMenuItem onClick={handleCopyId}><Copy className="mr-2 h-4 w-4"/> Copy Chamber ID</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <LogOut className="mr-2 h-4 w-4"/>
                                            Leave Chamber
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        {isAbsoluteAdmin && otherMembers.length > 0 ? (
                                            <>
                                                 <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Host Controls</AlertDialogTitle>
                                                    <AlertDialogDescription>As the Absolute Admin, you must transfer ownership before leaving. Or, you can delete the chamber for everyone.</AlertDialogDescription>
                                                 </AlertDialogHeader>
                                                 <div className="space-y-4 py-4">
                                                    <Label>Transfer Ownership & Leave</Label>
                                                    <ScrollArea className="max-h-48">
                                                        <div className="space-y-2 pr-2">
                                                            {otherMembers.map(member => (
                                                                <div key={member.uid} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                                                    <span className="font-semibold">{member.displayName}</span>
                                                                    <Button size="sm" variant="outline" onClick={() => handleHostLeave(member.uid)}>
                                                                        <Crown className="mr-2 h-4 w-4"/> Make Admin
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                 </div>
                                                 <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" className={cn(buttonVariants({variant: "destructive"}))}>Delete Chamber</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This action is permanent and will delete the chamber for all members.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                             <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleDeleteChamber} className={cn(buttonVariants({variant: "destructive"}))}>Delete Chamber</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                 </AlertDialogFooter>
                                            </>
                                        ) : (
                                            <>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {isAbsoluteAdmin ? 'This will permanently delete the chamber and all its content for everyone. This action cannot be undone.' : 'Are you sure you want to leave this chamber?'}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={isAbsoluteAdmin ? handleDeleteChamber : handleLeaveChamber} className={cn(buttonVariants({variant: "destructive"}))}>
                                                        {isAbsoluteAdmin ? 'Delete Chamber' : 'Leave'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </>
                                        )}
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            {chamber && isAbsoluteAdmin && (
                <ChamberSettingsDialog chamber={chamber} isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
            )}
            {chamber && (
                 <ChannelDialog
                    mode="create"
                    chamberId={chamber.id}
                    isOpen={isCreateChannelOpen}
                    onOpenChange={setIsCreateChannelOpen}
                />
            )}
             {chamber && channelToEdit && (
                <ChannelDialog
                    mode="rename"
                    chamberId={chamber.id}
                    channel={channelToEdit}
                    isOpen={isRenameChannelOpen}
                    onOpenChange={setIsRenameChannelOpen}
                />
            )}
        </>
    )
};


const MemberList = ({ chamber, className, onClose }: { chamber: Chamber | null, className?: string, onClose?: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();

     const hasPermission = (permission: Permission): boolean => {
        if (!user || !chamber) return false;
        if (chamber.creatorId === user.uid) return true;
        
        const member = chamber.members.find(m => m.uid === user.uid);
        if (!member || !member.roleIds) return false;

        return chamber.roles?.some(role => 
            member.roleIds?.includes(role.id) && role.permissions.includes(permission)
        ) || false;
     }

    const getMemberRoles = (member: RoomMember | undefined): (Role)[] => {
        if (!member || !chamber || !chamber.roles) return [];
        const memberRoles = member.roleIds?.map(roleId => chamber.roles?.find(r => r.id === roleId)).filter((r): r is Role => !!r) || [];
        return memberRoles;
    }
    

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

    return (
        <div className={cn("bg-card flex flex-col p-4 border-l w-full max-w-xs md:w-64", className)}>
             <header className="font-bold text-muted-foreground uppercase text-sm mb-4 flex items-center justify-between">
                <h3>Online — {chamber.members.length}</h3>
                 {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                        <X className="h-5 w-5"/>
                    </Button>
                )}
            </header>
            <div className="space-y-3">
                {chamber.members.map(member => {
                    const roles = getMemberRoles(member);
                     return (
                         <div key={member.uid} className="flex items-center gap-3 group">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={member.photoURL || ''} />
                                <AvatarFallback>{member.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow overflow-hidden">
                                 <p className="font-semibold text-sm truncate">{member.displayName}</p>
                                 <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                                     {member.uid === chamber.creatorId && (
                                         <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            Absolute Admin
                                        </span>
                                     )}
                                     {roles.filter(r => r.name !== 'Admin' || member.uid !== chamber.creatorId).map(role => (
                                         <span key={role.id} className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                                            {role.name === 'Admin' && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                                            {role.name}
                                        </span>
                                     ))}
                                 </div>
                            </div>
                            {hasPermission('removeMembers') && user.uid !== member.uid && (
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
                    )
                })}
            </div>
        </div>
    )
}

const PinnedMessagesBar = ({ pinnedMessages, isExpanded, onToggle, onPinClick }: { pinnedMessages: ChamberMessage[], isExpanded: boolean, onToggle: () => void, onPinClick: (id: string) => void }) => {
    if (pinnedMessages.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-10 p-2"
            >
                <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-grow overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isExpanded ? 'expanded' : 'collapsed'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={isExpanded ? 'space-y-1' : 'whitespace-nowrap'}
                            >
                                {isExpanded ? (
                                    pinnedMessages.map(msg => (
                                        <button key={msg.id} onClick={() => onPinClick(msg.id)} className="text-xs text-left w-full hover:bg-muted p-1 rounded">
                                            <strong className="text-primary/80">{msg.senderName}:</strong> <span className="text-muted-foreground line-clamp-1">{msg.text}</span>
                                        </button>
                                    ))
                                ) : (
                                    <button onClick={() => onPinClick(pinnedMessages[0].id)} className="text-xs text-left w-full truncate">
                                        <strong className="text-primary/80">{pinnedMessages[0].senderName}:</strong> <span className="text-muted-foreground line-clamp-1">{pinnedMessages[0].text || pinnedMessages[0].poll?.question}</span>
                                    </button>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
                        {isExpanded ? <ChevronsUp className="w-4 h-4" /> : <ChevronsDown className="w-4 h-4" />}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

const CreatePollDialog = ({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSubmit: (poll: Poll) => void }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setQuestion('');
            setOptions(['', '']);
        }
    }, [isOpen]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const poll: Poll = {
            question,
            options: options.filter(opt => opt.trim() !== '').map(opt => ({ text: opt, voterIds: [] })),
        };
        onSubmit(poll);
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Poll</DialogTitle>
                    <DialogDescription>Ask a question and let the chamber vote.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="poll-question">Poll Question</Label>
                        <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        required
                                    />
                                    {options.length > 2 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-destructive">
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 5 && (
                            <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                                <Plus className="w-4 h-4 mr-2" /> Add Option
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : "Create Poll"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const ViewVotesDialog = ({ poll, members, isOpen, onOpenChange }: { poll: Poll, members: RoomMember[], isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Votes for: "{poll.question}"</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="space-y-4 py-4">
                        {poll.options.map((option, index) => (
                            <div key={index}>
                                <h4 className="font-semibold">{option.text} ({option.voterIds?.length || 0} votes)</h4>
                                <div className="pl-4 mt-2 space-y-2 text-sm text-muted-foreground">
                                    {(option.voterIds?.length || 0) > 0 ? (
                                        option.voterIds.map(voterId => {
                                            const voter = members.find(m => m.uid === voterId);
                                            return <p key={voterId}>- {voter?.displayName || 'A member'}</p>
                                        })
                                    ) : (
                                        <p>No votes yet.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ChatArea = ({ chamber, channel, hasPermission }: { chamber: Chamber | null, channel: Channel | null, hasPermission: (permission: Permission) => boolean }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChamberMessage[]>([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [replyToMessage, setReplyToMessage] = useState<ChamberMessage | null>(null);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const [isPinsExpanded, setIsPinsExpanded] = useState(false);
    const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
    
    useEffect(() => {
        if (!chamber || !channel) {
            setMessages([]);
            return;
        };
        const unsubscribe = listenForChannelMessages(chamber.id, channel.id, (newMessages) => {
            setMessages(newMessages);
            setTimeout(() => scrollToBottom(), 100);
        });

        return () => unsubscribe();
    }, [chamber, channel]);
    
    const scrollToBottom = useCallback(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, []);

    const scrollToMessage = (messageId: string) => {
        const element = messageRefs.current.get(messageId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.classList.add('animate-pulse', 'bg-primary/10', 'rounded-lg');
        setTimeout(() => {
            element?.classList.remove('animate-pulse', 'bg-primary/10', 'rounded-lg');
        }, 2000);
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user || !chamber || !channel) return;
        
        setIsSending(true);

        const messageData: Partial<ChamberMessage> = {
            messageType: 'text',
            text: message,
            senderId: user.uid,
            senderName: user.displayName || 'Anonymous',
            senderAvatar: user.photoURL || '',
        };

        if (replyToMessage) {
            messageData.replyTo = {
                messageId: replyToMessage.id,
                senderName: replyToMessage.senderName,
                text: replyToMessage.text || replyToMessage.poll?.question || '',
            };
        }

        try {
            await sendChannelMessage(chamber.id, channel.id, messageData);
            setMessage('');
            setReplyToMessage(null);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const handleSendPoll = async (poll: Poll) => {
         if (!user || !chamber || !channel) return;
        
        setIsSending(true);

        const messageData: Partial<ChamberMessage> = {
            messageType: 'poll',
            poll,
            senderId: user.uid,
            senderName: user.displayName || 'Anonymous',
            senderAvatar: user.photoURL || '',
        };

        try {
            await sendChannelMessage(chamber.id, channel.id, messageData);
            setIsCreatePollOpen(false);
        } catch (error) {
            console.error("Failed to send poll", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const PollMessage = ({ msg }: { msg: ChamberMessage }) => {
        const poll = msg.poll;
        const { user } = useAuth();
        const { toast } = useToast();
        const [isViewVotesOpen, setIsViewVotesOpen] = useState(false);
    
        const totalVotes = useMemo(() => poll?.options.reduce((acc, opt) => acc + (opt.voterIds?.length || 0), 0) || 0, [poll]);
        const userVoteIndex = useMemo(() => poll?.options.findIndex(opt => opt.voterIds?.includes(user?.uid || '')), [poll, user]);
    
        const handleVote = async (optionIndex: number) => {
            if (!user || !chamber || !channel || userVoteIndex !== -1) return;
            
            // Optimistic UI Update
            setMessages(prevMessages => {
                return prevMessages.map(m => {
                    if (m.id === msg.id && m.poll) {
                        const newOptions = m.poll.options.map((opt, idx) => {
                            if (idx === optionIndex) {
                                return { ...opt, voterIds: [...(opt.voterIds || []), user.uid] };
                            }
                            return opt;
                        });
                        return { ...m, poll: { ...m.poll, options: newOptions } };
                    }
                    return m;
                });
            });

            try {
                await voteOnPoll(chamber.id, channel.id, msg.id, optionIndex, user.uid);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Vote Failed', description: error.message });
                // Revert optimistic update on error by re-fetching from snapshot (auto)
            }
        };
    
        if (!poll) return null;
    
        return (
            <div ref={(el) => { if (el) messageRefs.current.set(msg.id, el); }} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.senderAvatar}/>
                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow max-w-md">
                    <p className="text-xs text-muted-foreground font-bold px-3">{msg.senderName}</p>
                    <div className="bg-card rounded-xl rounded-bl-none p-4 w-full">
                        <p className="font-bold mb-4">{poll.question}</p>
                        <div className="space-y-3">
                            {poll.options.map((option, index) => {
                                const voteCount = option.voterIds?.length || 0;
                                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                                const hasVotedForThis = userVoteIndex === index;
    
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleVote(index)}
                                        className={cn(
                                            "w-full text-left p-2 rounded-lg border-2 transition-all relative overflow-hidden",
                                            userVoteIndex !== -1 ? "cursor-default" : "hover:border-primary/50",
                                            hasVotedForThis ? "border-primary bg-primary/10" : "border-border"
                                        )}
                                        disabled={userVoteIndex !== -1}
                                    >
                                        <motion.div 
                                            className="absolute top-0 left-0 h-full bg-primary/20 -z-10"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ ease: "easeInOut", duration: 0.5 }}
                                        />
                                        <div className="flex justify-between items-center text-sm z-10 relative">
                                            <span className="font-semibold">{option.text}</span>
                                            <div className="flex items-center gap-2">
                                                {userVoteIndex !== -1 && <span className="font-mono text-xs">{percentage.toFixed(0)}%</span>}
                                                {hasVotedForThis && <Check className="w-4 h-4 text-primary"/>}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-3">
                            <span>{totalVotes} total votes</span>
                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsViewVotesOpen(true)}>
                                View Votes
                            </Button>
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1 px-3">
                        {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), {addSuffix: true}) : 'sending...'}
                    </p>
                </div>
                {chamber && <ViewVotesDialog poll={poll} members={chamber.members} isOpen={isViewVotesOpen} onOpenChange={setIsViewVotesOpen} />}
            </div>
        );
    };
    
    const MessageBubble = ({ msg, isSelf }: { msg: ChamberMessage, isSelf: boolean }) => {
        const { toast } = useToast();
        const [isExpanded, setIsExpanded] = useState(false);
        
        if (msg.messageType === 'poll') {
            return <PollMessage msg={msg} />
        }

        const lines = msg.text?.split('\n') || [];
        const isLongMessage = lines.length > 5 || (msg.text?.length || 0) > 350;
        const canExpand = isLongMessage && !isExpanded;
        const canCollapse = isLongMessage && isExpanded;

        const handleHeartReaction = async () => {
            if (!user || !chamber || !channel) return;
            try {
                await toggleReaction(chamber.id, channel.id, msg.id, '❤️', user.uid);
            } catch (error) {
                console.error("Failed to react:", error);
                toast({ variant: 'destructive', title: 'Reaction failed.' });
            }
        };

        const handlePinClick = async () => {
            if (!user || !chamber || !channel) return;
            try {
                await togglePinMessage(chamber.id, channel.id, msg.id);
                toast({title: msg.isPinned ? "Message Unpinned" : "Message Pinned"});
            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Action Failed',
                    description: error.message
                });
            }
        }

        const heartReaction = msg.reactions?.find(r => r.emoji === '❤️');
        const hasUserHearted = heartReaction?.userIds.includes(user?.uid || '');

        return (
            <div ref={(el) => { if (el) messageRefs.current.set(msg.id, el); }} className={cn("flex items-start gap-3", isSelf ? "flex-row-reverse" : "flex-row")}>
                {!isSelf && (
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.senderAvatar}/>
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div className={cn("flex flex-col group max-w-md", isSelf ? "items-end" : "items-start")}>
                     {!isSelf && <p className="text-xs text-muted-foreground font-bold px-3">{msg.senderName}</p>}
                    {msg.replyTo && (
                        <button onClick={() => scrollToMessage(msg.replyTo.messageId)} className="text-xs text-left text-muted-foreground bg-muted/50 p-2 rounded-t-lg border-b border-primary/20 w-full hover:bg-muted">
                            <div className="flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3"/>
                                Replying to <span className="font-semibold">{msg.replyTo.senderName}</span>
                            </div>
                            <p className="line-clamp-1 italic">"{msg.replyTo.text}"</p>
                        </button>
                    )}
                    <div className={cn("relative flex items-end", isSelf ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                            "p-3 rounded-xl", 
                            isSelf ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none",
                            msg.isAiResponse && "border border-primary/50",
                            msg.replyTo && "rounded-t-none"
                        )}>
                            {msg.isPinned && <Pin className="w-3 h-3 text-primary/50 absolute top-1 right-1" />}
                            <p className={cn("whitespace-pre-wrap break-words", canExpand && "line-clamp-5")}>
                                {msg.text}
                            </p>
                            {canExpand && <Button variant="link" size="sm" className="p-0 h-auto text-current" onClick={() => setIsExpanded(true)}>See more</Button>}
                            {canCollapse && <Button variant="link" size="sm" className="p-0 h-auto text-current" onClick={() => setIsExpanded(false)}>See less</Button>}
                             {heartReaction && heartReaction.userIds.length > 0 && (
                                <button
                                    onClick={handleHeartReaction}
                                    className={cn(
                                        "absolute flex items-center gap-1 rounded-full bg-card px-2 py-1 text-xs shadow-sm border",
                                        isSelf ? "-bottom-4 left-2" : "-bottom-4 right-2",
                                        hasUserHearted ? "border-red-500 text-red-500" : "border-muted-foreground/20"
                                    )}
                                >
                                    <Heart className={cn("w-3 h-3", hasUserHearted && "fill-current")} />
                                    <span>{heartReaction.userIds.length}</span>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1 self-start opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleHeartReaction}><Heart className="w-4 h-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyToMessage(msg)}><Reply className="w-4 h-4"/></Button>
                            {hasPermission('pinMessages') && (
                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePinClick} title={msg.isPinned ? "Unpin Message" : "Pin Message"}>
                                    {msg.isPinned ? <PinOff className="w-4 h-4 text-primary" /> : <Pin className="w-4 h-4"/>}
                                 </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-3">
                        {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), {addSuffix: true}) : 'sending...'}
                    </p>
                </div>
                {isSelf && (
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.senderAvatar}/>
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
            </div>
        )
    }
    
    const pinnedMessages = messages.filter(m => m.isPinned).sort((a, b) => (b.pinnedAt?.toMillis() || 0) - (a.pinnedAt?.toMillis() || 0));

    const AttachmentMenu = () => {
        const actionItems = [
            { icon: BarChart3, label: 'Poll', onClick: () => setIsCreatePollOpen(true) },
            { icon: FolderKanban, label: 'Drive', onClick: () => {} },
            { icon: Target, label: 'Focus Zone', onClick: () => {} },
            { icon: Swords, label: 'Warzone', onClick: () => {} },
        ];

        return (
            <Popover>
                <PopoverTrigger asChild>
                     <Button type="button" size="icon" variant="ghost" className="text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2"><Paperclip /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" side="top" align="start">
                    <div className="grid grid-cols-4 gap-2">
                        {actionItems.map(item => (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex flex-col h-20 w-20 items-center justify-center gap-1"
                                        onClick={item.onClick}
                                        disabled={item.label !== 'Poll'} // Disable non-functional buttons
                                    >
                                        <div className={cn("p-3 rounded-full", item.label === 'Poll' ? "bg-blue-500/20 text-blue-500" : "bg-muted text-muted-foreground")}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs">{item.label}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{item.label}</p></TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    return (
         <div className="flex-1 flex flex-col relative">
            <header className="p-4 border-b shadow-sm h-14 flex items-center justify-between z-20 bg-background">
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="md:hidden" onClick={() => document.dispatchEvent(new CustomEvent('toggle-chamber-panel'))}>
                        <Library />
                    </Button>
                     <Button variant="ghost" size="icon" className="md:hidden" onClick={() => document.dispatchEvent(new CustomEvent('toggle-channel-panel'))}>
                        <Menu/>
                    </Button>
                    <span className="w-5 h-5 text-muted-foreground flex items-center justify-center font-bold">π</span>
                    <h2 className="font-bold text-lg">{channel?.name || 'Select a channel'}</h2>
                </div>
                <p className="text-sm text-muted-foreground hidden lg:block truncate">{chamber?.description || 'The general chat channel for our Parivaar.'}</p>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => document.dispatchEvent(new CustomEvent('toggle-member-panel'))}>
                    <Users />
                </Button>
            </header>

            <div className="flex-grow flex flex-col relative overflow-hidden">
                <PinnedMessagesBar pinnedMessages={pinnedMessages} isExpanded={isPinsExpanded} onToggle={() => setIsPinsExpanded(p => !p)} onPinClick={scrollToMessage} />

                <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} msg={msg} isSelf={msg.senderId === user?.uid} />
                        ))}
                        {!messages.length && channel && (
                            <div className="text-center text-muted-foreground py-16">
                                <p>This is the beginning of the π {channel?.name} channel.</p>
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
            </div>

            <div className="p-4 border-t bg-card shrink-0">
                 <form onSubmit={handleSendMessage}>
                     {replyToMessage && (
                        <div className="bg-muted px-3 py-2 rounded-t-lg text-sm text-muted-foreground flex justify-between items-center">
                             <button onClick={() => scrollToMessage(replyToMessage.id)} className="line-clamp-1 text-left flex-grow hover:text-foreground">
                                Replying to <span className="font-semibold text-foreground">{replyToMessage.senderName}</span>: <span className="italic">"{replyToMessage.text || replyToMessage.poll?.question}"</span>
                             </button>
                             <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyToMessage(null)}>
                                <XCircle className="w-4 h-4"/>
                            </Button>
                        </div>
                     )}
                     <div className="relative">
                        <AttachmentMenu />
                        <Input
                            placeholder={`Message in π ${channel?.name || '...'}`}
                            className={cn("h-12 pl-12 pr-24 bg-card/50", replyToMessage && "rounded-t-none")}
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
            </div>
            <CreatePollDialog isOpen={isCreatePollOpen} onOpenChange={setIsCreatePollOpen} onSubmit={handleSendPoll} />
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

    const [isChamberPanelOpen, setIsChamberPanelOpen] = useState(false);
    const [isChannelPanelOpen, setIsChannelPanelOpen] = useState(false);
    const [isMemberListOpen, setIsMemberListOpen] = useState(false);
    const [isCreateJoinDialogOpen, setIsCreateJoinDialogOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = listenForUserChambers(user.uid, (chambers) => {
            setUserChambers(chambers);
            
            const currentActiveChamberExists = chambers.some(c => c.id === activeChamberId);

            if ((!activeChamberId || !currentActiveChamberExists) && chambers.length > 0) {
                const firstChamber = chambers[0];
                setActiveChamberId(firstChamber.id);
                setActiveChannelId(firstChamber.channels[0]?.id || null);
            } else if (chambers.length === 0) {
                setActiveChamberId(null);
                setActiveChannelId(null);
            } else if (currentActiveChamberExists) {
                const activeChamber = chambers.find(c => c.id === activeChamberId);
                const currentActiveChannelExists = activeChamber?.channels.some(c => c.id === activeChannelId);
                if (!currentActiveChannelExists && activeChamber) {
                     setActiveChannelId(activeChamber.channels[0]?.id || null);
                }
            }
        });
        return () => unsubscribe();
    }, [user, activeChamberId, activeChannelId]);

    useEffect(() => {
        const toggleChamber = () => setIsChamberPanelOpen(p => !p);
        const toggleChannel = () => setIsChannelPanelOpen(p => !p);
        const toggleMembers = () => setIsMemberListOpen(p => !p);
        document.addEventListener('toggle-chamber-panel', toggleChamber);
        document.addEventListener('toggle-channel-panel', toggleChannel);
        document.addEventListener('toggle-member-panel', toggleMembers);
        return () => {
            document.removeEventListener('toggle-chamber-panel', toggleChamber);
            document.removeEventListener('toggle-channel-panel', toggleChannel);
            document.removeEventListener('toggle-member-panel', toggleMembers);
        }
    }, []);

    const handleChamberSelect = (chamberId: string) => {
        const previouslyActiveChamberId = activeChamberId;
        setActiveChamberId(chamberId);
        const selectedChamber = userChambers.find(c => c.id === chamberId);
        if (selectedChamber) {
            if (previouslyActiveChamberId !== chamberId) {
                setActiveChannelId(selectedChamber.channels[0]?.id || null);
            }
        }
        setIsChamberPanelOpen(false);
        setIsCreateJoinDialogOpen(false);
    };
    
    const handleChannelSelect = (channelId: string) => {
        setActiveChannelId(channelId);
        setIsChannelPanelOpen(false); 
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

    const hasPermission = (permission: Permission): boolean => {
        if (!user || !activeChamber) return false;
        if (activeChamber.creatorId === user.uid) return true;

        const member = activeChamber.members.find(m => m.uid === user.uid);
        if (!member || !member.roleIds) return false;

        return activeChamber.roles?.some(role => 
            member.roleIds?.includes(role.id) && role.permissions.includes(permission)
        ) || false;
    };

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
                
                {/* Mobile Drawers */}
                <AnimatePresence>
                    {isChamberPanelOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsChamberPanelOpen(false)}
                                className="absolute inset-0 bg-black/60 z-30 md:hidden"
                            />
                            <motion.div 
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="absolute top-0 left-0 h-full z-40 md:hidden"
                            >
                                <ChamberList 
                                    userChambers={userChambers} 
                                    activeChamberId={activeChamberId} 
                                    onChamberSelect={handleChamberSelect}
                                    onNewClick={() => { setIsChamberPanelOpen(false); setIsCreateJoinDialogOpen(true); }}
                                    className="h-full border-r"
                                    onClose={() => setIsChamberPanelOpen(false)}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                    {isChannelPanelOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsChannelPanelOpen(false)}
                                className="absolute inset-0 bg-black/60 z-30 md:hidden"
                            />
                            <motion.div 
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="absolute inset-0 z-40 md:hidden"
                            >
                                <ChannelPanel 
                                    chamber={activeChamber || null}
                                    activeChannelId={activeChannelId}
                                    onChannelSelect={handleChannelSelect}
                                    hasPermission={hasPermission}
                                    className="h-full" 
                                    onClose={() => setIsChannelPanelOpen(false)}
                                />
                            </motion.div>
                         </>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                     {isMemberListOpen && (
                         <>
                             <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMemberListOpen(false)}
                                className="absolute inset-0 bg-black/60 z-30 md:hidden"
                            />
                            <motion.div 
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="absolute inset-0 z-40 md:hidden"
                            >
                                <MemberList 
                                    chamber={activeChamber || null}
                                    className="h-full ml-auto"
                                    onClose={() => setIsMemberListOpen(false)}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                
                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="hidden md:flex">
                        <ChamberList 
                            userChambers={userChambers} 
                            activeChamberId={activeChamberId} 
                            onChamberSelect={handleChamberSelect}
                            onNewClick={() => setIsCreateJoinDialogOpen(true)}
                        />
                    </div>

                    {activeChamber ? (
                      <div className="flex flex-1 min-w-0">
                        <div className="hidden md:flex">
                           <ChannelPanel 
                                chamber={activeChamber}
                                activeChannelId={activeChannelId}
                                onChannelSelect={handleChannelSelect}
                                hasPermission={hasPermission}
                            />
                        </div>
                        <ChatArea chamber={activeChamber} channel={activeChannel || null} hasPermission={hasPermission} />
                        <div className="hidden md:flex">
                           <MemberList chamber={activeChamber} />
                        </div>
                      </div>
                    ) : (
                         <WelcomePlaceholder onActionClick={() => setIsCreateJoinDialogOpen(true)} />
                    )}
                </div>

                <Dialog open={isCreateJoinDialogOpen} onOpenChange={setIsCreateJoinDialogOpen}>
                    <CreateJoinDialog onChamberSelect={handleChamberSelect} />
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default ParivartanChamberPage;
