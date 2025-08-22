
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Video, GraduationCap, Percent } from "lucide-react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

const announcements = [
    {
        id: 1,
        type: 'live_class',
        title: 'Live Class: Master Thermodynamics',
        subtitle: 'With Rajesh Sir - Today @ 7 PM',
        cta: 'Join Now',
        link: '#',
        icon: Video,
        color: 'bg-blue-500',
    },
    {
        id: 2,
        type: 'new_course',
        title: 'New Course Added: Organic Chemistry',
        subtitle: 'Full course with notes and practice tests.',
        cta: 'Explore Course',
        link: '/courses',
        icon: GraduationCap,
        color: 'bg-green-500',
    },
    {
        id: 3,
        type: 'offer',
        title: 'Diwali Offer: 20% Off All Courses',
        subtitle: 'Use code DIWALI20. Valid till Nov 15.',
        cta: 'Claim Offer',
        link: '/courses',
        icon: Percent,
        color: 'bg-orange-500',
    },
    {
        id: 4,
        type: 'announcement',
        title: 'New Mock Test Series Launched',
        subtitle: 'Prepare for your board exams with our new test series.',
        cta: 'View Tests',
        link: '#',
        icon: Bell,
        color: 'bg-purple-500',
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
                    {announcements.map((item) => {
                        const Icon = item.icon;
                        return (
                             <CarouselItem key={item.id} className="md:basis-1/2">
                                <div className="p-1">
                                <Card className="overflow-hidden group">
                                    <CardContent className="p-0 flex items-center">
                                        <div className={`p-6 ${item.color} text-white`}>
                                             <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="p-4 flex-grow">
                                            <h3 className="font-bold font-headline">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                        </div>
                                        <div className="p-4">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={item.link}>
                                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
