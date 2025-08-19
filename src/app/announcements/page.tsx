
"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isFaculty } from "@/lib/data";
import {
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncementReaction,
} from "@/lib/data/announcements";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, LoaderCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

const AnnouncementInput = ({
  onNewAnnouncement,
}: {
  onNewAnnouncement: (announcement: Announcement) => void;
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setIsLoading(true);
    try {
      const newAnnouncement = await createAnnouncement({
        text,
        authorId: user.uid,
        authorName: user.displayName || "Faculty",
        authorAvatar: user.photoURL || "",
      });
      onNewAnnouncement(newAnnouncement);
      setText("");
      if(textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
      toast({ title: "Announcement sent!" });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to send announcement.",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
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
  userId,
  onReact,
}: {
  announcement: Announcement;
  userId: string | null;
  onReact: (id: string) => void;
}) => {
  const hasReacted = userId ? announcement.reactions.includes(userId) : false;

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
                    onClick={() => userId && onReact(announcement.id)}
                    disabled={!userId}
                >
                    <Heart className={cn("h-4 w-4", hasReacted && 'fill-red-500 text-red-500')} />
                    <span className="sr-only">React</span>
                </Button>
            </div>
             {announcement.reactions.length > 0 && (
                <div className="mt-2 ml-2 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="text-xs text-muted-foreground">{announcement.reactions.length}</span>
                </div>
             )}
        </div>
     </div>
  );
};

export default function AnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const [userIsFaculty, setUserIsFaculty] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
        setDataLoading(true);
        if (user) {
            const facultyStatus = await isFaculty(user.uid);
            setUserIsFaculty(facultyStatus);
        } else {
            setUserIsFaculty(false);
        }
        try {
            const fetchedAnnouncements = await getAnnouncements();
            setAnnouncements(fetchedAnnouncements);
        } catch (error) {
            console.error("Failed to fetch announcements:", error)
        } finally {
            setDataLoading(false);
        }
    };
    if (!authLoading) {
      fetchInitialData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [announcements]);

  const handleNewAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => [...prev, announcement]);
  };

  const handleReaction = async (announcementId: string) => {
    if (!user) return;
    
    const originalAnnouncements = [...announcements];
    const newAnnouncements = announcements.map(a => {
        if (a.id === announcementId) {
            const reacted = a.reactions.includes(user.uid);
            const newReactions = reacted 
                ? a.reactions.filter(uid => uid !== user.uid)
                : [...a.reactions, user.uid];
            return {...a, reactions: newReactions};
        }
        return a;
    });
    setAnnouncements(newAnnouncements);
    
    try {
        await toggleAnnouncementReaction(announcementId, user.uid);
    } catch(error) {
        console.error("Failed to update reaction:", error);
        setAnnouncements(originalAnnouncements);
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
                        userId={user?.uid ?? null}
                        onReact={handleReaction}
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

    