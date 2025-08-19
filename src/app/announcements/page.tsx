
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isFaculty } from "@/lib/data";
import {
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncementReaction,
  type Announcement,
} from "@/lib/data/announcements";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, LoaderCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const AnnouncementForm = ({
  onNewAnnouncement,
}: {
  onNewAnnouncement: (announcement: Announcement) => void;
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      toast({ title: "Announcement posted!" });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to post announcement.",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <h2 className="text-2xl font-bold font-headline">
          Make a New Announcement
        </h2>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something important with the Parivaar..."
            rows={4}
            disabled={isLoading}
            required
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Post
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const AnnouncementCard = ({
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
    <Card className="break-inside-avoid">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage
              src={announcement.authorAvatar}
              alt={announcement.authorName}
            />
            <AvatarFallback>
              {announcement.authorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
                <p className="font-bold">{announcement.authorName}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true })}
                </p>
            </div>
            <p className="mt-2 text-foreground/90 whitespace-pre-wrap">{announcement.text}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end items-center gap-2 border-t pt-4">
        <Button 
            variant={hasReacted ? "default" : "outline"} 
            size="sm"
            onClick={() => userId && onReact(announcement.id)}
            disabled={!userId}
        >
            <Heart className={`mr-2 h-4 w-4 ${hasReacted ? 'fill-current' : ''}`} />
            {announcement.reactions.length}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function AnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const [userIsFaculty, setUserIsFaculty] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (user) {
        const facultyStatus = await isFaculty(user.uid);
        setUserIsFaculty(facultyStatus);
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

  const handleNewAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => [announcement, ...prev]);
  };

  const handleReaction = async (announcementId: string) => {
    if (!user) return;
    
    // Optimistic UI update
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
    
    // Update database
    try {
        await toggleAnnouncementReaction(announcementId, user.uid);
    } catch(error) {
        console.error("Failed to update reaction:", error);
        // Revert UI on error
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
    <div className="bg-background">
      <div className="container mx-auto max-w-4xl py-16 md:py-24 px-6 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            Announcements
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Latest updates and news from your BiharWaleSirji Parivaar.
          </p>
        </div>

        {userIsFaculty && <AnnouncementForm onNewAnnouncement={handleNewAnnouncement} />}

        <div className="space-y-6">
            {announcements.map((announcement) => (
                <AnnouncementCard 
                    key={announcement.id} 
                    announcement={announcement} 
                    userId={user?.uid ?? null}
                    onReact={handleReaction}
                />
            ))}
            {!dataLoading && announcements.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No announcements yet. Check back later!
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
