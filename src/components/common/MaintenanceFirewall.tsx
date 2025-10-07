
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../auth/AuthProvider";
import { LogOut, Wrench } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function MaintenanceFirewall() {
    const { user } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
            <Card className="w-full max-w-lg text-center border-primary/50 shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Wrench className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary">Under Maintenance</CardTitle>
                    <CardDescription>
                        Our platform is currently undergoing scheduled maintenance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mt-2">
                        We're working hard to improve your learning experience. We'll be back online shortly. Thank you for your patience!
                    </p>
                    {user && (
                        <Button onClick={handleLogout} className="mt-6 w-full" variant="outline">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
