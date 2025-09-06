
'use client';

import React, { Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';
import { FocusZoneTimer } from '@/components/focus/FocusZoneTimer';

// This is now the dedicated page for the SOLO focus zone experience.
const FocusZoneSoloUI = () => {
    return (
        <div className="min-h-screen bg-card/50 py-16 md:py-24 animate-fade-in flex flex-col">
            <div className="container mx-auto px-6 flex-grow">
                 <div className="grid lg:grid-cols-3 gap-12 items-start">
                     <div className="lg:col-span-2">
                        <FocusZoneTimer isMultiplayer={false} />
                    </div>
                     <div className="hidden lg:block">
                        {/* Placeholder for potential solo-mode specific widgets in the future */}
                     </div>
                 </div>
            </div>
        </div>
    );
};


export default function FocusZoneSoloPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <FocusZoneSoloUI />
        </Suspense>
    )
}
