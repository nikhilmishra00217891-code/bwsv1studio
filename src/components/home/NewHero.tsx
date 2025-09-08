
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NewHero() {
    const { user } = useAuth();

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
                        <Button asChild size="lg" variant="outline">
                            <Link href="#ai-mentor">
                                Ask BWS Buddy
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="relative w-full h-80 md:h-96">
                    <Image 
                        src="https://i.postimg.cc/kG8f4k5K/DALL-E-2024-05-15-13-11-13-A-vibrant-and-inspiring-illustration-for-an-educational-platform-named-B.png"
                        alt="An inspiring illustration of a student learning with a mentor"
                        fill
                        className="object-contain"
                        data-ai-hint="inspiring education mentor"
                    />
                </div>
            </div>
        </section>
    )
}
