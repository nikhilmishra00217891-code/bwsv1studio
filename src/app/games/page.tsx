
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "BWS Games - BiharWaleSirji",
    description: "Play fun and educational games to sharpen your mind.",
}

const games = [
    {
        title: "Word Fall",
        description: "Form words from falling letters. A fun test of vocabulary and speed.",
        href: "/games/word-fall",
        icon: Gamepad2,
        thumbnail: "https://placehold.co/600x400.png"
    }
];

export default function GamesPage() {
    return (
        <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-20 md:py-28 animate-fade-in">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">BWS Games</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Learning can be fun! Sharpen your mind with our collection of educational games.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {games.map((game) => (
                       <Link href={game.href} key={game.title} className="block group">
                         <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="relative w-full h-48">
                                <Image 
                                    src={game.thumbnail} 
                                    alt={`${game.title} game thumbnail`} 
                                    layout="fill" 
                                    objectFit="cover" 
                                    className="transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="gaming abstract"
                                />
                            </div>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <game.icon className="w-6 h-6 text-primary"/>
                                    <CardTitle className="font-headline text-2xl">{game.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                                <p className="text-muted-foreground flex-grow">{game.description}</p>
                                <div className="flex items-center justify-end font-semibold text-primary mt-4">
                                    Play Now <ArrowRight className="ml-2 h-5 w-5" />
                                </div>
                            </CardContent>
                        </Card>
                       </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
