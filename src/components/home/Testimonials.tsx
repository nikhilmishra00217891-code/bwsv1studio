
import { getTestimonials } from "@/lib/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { EditableText } from "../common/EditableText";

export default async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
             <EditableText
              contentId="testimonialsTitle"
              defaultValue="What Our Students Say"
            />
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            <EditableText
              contentId="testimonialsSubtitle"
              defaultValue="Real stories from our growing Parivaar."
            />
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2 h-full">
                  <Card className="h-full flex flex-col">
                    <CardContent className="flex flex-col items-center text-center p-8 flex-grow">
                      <Avatar className="w-20 h-20 mb-4 border-4 border-primary/20">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
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
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
