
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Swords, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const modes = [
    {
        icon: User,
        title: "Solo Mode",
        description: "Hone your skills against the clock in a personalized training ground.",
        href: "/warzone/setup",
        isReady: true,
    },
    {
        icon: Swords,
        title: "1v1 Duel",
        description: "Challenge a friend or a random opponent in a real-time knowledge battle.",
        href: "#",
        isReady: false,
    },
    {
        icon: Users,
        title: "Multiplayer",
        description: "Join forces with your Parivaar in epic team-based quiz battles.",
        href: "/warzone/lobby",
        isReady: true,
    }
];

export default function WarzoneSelectionPage() {
    return (
        <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-20 md:py-28 animate-fade-in">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Welcome to the Warzone</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Choose your battle. Sharpen your skills, challenge your friends, or conquer as a team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {modes.map((mode) => {
                        const cardContent = (
                             <Card className={cn(
                                "h-full flex flex-col text-center overflow-hidden transition-all duration-300",
                                mode.isReady ? "group hover:shadow-lg hover:-translate-y-1 hover:border-primary/50" : "opacity-60 cursor-not-allowed"
                             )}>
                                <CardHeader className="items-center">
                                    <div className="bg-primary/10 p-5 rounded-full mb-4">
                                        <mode.icon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="relative">
                                        <CardTitle className="font-headline text-3xl">{mode.title}</CardTitle>
                                        {!mode.isReady && (
                                            <Badge className="absolute -top-2 -right-2 -translate-x-1/2 -translate-y-1/2 rotate-12">
                                                Coming Soon
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow p-6 pt-0">
                                    <p className="text-muted-foreground flex-grow">{mode.description}</p>
                                    <div className={cn(
                                        "flex items-center justify-center font-semibold text-primary mt-6",
                                        !mode.isReady && "invisible"
                                    )}>
                                        Enter Arena <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        );

                        if (mode.isReady) {
                            return <Link href={mode.href} key={mode.title} className="block">{cardContent}</Link>
                        }
                        
                        return <div key={mode.title}>{cardContent}</div>;
                    })}
                </div>
            </div>
        </div>
    );
}
