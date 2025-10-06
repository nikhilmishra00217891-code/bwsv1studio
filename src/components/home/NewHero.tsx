
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditableImage } from "../common/EditableImage";
import placeholderImages from '@/app/lib/placeholder-images.json';

export default function NewHero() {
    const { user } = useAuth();

    const openAiMentor = () => {
        document.getElementById('ai-mentor')?.click();
    }

    return (
        <section className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight leading-tight">
                        Parivaar. Pratishtha. Parivartan.
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
                        India's first platform that teaches like an elder brother, not a stranger.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button asChild size="lg">
                            <Link href="/courses">
                                Browse Courses <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" onClick={openAiMentor}>
                            Ask BWS Buddy
                        </Button>
                    </div>
                </div>
                <div className="relative w-full h-80 md:h-96">
                    <EditableImage
                        contentId="hero_image" 
                        src={placeholderImages.hero_image.src}
                        alt={placeholderImages.hero_image.alt}
                        fill
                        className="object-contain"
                        data-ai-hint={placeholderImages.hero_image['data-ai-hint']}
                        priority
                    />
                </div>
            </div>
        </section>
    )
}
