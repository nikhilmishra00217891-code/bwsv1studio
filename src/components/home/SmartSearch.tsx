
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BrainCircuit } from "lucide-react";

const quickFilters = ["Maths", "Physics", "Notes", "Mock Tests", "Doubts", "Focus Mode"];

export default function SmartSearch() {
    const [query, setQuery] = useState("");

    return (
        <section className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                        placeholder="What do you want to master today?"
                        className="pl-12 h-14 text-lg rounded-full shadow-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button 
                        size="lg" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                        // onClick={handleSearch} - future implementation
                    >
                        <BrainCircuit className="md:mr-2" />
                        <span className="hidden md:inline">Ask AI</span>
                    </Button>
                </div>
                 <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    {quickFilters.map(filter => (
                        <Button key={filter} variant="outline" size="sm" className="rounded-full">
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
}
