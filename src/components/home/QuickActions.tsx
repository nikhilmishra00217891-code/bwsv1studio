
"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Brain, FileText, LucideIcon, Target, Users, Bot, Swords } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActionItem {
  title: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const actions: ActionItem[] = [
    { title: "Ask Doubt", icon: Bot, href: "#ask-doubt", color: "bg-blue-500/20 text-blue-500" },
    { title: "My Notes", icon: FileText, href: "#notes", color: "bg-orange-500/20 text-orange-500" },
    { title: "Focus Zone", icon: Target, href: "/focus-zone", color: "bg-green-500/20 text-green-500" },
    { title: "Warzone", icon: Swords, href: "#warzone", color: "bg-red-500/20 text-red-500" },
    { title: "Parivartan Chamber", icon: Users, href: "#study-groups", color: "bg-purple-500/20 text-purple-500" },
    { title: "Mock Tests", icon: Brain, href: "#mock-tests", color: "bg-yellow-500/20 text-yellow-500" },
];

const ActionCard = ({ action }: { action: ActionItem }) => (
    <Link href={action.href} className="block w-40 flex-shrink-0">
        <Card className="h-full group transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center p-4 h-full text-center">
                <div className={cn("p-4 rounded-full mb-3", action.color)}>
                    <action.icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold">{action.title}</h4>
            </div>
        </Card>
    </Link>
)

export default function QuickActions() {
    return (
        <section className="container mx-auto px-0 md:px-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Your Toolkit</h2>
                <p className="text-lg text-muted-foreground mt-2">Instant access to your most-used features.</p>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 p-4">
                    {actions.map((action, index) => (
                        <ActionCard key={index} action={action} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </section>
    );
}
