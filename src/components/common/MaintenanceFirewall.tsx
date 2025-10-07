
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../auth/AuthProvider";
import { LogOut, Wrench, KeyRound, LoaderCircle } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const BYPASS_SECRET_KEY = "BWS@Faculty#2024";

export default function MaintenanceFirewall() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [bypassKey, setBypassKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleBypass = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (bypassKey === BYPASS_SECRET_KEY) {
            toast({
                title: "Access Granted",
                description: "Redirecting to login page.",
            });
            // Redirect to login with a special query param
            router.push('/login?bypass=true');
        } else {
            toast({
                variant: "destructive",
                title: "Incorrect Key",
                description: "The secret key is incorrect.",
            });
            setIsLoading(false);
        }
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
                    {user ? (
                        <Button onClick={handleLogout} className="mt-6 w-full" variant="outline">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    ) : (
                        <form onSubmit={handleBypass} className="mt-8 pt-6 border-t">
                            <Label htmlFor="bypass-key" className="text-sm font-semibold text-muted-foreground">Faculty Bypass</Label>
                             <div className="relative mt-2 max-w-sm mx-auto flex items-center gap-2">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="bypass-key"
                                    type="password"
                                    placeholder="Enter bypass key..."
                                    value={bypassKey}
                                    onChange={(e) => setBypassKey(e.target.value)}
                                    required
                                    className="pl-10 h-11"
                                />
                                 <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Enter'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
