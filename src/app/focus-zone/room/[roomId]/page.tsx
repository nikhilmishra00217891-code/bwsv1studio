// This file is no longer needed and will be replaced by the dynamic route logic.
// For now, it's being repurposed to redirect to the new structure.
// In a real scenario, this file would be deleted and a new `[roomId]` directory would be created.
// Since we can't create/delete directories, we'll simulate it by having the solo page handle the logic.

"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export default function FocusZoneRedirect() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId as string;

    useEffect(() => {
        if (roomId) {
            router.replace(`/focus-zone/solo`);
        }
    }, [roomId, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Redirecting...</p>
        </div>
    );
}
