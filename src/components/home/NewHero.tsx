"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BookCheck, Flame, Sun, Sunset, Moon, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ProgressCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: React.ElementType, color: string }) => (
    <Card className="bg-background/50 backdrop-blur-sm p-4 flex-1">
        <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-lg", color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
        </div>
    </Card>
);

export default function NewHero() {
    const { user, userProfile } = useAuth();
    const [greeting, setGreeting] = useState({ text: 'Welcome', icon: Sun });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting({ text: 'Good Morning', icon: Sun });
        } else if (hour < 18) {
            setGreeting({ text: 'Good Afternoon', icon: Sunset });
        } else {
            setGreeting({ text: 'Good Evening', icon: Moon });
        }
    }, []);

    const GreetingIcon = greeting.icon;

    return (
        <section className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                     <GreetingIcon className="w-8 h-8 text-amber-500"/>
                     <h1 className="text-3xl md:text-4xl font-bold font-headline">
                        {greeting.text}, {userProfile?.displayName || 'Achiever'}!
                     </h1>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <ProgressCard label="Today's Target" value="Revise Chapter 5" icon={Target} color="bg-blue-500" />
                    <ProgressCard label="Current Streak" value="12 Days" icon={Flame} color="bg-orange-500" />
                    <ProgressCard label="Courses Completed" value="3 Courses" icon={BookCheck} color="bg-green-500" />
                </div>
            </div>
        </section>
    )
}