
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { EditableText } from "../common/EditableText";
import { EditableImage } from "../common/EditableImage";
import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from "../auth/AuthProvider";

const staticTestimonials = [
  {
    id: "t1",
    name: "Aman Kumar",
    role: "JEE Aspirant",
    avatar: "https://i.postimg.cc/d1W1VcYF/aman-kumar.png",
    text: "BiharWaleSirji feels like learning from an elder brother. The concepts are explained so clearly, and the AI mentor is a game-changer for late-night doubts!",
  },
  {
    id: "t2",
    name: "Sunita Singh",
    role: "NEET Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "The personal touch is what makes this platform special. Priya Didi's biology course is fantastic. I finally feel confident in my preparation.",
  },
  {
    id: "t3",
    name: "Rajesh Mahto",
    role: "BPSC Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "Finally, a platform that understands students from Bihar. The teaching style is relatable, and the content is top-notch. Highly recommended.",
  },
   {
    id: "t4",
    name: "Priya Sharma",
    role: "Class 12 Student",
    avatar: "https://placehold.co/100x100.png",
    text: "The Warzone feature made studying competitive and fun! I never thought I'd be challenging my friends to solve physics problems at 10 PM.",
  },
  {
    id: "t5",
    name: "Vikram Reddy",
    role: "JEE Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "I improved my mock test scores from 70% to 92% in just two months. The detailed analysis and targeted practice questions are incredibly helpful.",
  },
];

export default function Testimonials() {
  const { textContent } = useAuth();
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <section className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
             <EditableText
              contentId="testimonialsTitle"
              defaultValue={textContent.testimonialsTitle || "What Our Students Say"}
              onSave={() => {}}
            />
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            <EditableText
              contentId="testimonialsSubtitle"
              defaultValue={textContent.testimonialsSubtitle || "Real stories from our growing Parivaar."}
              onSave={() => {}}
            />
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {staticTestimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2 h-full">
                  <Card className="h-full flex flex-col">
                    <CardContent className="flex flex-col items-center text-center p-8 flex-grow">
                      <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                        <EditableImage
                            contentId={`testimonial_avatar_${testimonial.id}`}
                            defaultSrc={textContent[`testimonial_avatar_${testimonial.id}`] || testimonial.avatar} 
                            alt={testimonial.name}
                            width={80}
                            height={80}
                            className="rounded-full"
                        />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-lg font-headline">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <div className="flex text-accent my-3">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                      </div>
                      <p className="text-foreground/80 italic mt-2 flex-grow">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Hide default buttons to rely on autoplay and swipe */}
        </Carousel>
      </div>
    </section>
  );
}
