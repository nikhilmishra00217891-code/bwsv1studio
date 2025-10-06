
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EditableImage } from "../common/EditableImage";
import placeholderImages from '@/app/lib/placeholder-images.json';
import { EditableText } from "../common/EditableText";
import { useAuth } from "../auth/AuthProvider";

export default function AboutUsTeaser() {
    const { textContent } = useAuth();
    return (
        <section className="bg-card/50 py-20 md:py-28">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
                        <EditableImage
                            contentId="about_teaser_image"
                            defaultSrc={placeholderImages.about_teaser_image.src}
                            alt={placeholderImages.about_teaser_image.alt}
                            fill
                            className="object-cover"
                            data-ai-hint={placeholderImages.about_teaser_image['data-ai-hint']}
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">
                             <EditableText
                                contentId="about_teaser_title"
                                defaultValue={textContent.about_teaser_title || "From the Heart of Bihar, For the Future of India"}
                                onSave={() => {}}
                            />
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                             <EditableText
                                contentId="about_teaser_desc"
                                defaultValue={textContent.about_teaser_desc || "We are not just another ed-tech company. We are a 'Parivaar' born from a shared dream: to provide the guidance we wished we had. We teach with the heart of an elder brother, making education accessible, understandable, and empowering for every student."}
                                onSave={() => {}}
                                multiline
                            />
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
