
"use client";

import { useState, useMemo, useTransition } from 'react';
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
import { MoreHorizontal, Trash2, LoaderCircle, RefreshCw } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger, 
    DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function UserTableClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // When initialUsers prop changes (due to a refresh), update the state
  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      toast({
        title: "User list refreshed!",
        description: "The latest user data has been fetched.",
      })
    });
  };

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setShowDeleteAlert(true);
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(userToDelete.uid);
    const { success, message } = await deleteUser(userToDelete.uid);
    
    if (success) {
        setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
        toast({
            title: "User Deleted",
            description: `${userToDelete.displayName} has been removed.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: message,
        });
    }
    
    setIsDeleting(null);
    setShowDeleteAlert(false);
    setUserToDelete(null);
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div>
             <h1 className="text-3xl md:text-4xl font-bold font-headline">User Management</h1>
             <p className="text-muted-foreground">Search, view, and manage all users on the platform.</p>
        </div>
      
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <div className="border rounded-lg">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="font-medium">{user.displayName || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'faculty' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.grade || 'N/A'}</TableCell>
                   <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.onboardingComplete ? 
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge> : 
                        <Badge variant="destructive">Pending</Badge>
                    }
                  </TableCell>
                   <TableCell className="text-right">
                    {isDeleting === user.uid ? (
                        <LoaderCircle className="w-5 h-5 animate-spin ml-auto"/>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => handleDeleteClick(user)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

       <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the user profile for <span className="font-bold text-foreground">{userToDelete?.displayName}</span> ({userToDelete?.email}). This action is irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleConfirmDelete}
                        className={cn(buttonVariants({variant: "destructive"}))}
                        disabled={!!isDeleting}
                    >
                        {isDeleting ? <LoaderCircle className="animate-spin" /> : "Confirm Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
