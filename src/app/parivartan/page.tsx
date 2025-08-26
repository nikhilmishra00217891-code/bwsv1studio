

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoaderCircle, Hash, MessageSquare, Users, Settings, Plus, Send, BrainCircuit, Bot, Menu, X, Share2, Copy, Crown, Trash2, LogOut, MoreVertical, AlertTriangle, UserCog, ShieldCheck, CheckSquare, Square, PencilRuler, Pencil, Pin, Reply, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { listenForUserChambers, createChamber, joinChamber, listenForChannelMessages, sendChannelMessage, removeMember, deleteChamber, createChannel, updateChannel, deleteChannel, createRole, deleteRole, assignRole, transferHost, updateRolePermissions } from '@/lib/data/parivartan';
import type { Chamber, ChamberMessage, Channel, RoomMember, Role, Permission } from '@/types';
import { PERMISSIONS } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

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

const ChamberList = ({ userChambers, activeChamberId, onChamberSelect }: { userChambers: Chamber[], activeChamberId: string | null, onChamberSelect: (id: string) => void }) => (
    <div className="w-20 bg-card/50 p-3 flex-col items-center gap-4 border-r hidden md:flex">
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
                     <Hash className="w-5 h-5 text-muted-foreground" />
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
                 <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>Chamber Settings: {chamber.name}</DialogTitle>
                        <DialogDescription>Manage roles and members for your chamber.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-grow flex flex-col md:flex-row gap-6 p-6 min-h-0">
                        {/* Roles Section */}
                        <Card className="w-full md:w-1/3 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">Roles</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col gap-2">
                                <ScrollArea className="flex-grow">
                                    <div className="space-y-2 pr-4">
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
                                </ScrollArea>
                                 <div className="flex gap-2 pt-4 border-t">
                                    <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="New role name..."/>
                                    <Button onClick={handleCreateRole} disabled={isCreatingRole}>
                                        {isCreatingRole ? <LoaderCircle className="animate-spin"/> : <Plus />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Members Section */}
                         <Card className="w-full md:w-2/3 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">Members ({chamber.members.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow min-h-0">
                                <ScrollArea className="h-full">
                                    <div className="space-y-4 pr-4">
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
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <DialogFooter className="p-6 pt-4 border-t mt-auto">
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
            <div className={cn("bg-card flex-col border-r w-full max-w-xs md:w-64 md:flex", className)}>
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
                                    <Hash className="w-5 h-5" /> {channel.name}
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
            {chamber && (
                <>
                    <ChannelDialog mode="create" chamberId={chamber.id} isOpen={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen} />
                    <ChannelDialog mode="rename" chamberId={chamber.id} channel={channelToEdit} isOpen={isRenameChannelOpen} onOpenChange={setIsRenameChannelOpen} />
                    {isAbsoluteAdmin && <ChamberSettingsDialog chamber={chamber} isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />}
                </>
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
    
    const MessageBubble = ({ msg, isSelf }: { msg: ChamberMessage, isSelf: boolean }) => (
        <div className={cn("flex items-start gap-3", isSelf && "justify-end")}>
            {!isSelf && (
                 <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.senderAvatar}/>
                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("flex flex-col", isSelf ? "items-end" : "items-start")}>
                {!isSelf && <p className="text-xs text-muted-foreground font-bold px-3">{msg.senderName}</p>}
                <div className={cn("group relative flex items-center", isSelf ? "flex-row-reverse" : "flex-row")}>
                     <div className={cn(
                        "p-3 rounded-xl max-w-md", 
                        isSelf ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none",
                        msg.isAiResponse && "border border-primary/50"
                     )}>
                        {msg.text}
                     </div>
                     <div className="flex items-center gap-1 self-start opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Reply className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Pin className="w-4 h-4"/></Button>
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
                         <MessageBubble key={msg.id} msg={msg} isSelf={msg.senderId === user?.uid} />
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
        const previouslyActiveChamberId = activeChamberId;
        setActiveChamberId(chamberId);
        const selectedChamber = userChambers.find(c => c.id === chamberId);
        if (selectedChamber) {
            if (previouslyActiveChamberId !== chamberId) {
                setActiveChannelId(selectedChamber.channels[0]?.id || null);
            }
        }
        setIsChannelPanelOpen(false);
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
            <div className="flex h-screen bg-background text-foreground">
                <div className="flex w-20 flex-col items-center gap-4 border-r bg-card/50 p-3 md:hidden">
                    {userChambers.map(chamber => (
                         <Tooltip key={chamber.id}>
                            <TooltipTrigger asChild>
                                <button 
                                    onClick={() => handleChamberSelect(chamber.id)}
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
                        <CreateJoinDialog onChamberSelect={handleChamberSelect} />
                     </Dialog>
                </div>
                <ChamberList userChambers={userChambers} activeChamberId={activeChamberId} onChamberSelect={handleChamberSelect} />


                {isChannelPanelOpen && (
                    <div className="absolute inset-0 z-40 md:hidden">
                        <ChannelPanel 
                            chamber={activeChamber || null}
                            activeChannelId={activeChannelId}
                            onChannelSelect={handleChannelSelect}
                            hasPermission={hasPermission}
                            className="h-full animate-in slide-in-from-left duration-300" 
                            onClose={() => setIsChannelPanelOpen(false)}
                        />
                    </div>
                )}
                {isMemberListOpen && (
                    <div className="absolute inset-0 z-40 md:hidden">
                         <MemberList 
                            chamber={activeChamber || null}
                            className="h-full animate-in slide-in-from-right duration-300 ml-auto"
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
                        hasPermission={hasPermission}
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
