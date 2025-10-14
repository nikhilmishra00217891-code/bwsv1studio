
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { EditableText } from "../common/EditableText";
import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from "../auth/AuthProvider";
import { getFeaturedTestimonials } from "@/lib/data/testimonials";
import type { Testimonial } from "@/types";
import { LoaderCircle } from "lucide-react";

export default function Testimonials() {
  const { textContent } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    getFeaturedTestimonials()
      .then(setTestimonials)
      .finally(() => setLoading(false));
  }, []);

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
        
        {loading ? (
            <div className="flex justify-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary"/></div>
        ) : testimonials.length > 0 ? (
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
                    {testimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-2 h-full">
                        <Card className="h-full flex flex-col">
                            <CardContent className="flex flex-col items-center text-center p-8 flex-grow">
                            <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                                <AvatarImage src={testimonial.userAvatar} alt={testimonial.userName}/>
                                <AvatarFallback>{testimonial.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-lg font-headline">{testimonial.userName}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.userGrade}</p>
                            <div className="flex text-accent my-3">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : ''}`} />)}
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
            </Carousel>
        ) : (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No student reviews have been featured yet.
                </CardContent>
            </Card>
        )}
      </div>
    </section>
  );
}
