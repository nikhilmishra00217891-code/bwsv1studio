
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

const initialAnnouncements = [
    {
        id: 1,
        contentId: "announcement_1_image",
        defaultSrc: 'https://placehold.co/1200x400.png',
        alt: 'Special Offer Announcement',
        href: '#',
        "data-ai-hint": "special offer"
    },
    {
        id: 2,
        contentId: "announcement_2_image",
        defaultSrc: 'https://placehold.co/1200x400.png',
        alt: 'New Course Announcement',
        href: '/courses',
        "data-ai-hint": "new course"
    },
    {
        id: 3,
        contentId: "announcement_3_image",
        defaultSrc: 'https://placehold.co/1200x400.png',
        alt: 'Live Class Announcement',
        href: '#',
        "data-ai-hint": "live class"
    },
    {
        id: 4,
        contentId: "announcement_4_image",
        defaultSrc: 'https://placehold.co/1200x400.png',
        alt: 'Mock Test Series Announcement',
        href: '#',
        "data-ai-hint": "mock test"
    },
    {
        id: 5,
        contentId: "announcement_5_image",
        defaultSrc: 'https://placehold.co/1200x400.png',
        alt: 'Community Event Announcement',
        href: '#',
        "data-ai-hint": "community event"
    }
]

export default function AnnouncementSlider() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const { textContent } = useAuth();

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


    return (
        <section className="container mx-auto px-6 -mt-16 md:-mt-24 mb-8">
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
                                    <CardContent className="p-0 flex items-center justify-center aspect-[3/1] relative">
                                        <Link href={item.href} className="w-full h-full">
                                            <EditableImage
                                                contentId={item.contentId}
                                                src={textContent[item.contentId] as string || item.defaultSrc}
                                                alt={item.alt}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint={item['data-ai-hint']}
                                            />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {Array.from({ length: count }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className={cn(
                            'h-2 w-2 rounded-full bg-white/50 transition-all',
                            current === i ? 'w-4 bg-white' : 'hover:bg-white/75'
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                    ))}
                </div>
            </Carousel>
        </section>
    );
}
