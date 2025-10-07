
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wrench, LoaderCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { saveTextContent } from '@/lib/data/content';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
    const { textContent, loading } = useAuth();
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading) {
            setIsMaintenanceMode(!!textContent.isMaintenanceMode);
        }
    }, [textContent, loading]);

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            try {
                await saveTextContent('isMaintenanceMode', checked);
                setIsMaintenanceMode(checked);
                toast({
                    title: `Maintenance Mode ${checked ? 'Enabled' : 'Disabled'}`,
                    description: checked
                        ? "Non-faculty users will now see the maintenance page."
                        : "The app is now live for all users.",
                });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Failed to update status' });
            }
        });
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
            </div>
        )
    }

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Maintenance Controls</h1>
                <p className="text-muted-foreground">Enable or disable the maintenance firewall for the entire application.</p>
            </div>
            <Card className={cn("max-w-2xl mx-auto shadow-lg", isMaintenanceMode && "border-destructive")}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Wrench /> App Maintenance Status</CardTitle>
                    <CardDescription>
                        When enabled, all non-faculty users will see a maintenance page and will not be able to access the app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4 bg-background">
                        <Label htmlFor="maintenance-mode" className="text-base font-bold">
                            {isMaintenanceMode ? "Maintenance Mode is ON" : "Maintenance Mode is OFF"}
                        </Label>
                        <Switch
                            id="maintenance-mode"
                            checked={isMaintenanceMode}
                            onCheckedChange={handleToggle}
                            disabled={isPending}
                            className="data-[state=checked]:bg-destructive"
                        />
                    </div>
                     {isPending && (
                        <div className="flex items-center gap-2 text-muted-foreground mt-4 text-sm">
                            <LoaderCircle className="animate-spin w-4 h-4"/>
                            Updating status...
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
