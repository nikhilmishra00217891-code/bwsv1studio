
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
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { EditableImage } from "../common/EditableImage";
import { useAuth } from "../auth/AuthProvider";
import { useEditMode } from "../common/EditModeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

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

    const getAdSource = (contentIdPrefix: string, defaultSrc: string) => {
        let gradeToShow = 'general';
        if (isEditMode) {
            gradeToShow = editingGrade.toLowerCase().replace(/\s+/g, '_');
        } else if (userProfile?.grade) {
            gradeToShow = userProfile.grade.toLowerCase().replace(/\s+/g, '_');
        }

        // 1. Try to get the grade-specific ad
        const specificContentId = `${contentIdPrefix}_${gradeToShow}`;
        if (textContent[specificContentId]) {
            return textContent[specificContentId] as string;
        }

        // 2. Fallback to the general ad for THIS slide
        const generalContentId = `${contentIdPrefix}_general`;
        if (textContent[generalContentId]) {
            return textContent[generalContentId] as string;
        }

        // 3. Fallback to the default placeholder for THIS slide
        return defaultSrc;
    }
    
    const contentIdForEditing = (contentIdPrefix: string) => {
        const gradeSlug = editingGrade.toLowerCase().replace(/\s+/g, '_');
        return `${contentIdPrefix}_${gradeSlug}`;
    }

    const ImageContent = ({ item }: { item: typeof initialAnnouncements[0] }) => (
        <EditableImage
            contentId={contentIdForEditing(item.contentIdPrefix)}
            src={getAdSource(item.contentIdPrefix, item.defaultSrc)}
            alt={item.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={item['data-ai-hint']}
        />
    );


    return (
        <section className="container mx-auto px-6 -mt-16 md:-mt-24 mb-8">
            <div>
                 {isEditMode && (
                     <Card className="p-4 mb-4 max-w-sm mx-auto">
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
