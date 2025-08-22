
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

const announcements = [
    {
        id: 1,
        src: 'https://placehold.co/1200x400.png',
        alt: 'Special Offer Announcement',
        href: '#',
        "data-ai-hint": "special offer"
    },
    {
        id: 2,
        src: 'https://placehold.co/1200x400.png',
        alt: 'New Course Announcement',
        href: '/courses',
        "data-ai-hint": "new course"
    },
    {
        id: 3,
        src: 'https://placehold.co/1200x400.png',
        alt: 'Live Class Announcement',
        href: '#',
        "data-ai-hint": "live class"
    },
    {
        id: 4,
        src: 'https://placehold.co/1200x400.png',
        alt: 'Mock Test Series Announcement',
        href: '#',
        "data-ai-hint": "mock test"
    }
]

export default function AnnouncementSlider() {
    return (
        <section className="container mx-auto px-6">
             <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 5000,
                        stopOnInteraction: true,
                    }),
                ]}
                className="w-full max-w-5xl mx-auto"
            >
                <CarouselContent>
                    {announcements.map((item) => (
                         <CarouselItem key={item.id}>
                            <div className="p-1">
                               <Card className="overflow-hidden group">
                                    <CardContent className="p-0 flex items-center justify-center aspect-[3/1] relative">
                                        <Link href={item.href} className="w-full h-full">
                                            <Image
                                                src={item.src}
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
                 <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
                 <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
            </Carousel>
        </section>
    );
}
