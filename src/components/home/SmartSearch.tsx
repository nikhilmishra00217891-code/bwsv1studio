
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BrainCircuit } from "lucide-react";

export default function SmartSearch() {
    const [query, setQuery] = useState("");

    return (
        <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
                placeholder="What do you want to master today?"
                className="pl-12 h-12 text-base rounded-full shadow-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9"
                // onClick={handleSearch} - future implementation
            >
                <BrainCircuit className="w-5 h-5" />
                <span className="sr-only">Ask AI</span>
            </Button>
        </div>
    );
}
