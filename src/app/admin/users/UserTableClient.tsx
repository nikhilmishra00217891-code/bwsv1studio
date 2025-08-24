
"use client";

import React, { useState, useMemo, useTransition } from 'react';
import type { UserProfile } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import { MoreHorizontal, Ban, UserCheck, LoaderCircle, RefreshCw } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { suspendUser, unsuspendUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const suspensionReasons = [
    "Violation of Terms of Service",
    "Spamming or disruptive behavior",
    "Hacking or security exploit attempt",
    "Payment or subscription issue",
];

const SuspensionDialog = ({ 
    user,
    isOpen, 
    onOpenChange,
    onUserUpdate
}: { 
    user: UserProfile | null, 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void,
    onUserUpdate: (updatedUser: UserProfile) => void
}) => {
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!isOpen) {
            setReason("");
            setCustomReason("");
        }
    }, [isOpen]);

    if (!user) return null;
    const isSuspended = user.suspension?.isSuspended;

    const handleSuspend = async () => {
        const finalReason = reason === 'other' ? customReason : reason;
        if (!finalReason) {
            toast({ variant: "destructive", title: "Reason Required", description: "Please select or provide a reason for suspension." });
            return;
        }
        setIsProcessing(true);
        const { success, message } = await suspendUser(user.uid, finalReason);
        if (success) {
            toast({ title: "User Suspended", description: `${user.displayName} has been suspended.` });
            const updatedUser = { ...user, suspension: { isSuspended: true, reason: finalReason, suspendedAt: new Date().toISOString() } };
            onUserUpdate(updatedUser);
            onOpenChange(false);
        } else {
            toast({ variant: "destructive", title: "Suspension Failed", description: message });
        }
        setIsProcessing(false);
    }

    const handleUnsuspend = async () => {
        setIsProcessing(true);
        const { success, message } = await unsuspendUser(user.uid);
        if (success) {
            toast({ title: "User Unsuspended", description: `${user.displayName}'s access has been restored.` });
             const updatedUser = { ...user, suspension: { isSuspended: false, reason: "", suspendedAt: null } };
            onUserUpdate(updatedUser);
            onOpenChange(false);
        } else {
            toast({ variant: "destructive", title: "Failed to Unsuspend", description: message });
        }
        setIsProcessing(false);
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isSuspended ? "Unsuspend User" : "Suspend User"}</DialogTitle>
                    <DialogDescription>
                        {isSuspended
                            ? `This will lift the suspension for ${user.displayName} and restore their access to the app.`
                            : `This will suspend ${user.displayName} and block them from accessing the app.`
                        }
                    </DialogDescription>
                </DialogHeader>
                
                {isSuspended ? (
                    <div className='py-4'>
                        <p className="font-semibold">Current Reason for Suspension:</p>
                        <blockquote className="mt-2 border-l-2 pl-6 italic text-muted-foreground">
                            {user.suspension?.reason}
                        </blockquote>
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        <Label>Reason for Suspension</Label>
                        <RadioGroup value={reason} onValueChange={setReason}>
                            {suspensionReasons.map(r => (
                                <div key={r} className="flex items-center space-x-2">
                                    <RadioGroupItem value={r} id={r.replace(/\s/g, '')} />
                                    <Label htmlFor={r.replace(/\s/g, '')}>{r}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other">Other (please specify)</Label>
                            </div>
                        </RadioGroup>
                        {reason === 'other' && (
                             <Textarea 
                                placeholder="Specify custom reason..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="mt-2"
                             />
                        )}
                    </div>
                )}
                
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isProcessing}>Cancel</Button>
                    </DialogClose>
                     {isSuspended ? (
                        <Button 
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleUnsuspend} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? <LoaderCircle className="animate-spin" /> : "Confirm Unsuspend"}
                        </Button>
                    ) : (
                        <Button 
                            variant="destructive"
                            onClick={handleSuspend} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? <LoaderCircle className="animate-spin" /> : "Confirm Suspend"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export function UserTableClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    let searchableUsers = users;

    if (filter === 'active') {
      searchableUsers = users.filter(user => !user.suspension?.isSuspended);
    } else if (filter === 'suspended') {
      searchableUsers = users.filter(user => user.suspension?.isSuspended);
    }
    
    if (!searchTerm) return searchableUsers;

    return searchableUsers.filter(user =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, filter]);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      toast({
        title: "User list refreshed!",
        description: "The latest user data has been fetched.",
      })
    });
  };

  const handleManageSuspensionClick = (user: UserProfile) => {
    setSelectedUser(user);
    setShowSuspensionDialog(true);
  }

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUsers(prevUsers => prevUsers.map(u => u.uid === updatedUser.uid ? updatedUser : u));
  }

  return (
    <>
    <div className="p-4 md:p-8 space-y-6">
        <div>
             <h1 className="text-3xl md:text-4xl font-bold font-headline">User Management</h1>
             <p className="text-muted-foreground">Search, view, and manage all users on the platform.</p>
        </div>
      
        <AnalyticsDashboard users={users} />

        <div className="flex flex-col sm:flex-row gap-4">
            <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            />
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border p-1 bg-background">
                    <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
                    <Button variant={filter === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('active')}>Active</Button>
                    <Button variant={filter === 'suspended' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('suspended')}>Suspended</Button>
                </div>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isPending}>
                    <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                    <span className="sr-only">Refresh</span>
                </Button>
            </div>
        </div>

      <div className="border rounded-lg">
        <ScrollArea className="h-[calc(100vh-18rem)]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <TableRow key={user.uid} className={cn(user.suspension?.isSuspended && "bg-destructive/5 hover:bg-destructive/10")}>
                  <TableCell>
                    <div className="font-medium">{user.displayName || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'faculty' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     {user.suspension?.isSuspended ? 
                        <Badge variant="destructive">Suspended</Badge> :
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Active</Badge>
                     }
                  </TableCell>
                   <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.onboardingComplete ? 
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Completed</Badge> : 
                        <Badge variant="destructive">Pending</Badge>
                    }
                  </TableCell>
                   <TableCell className="text-right">
                    {isProcessing === user.uid ? (
                        <LoaderCircle className="w-5 h-5 animate-spin ml-auto"/>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {user.suspension?.isSuspended ? (
                                    <DropdownMenuItem onSelect={() => handleManageSuspensionClick(user)} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Unsuspend User
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onSelect={() => handleManageSuspensionClick(user)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Ban className="mr-2 h-4 w-4" />
                                        Suspend User
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users match your current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
    <SuspensionDialog 
        user={selectedUser}
        isOpen={showSuspensionDialog}
        onOpenChange={setShowSuspensionDialog}
        onUserUpdate={handleUserUpdate}
    />
    </>
  );
}

    

    