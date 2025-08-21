
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "./AuthProvider";
import { LogOut, ShieldBan } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SuspendedAccountFirewall({ reason }: { reason: string }) {
    const { user } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-destructive/10 p-6">
            <Card className="w-full max-w-lg text-center border-destructive shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
                        <ShieldBan className="h-16 w-16 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-destructive">Account Suspended</CardTitle>
                    <CardDescription>
                        Your access to BiharWaleSirji has been temporarily revoked.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="font-semibold">Reason for Suspension:</p>
                        <p className="text-muted-foreground mt-2">{reason || "No reason provided."}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-6">
                        If you believe this is a mistake, please contact our support team.
                    </p>
                    <Button onClick={handleLogout} className="mt-6 w-full" variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
