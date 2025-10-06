
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditableImage } from "../common/EditableImage";

export default function AboutUsTeaser() {
    return (
        <section className="bg-card/50 py-20 md:py-28">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
                        <EditableImage
                            contentId="about_teaser_image"
                            src="https://placehold.co/600x400.png"
                            alt="A group of students learning together with a mentor"
                            fill
                            className="object-cover"
                            data-ai-hint="students learning together"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">
                            From the Heart of Bihar, For the Future of India
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            We are not just another ed-tech company. We are a 'Parivaar' born from a shared dream: to provide the guidance we wished we had. We teach with the heart of an elder brother, making education accessible, understandable, and empowering for every student.
                        </p>
                        <Button asChild size="lg" className="mt-8">
                            <Link href="/about">
                                Know More <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
