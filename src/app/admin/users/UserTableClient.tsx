
"use client";

import { useState, useMemo } from 'react';
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

export function UserTableClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div>
             <h1 className="text-3xl md:text-4xl font-bold font-headline">User Management</h1>
             <p className="text-muted-foreground">Search, view, and manage all users on the platform.</p>
        </div>
      
      <Input
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

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
                <TableHead>Actions</TableHead>
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
                   <TableCell>
                    {/* Placeholder for future actions */}
                    <span className="text-muted-foreground text-xs">...</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
