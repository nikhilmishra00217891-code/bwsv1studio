
"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  listenForAnnouncements,
  createAnnouncement,
  toggleAnnouncementReaction,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/data/announcements";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, LoaderCircle, Send, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const AnnouncementInput = ({
  onNewAnnouncement,
}: {
  onNewAnnouncement: (text: string) => Promise<void>;
}) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    await onNewAnnouncement(text);
    setText("");
    if(textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
    setIsLoading(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${e.target.scrollHeight}px`;
      }
  }

  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4">
         <form onSubmit={handleSubmit} className="flex items-start gap-4 max-w-4xl mx-auto">
            <Textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                placeholder="Type your announcement..."
                rows={1}
                disabled={isLoading}
                required
                className="max-h-40 resize-none"
            />
            <Button type="submit" size="icon" disabled={isLoading || !text.trim()}>
                {isLoading ? <LoaderCircle className="animate-spin" /> : <Send />}
                 <span className="sr-only">Send</span>
            </Button>
        </form>
    </div>
  );
};

const AnnouncementBubble = ({
  announcement,
  currentUserId,
  isCurrentUserFaculty,
  onReact,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  currentUserId: string | null;
  isCurrentUserFaculty: boolean;
  onReact: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}) => {
  const hasReacted = currentUserId ? announcement.reactions.includes(currentUserId) : false;
  const canEdit = isCurrentUserFaculty && announcement.authorId === currentUserId;
  
  const [editText, setEditText] = useState(announcement.text);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== announcement.text) {
      onEdit(announcement.id, editText);
    }
    setIsEditing(false);
  }

  return (
     <div className="flex items-start gap-3 my-4">
        <Avatar className="w-10 h-10 border">
            <AvatarImage
              src={announcement.authorAvatar}
              alt={announcement.authorName}
            />
            <AvatarFallback>
              {announcement.authorName.charAt(0)}
            </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <div className="bg-card p-3 rounded-lg rounded-tl-none shadow-sm relative group max-w-xl">
                <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-primary text-sm">{announcement.authorName}</p>
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap">{announcement.text}</p>
                 {announcement.updatedAt && (
                    <p className="text-xs text-muted-foreground italic mt-1">(edited)</p>
                )}
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-2">
                     <p>
                        {announcement.createdAt ? formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </p>
                </div>
                 <Button 
                    variant="outline"
                    size="icon"
                    className={cn(
                        "absolute -bottom-4 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                        hasReacted && "opacity-100"
                    )}
                    onClick={() => currentUserId && onReact(announcement.id)}
                    disabled={!currentUserId}
                >
                    <Heart className={cn("h-4 w-4", hasReacted && 'fill-red-500 text-red-500')} />
                    <span className="sr-only">React</span>
                </Button>
                 {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> 
                                    <span className="text-destructive">Delete</span>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>This will permanently delete the announcement. This action cannot be undone.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(announcement.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
             {announcement.reactions.length > 0 && (
                <div className="mt-2 ml-2 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="text-xs text-muted-foreground">{announcement.reactions.length}</span>
                </div>
             )}
        </div>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
                <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[120px]" />
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleEditSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
     </div>
  );
};

export default function AnnouncementsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [userIsFaculty, setUserIsFaculty] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    
    setUserIsFaculty(userProfile?.role === 'faculty');

    setDataLoading(true);
    const unsubscribe = listenForAnnouncements((newAnnouncements) => {
        setAnnouncements(newAnnouncements);
        setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile, authLoading]);

  useEffect(() => {
    // Scroll to bottom when announcements change
    const timer = setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 100); // Small delay to allow DOM to update
    return () => clearTimeout(timer);
  }, [announcements]);

  const handleNewAnnouncement = async (text: string) => {
    if (!user) return;
    try {
      await createAnnouncement({
        text,
        authorId: user.uid,
        authorName: user.displayName || "Faculty",
        authorAvatar: user.photoURL || "",
      });
      toast({ title: "Announcement sent!" });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to send announcement.",
        description: "Please try again later.",
      });
    }
  };

  const handleReaction = async (announcementId: string) => {
    if (!user) return;
    try {
        await toggleAnnouncementReaction(announcementId, user.uid);
    } catch(error) {
        console.error("Failed to update reaction:", error);
        toast({variant: 'destructive', title: 'Reaction failed', description: 'Could not save your reaction.'});
    }
  }

  const handleEdit = async (announcementId: string, newText: string) => {
      try {
          await updateAnnouncement(announcementId, newText);
          toast({title: "Announcement updated!"});
      } catch (error) {
          console.error("Failed to edit announcement", error);
          toast({variant: 'destructive', title: 'Update Failed', description: 'Could not save your changes.'});
      }
  }
  
  const handleDelete = async (announcementId: string) => {
      try {
          await deleteAnnouncement(announcementId);
          toast({title: "Announcement deleted."});
      } catch (error) {
          console.error("Failed to delete announcement", error);
          toast({variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the announcement.'});
      }
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-card/50">
        <div className="bg-background/80 backdrop-blur-sm border-b p-4 text-center sticky top-16 z-10">
            <h1 className="text-xl font-bold font-headline">
                Parivaar Announcements
            </h1>
            <p className="text-sm text-muted-foreground">
                Official channel for all updates.
            </p>
        </div>
      
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
             <div className="container mx-auto max-w-4xl animate-fade-in">
                {announcements.map((announcement) => (
                    <AnnouncementBubble 
                        key={announcement.id} 
                        announcement={announcement} 
                        currentUserId={user?.uid ?? null}
                        isCurrentUserFaculty={userIsFaculty}
                        onReact={handleReaction}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
                {!dataLoading && announcements.length === 0 && (
                    <Card className="mt-8">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No announcements yet. The channel is quiet.
                        </CardContent>
                    </Card>
                )}
            </div>
        </ScrollArea>
        {userIsFaculty && <AnnouncementInput onNewAnnouncement={handleNewAnnouncement} />}
    </div>
  );
}
