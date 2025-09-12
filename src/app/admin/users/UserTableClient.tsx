
"use client";

import React, { useState, useMemo, useTransition } from 'react';
import type { UserProfile, PatraType, Course } from "@/types";
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
import { MoreHorizontal, Ban, UserCheck, LoaderCircle, RefreshCw, MessageSquarePlus, BrainCircuit, User as UserIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suspendUser, unsuspendUser } from '@/app/actions';
import { sendPatra, sendBulkPatra } from '@/lib/data/patra';
import { generatePatra } from '@/ai/flows';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { useAuth } from '@/components/auth/AuthProvider';

const suspensionReasons = [
    "Violation of Terms of Service",
    "Spamming or disruptive behavior",
    "Hacking or security exploit attempt",
    "Payment or subscription issue",
];

const PatraDialog = ({
    user,
    users, // For bulk sending
    isOpen,
    onOpenChange,
}: {
    user: UserProfile | null,
    users?: UserProfile[],
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
}) => {
    const { userProfile: facultyProfile } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<PatraType>('info');
    const [customInstructions, setCustomInstructions] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    
    const isBulkMode = !!users;

    React.useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
            setCustomInstructions('');
            setType('info');
        }
    }, [isOpen]);

    if (!facultyProfile) return null;
    if (!user && !isBulkMode) return null;


    const handleSendPatra = async () => {
        if (!title.trim() || !content.trim()) {
            toast({ variant: 'destructive', title: "Missing fields", description: "Please provide a title and content for the letter." });
            return;
        }

        setIsSending(true);
        try {
            if (isBulkMode) {
                await sendBulkPatra({
                    senderId: facultyProfile.uid,
                    senderName: facultyProfile.displayName || 'Faculty',
                    recipientIds: users.map(u => u.uid),
                    type,
                    title,
                    content
                });
                toast({ title: "Bulk Patra Sent!", description: `Your letter has been sent to ${users.length} users.` });
            } else if (user) {
                await sendPatra({
                    senderId: facultyProfile.uid,
                    senderName: facultyProfile.displayName || 'Faculty',
                    recipientId: user.uid,
                    type,
                    title,
                    content,
                });
                toast({ title: "Patra Sent!", description: `Your letter has been sent to ${user.displayName}.` });
            }
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Send Failed", description: error.message || "Could not send the letter." });
        } finally {
            setIsSending(false);
        }
    }
    
    const handleGenerateAI = async () => {
        if (!user || isBulkMode) return; // AI generation only for single user
        
        setIsGenerating(true);
        try {
            const result = await generatePatra({
                studentName: user.displayName || 'Student',
                studentGrade: user.grade,
                patraType: type,
                customInstructions: customInstructions,
            });
            setTitle(result.title);
            setContent(result.content);
            toast({ title: "Content Generated!", description: "The AI has drafted a letter for you." });
        } catch (error: any) {
             toast({ variant: 'destructive', title: "AI Generation Failed", description: error.message || "Could not generate content." });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isBulkMode ? `Send Patra to ${users.length} Users` : `Send a Patra to ${user?.displayName}`}</DialogTitle>
                    <DialogDescription>
                        {isBulkMode ? 'Compose a letter to send to all currently filtered users.' : 'Compose a personal letter to guide, praise, or warn the student.'}
                    </DialogDescription>
                </DialogHeader>
                 <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <Label htmlFor="patra-type">Letter Type / Vibe</Label>
                         <Select value={type} onValueChange={(v) => setType(v as PatraType)}>
                            <SelectTrigger id="patra-type">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">Informational</SelectItem>
                                <SelectItem value="praise">Praise / Shabashi</SelectItem>
                                <SelectItem value="encouragement">Encouragement</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     {!isBulkMode && (
                        <div>
                            <Label htmlFor="custom-instructions">AI Instructions (Optional)</Label>
                             <Textarea 
                                id="custom-instructions" 
                                value={customInstructions} 
                                onChange={(e) => setCustomInstructions(e.target.value)} 
                                placeholder="e.g., Mention their recent low score in the Physics test but praise their effort."
                                className="min-h-[80px]"
                            />
                             <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleGenerateAI} disabled={isGenerating}>
                                {isGenerating ? <LoaderCircle className="animate-spin w-4 h-4 mr-2"/> : <BrainCircuit className="w-4 h-4 mr-2"/>}
                                Generate with AI
                            </Button>
                        </div>
                     )}
                    <div>
                        <Label htmlFor="patra-title">Title</Label>
                        <Input id="patra-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Great Job on the Mock Test!" />
                    </div>
                    <div>
                        <Label htmlFor="patra-content">Content</Label>
                        <Textarea id="patra-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your letter here..." className="min-h-[200px]"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSendPatra} disabled={isSending}>
                        {isSending ? <LoaderCircle className="animate-spin" /> : "Send Patra"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

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

const BasicInfoDialog = ({
    user,
    isOpen,
    onOpenChange,
    allCourses,
}: {
    user: UserProfile | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    allCourses: Course[];
}) => {

    const enrolledCourseDetails = useMemo(() => {
        if (!user || !user.enrolledCourses) return [];
        return user.enrolledCourses.map(courseId => {
            return allCourses.find(c => c.id === courseId);
        }).filter((c): c is Course => !!c);
    }, [user, allCourses]);

    if (!user) return null;

    const DetailItem = ({ label, value, isList = false }: { label: string, value: string | string[] | number | undefined | null, isList?: boolean}) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        const displayValue = Array.isArray(value) 
            ? value.map(item => <Badge key={item} variant="secondary" className="mr-1 mb-1">{item}</Badge>)
            : <p className="text-muted-foreground">{value}</p>;
        
        return (
            <div>
                <p className="font-semibold text-sm">{label}</p>
                {isList ? <div className="flex flex-wrap mt-1">{displayValue}</div> : displayValue}
            </div>
        )
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>User Info: {user.displayName}</DialogTitle>
                    <DialogDescription>Role: <Badge variant={user.role === 'faculty' ? 'default' : 'secondary'}>{user.role}</Badge></DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                    <div className="py-4 space-y-6">
                         {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Personal Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Email" value={user.email} />
                                <DetailItem label="Mobile" value={user.mobile ? `${user.mobile.countryCode} ${user.mobile.number}` : null} />
                                <DetailItem label="Age" value={user.age} />
                                <DetailItem label="Gender" value={user.gender} />
                            </div>
                        </div>

                         {/* Academic Info */}
                         <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Academic Profile</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Grade" value={user.grade} />
                                <DetailItem label="Board" value={user.board} />
                            </div>
                            <DetailItem label="Subjects" value={user.subjects} isList />
                        </div>
                        
                         {/* Preferences */}
                         <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Learning Preferences</h3>
                            <DetailItem label="Goals" value={user.goals} isList />
                            <DetailItem label="Learning Styles" value={user.learningStyle as string[]} isList />
                            <DetailItem label="Motivation Styles" value={user.motivationStyles} isList />
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Productive Time" value={user.preferredStudyTime} />
                                <DetailItem label="Study Duration (hrs/day)" value={user.preferredStudyDuration} />
                            </div>
                             <DetailItem label="Interests" value={user.interests} isList />
                        </div>

                        {/* Enrolled Courses */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg border-b pb-2">Enrolled Courses ({enrolledCourseDetails.length})</h3>
                             {enrolledCourseDetails.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {enrolledCourseDetails.map(course => (
                                        <li key={course.id}>{course.title}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic">This user is not enrolled in any courses.</p>
                            )}
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export function UserTableClient({ initialUsers, allCourses }: { initialUsers: UserProfile[], allCourses: Course[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false);
  const [showPatraDialog, setShowPatraDialog] = useState(false);
  const [showBulkPatraDialog, setShowBulkPatraDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
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

  const openActionDialog = (user: UserProfile, action: 'suspend' | 'patra' | 'info') => {
    setSelectedUser(user);
    if (action === 'suspend') {
        setShowSuspensionDialog(true);
    } else if (action === 'patra') {
        setShowPatraDialog(true);
    } else if (action === 'info') {
        setShowInfoDialog(true);
    }
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
                 <Button variant="outline" onClick={() => setShowBulkPatraDialog(true)} disabled={filteredUsers.length === 0}>
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Send to Filtered ({filteredUsers.length})
                </Button>
            </div>
        </div>

      <div className="border rounded-lg">
        <ScrollArea>
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
                                <DropdownMenuItem onSelect={() => openActionDialog(user, 'info')}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    See Basic Info
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openActionDialog(user, 'patra')}>
                                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                                    Send Patra
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.suspension?.isSuspended ? (
                                    <DropdownMenuItem onSelect={() => openActionDialog(user, 'suspend')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Unsuspend User
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onSelect={() => openActionDialog(user, 'suspend')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
    <PatraDialog
        user={selectedUser}
        isOpen={showPatraDialog}
        onOpenChange={setShowPatraDialog}
    />
     <PatraDialog
        user={null}
        users={filteredUsers}
        isOpen={showBulkPatraDialog}
        onOpenChange={setShowBulkPatraDialog}
    />
    <BasicInfoDialog
        user={selectedUser}
        isOpen={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        allCourses={allCourses}
    />
    </>
  );
}
