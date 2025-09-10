
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState, useRef, useTransition } from "react";
import { cn } from "@/lib/utils";
import { EditableImage } from "../common/EditableImage";
import { useAuth } from "../auth/AuthProvider";
import { useEditMode } from "../common/EditModeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { removeAdUrls } from "@/lib/data/content";
import { LoaderCircle } from "lucide-react";

const initialAnnouncements = [
    {
        id: 1,
        contentIdPrefix: "announcement_1",
        defaultSrc: 'https://i.postimg.cc/kX2yL1B4/Parivartan-Ad-Banner.png',
        alt: 'Special Offer Announcement',
        href: '#',
        "data-ai-hint": "special offer"
    },
    {
        id: 2,
        contentIdPrefix: "announcement_2",
        defaultSrc: 'https://placehold.co/1280x720.png',
        alt: 'New Course Announcement',
        href: '/courses',
        "data-ai-hint": "new course"
    },
    {
        id: 3,
        contentIdPrefix: "announcement_3",
        defaultSrc: 'https://placehold.co/1280x720.png',
        alt: 'Live Class Announcement',
        href: '#',
        "data-ai-hint": "live class"
    },
    {
        id: 4,
        contentIdPrefix: "announcement_4",
        defaultSrc: 'https://placehold.co/1280x720.png',
        alt: 'Mock Test Series Announcement',
        href: '#',
        "data-ai-hint": "mock test"
    },
    {
        id: 5,
        contentIdPrefix: "announcement_5",
        defaultSrc: 'https://placehold.co/1280x720.png',
        alt: 'Community Event Announcement',
        href: '#',
        "data-ai-hint": "community event"
    }
]

const gradeOptions = ['General', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Competitive Exams'];

export default function AnnouncementSlider() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const { userProfile, textContent } = useAuth();
    const { isEditMode } = useEditMode();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [editingGrade, setEditingGrade] = useState('General');

    const plugin = useRef(
      Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    useEffect(() => {
        if (!api) {
          return
        }
    
        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())
    
        api.on("select", () => {
          setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    const getAdSource = (item: typeof initialAnnouncements[0]): string => {
        let gradeToShow = 'general';
        
        if (isEditMode) {
            gradeToShow = editingGrade.toLowerCase().replace(/\s+/g, '_');
        } else if (userProfile?.grade) {
            gradeToShow = userProfile.grade.toLowerCase().replace(/\s+/g, '_');
        } else if (!userProfile) {
            gradeToShow = 'general';
        }
        
        const specificContentId = `${item.contentIdPrefix}_${gradeToShow}`;
        if (textContent[specificContentId]) {
            return textContent[specificContentId] as string;
        }

        const generalContentId = `${item.contentIdPrefix}_general`;
        if (textContent[generalContentId]) {
            return textContent[generalContentId] as string;
        }

        return item.defaultSrc;
    }

    const contentIdForEditing = (contentIdPrefix: string) => {
        const gradeSlug = editingGrade.toLowerCase().replace(/\s+/g, '_');
        return `${contentIdPrefix}_${gradeSlug}`;
    }

    const handleBulkRemove = (scope: 'currentGrade' | 'all') => {
        startTransition(async () => {
            const gradeSlug = scope === 'currentGrade' ? editingGrade.toLowerCase().replace(/\s+/g, '_') : 'all';
            const { success, message } = await removeAdUrls(gradeSlug);

            if (success) {
                toast({ title: 'URLs Removed!', description: 'The advertisement URLs have been cleared.'});
                // A page refresh might be needed here to re-fetch content, or a more complex state update.
                window.location.reload();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: message });
            }
        });
    }

    const ImageContent = ({ item }: { item: typeof initialAnnouncements[0] }) => {
       const finalSrc = getAdSource(item);
       const finalContentId = contentIdForEditing(item.contentIdPrefix);

       return (
            <EditableImage
                contentId={finalContentId}
                src={finalSrc}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={item['data-ai-hint']}
            />
       )
    };


    return (
        <section className="container mx-auto px-6 -mt-16 md:-mt-24 mb-8">
            <div>
                 {isEditMode && (
                     <Card className="p-4 mb-4 max-w-lg mx-auto">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="grade-filter">Editing Ads For</Label>
                                <Select value={editingGrade} onValueChange={setEditingGrade}>
                                    <SelectTrigger id="grade-filter">
                                        <SelectValue placeholder="Select Grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeOptions.map(grade => (
                                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">
                                {editingGrade === 'General' 
                                    ? "These ads are shown to logged-out users or users without a specific ad."
                                    : `Editing ads for students in ${editingGrade}.`
                                }
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Danger Zone</Label>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full" disabled={isPending}>
                                            {isPending ? <LoaderCircle className="animate-spin" /> : `Remove All for ${editingGrade}`}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will remove all ad URLs for the "{editingGrade}" grade across all slides.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleBulkRemove('currentGrade')}>Confirm Remove</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full" disabled={isPending}>
                                            {isPending ? <LoaderCircle className="animate-spin" /> : "Remove Every URL"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>DANGER: Are you absolutely sure?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will remove ALL custom ad URLs for EVERY grade and reset the entire slider to default placeholders. This cannot be undone.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleBulkRemove('all')}>Yes, Remove Everything</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </Card>
                 )}
                 <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[plugin.current]}
                    className="w-full max-w-5xl mx-auto"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent>
                        {initialAnnouncements.map((item) => (
                             <CarouselItem key={item.id}>
                                <div className="p-1">
                                   <Card className="overflow-hidden group rounded-xl shadow-lg">
                                        <CardContent className="p-0 flex items-center justify-center aspect-[16/9] relative">
                                            {isEditMode ? (
                                                <ImageContent item={item} />
                                            ) : (
                                                <Link href={item.href} className="w-full h-full">
                                                   <ImageContent item={item} />
                                                </Link>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: count }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className={cn(
                            'h-2 w-2 rounded-full bg-primary/30 transition-all',
                            current === i ? 'w-4 bg-primary' : 'hover:bg-primary/50'
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                    ))}
                </div>
             </div>
        </section>
    );
}
