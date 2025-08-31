
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function CourseAnnouncementsPage() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col p-4 md:p-8">
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    <p>Course announcements will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
