

"use client";

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wrench, LoaderCircle, KeyRound, Bot, Target, Swords, Users, Gamepad2, Compass } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { saveTextContent } from '@/lib/data/content';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const featureFlagsConfig = [
    { id: 'aiMentor', label: 'AI Mentor (BWS Buddy)', icon: Bot },
    { id: 'courses', label: 'Courses Page', icon: Compass },
    { id: 'focusZone', label: 'Focus Zone', icon: Target },
    { id: 'warzone', label: 'Warzone (Quizzes)', icon: Swords },
    { id: 'parivartan', label: 'Parivartan Chamber', icon: Users },
    { id: 'games', label: 'BWS Games', icon: Gamepad2 },
];

export default function MaintenancePage() {
    const { textContent, loading } = useAuth();
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            setIsMaintenanceMode(!!textContent.isMaintenanceMode);
            setFeatureFlags(textContent.featureFlags || {});
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

    const handleFeatureToggle = (featureId: string, checked: boolean) => {
        const newFlags = { ...featureFlags, [featureId]: checked };
        setFeatureFlags(newFlags);
        startTransition(async () => {
            try {
                await saveTextContent('featureFlags', newFlags);
                toast({
                    title: `Feature Updated`,
                    description: `${featureId} has been ${checked ? 'enabled' : 'disabled'}.`,
                });
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Failed to update feature' });
                 // Revert UI state on failure
                 setFeatureFlags(prev => ({...prev, [featureId]: !checked}));
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
        <div className="animate-fade-in p-4 md:p-8 space-y-8">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Maintenance & Feature Controls</h1>
                <p className="text-muted-foreground">Enable site-wide maintenance or toggle individual features for students.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className={cn("shadow-lg", isMaintenanceMode && "border-destructive")}>
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

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Feature Flags</CardTitle>
                        <CardDescription>
                            Enable or disable specific features for student accounts. Changes are applied in real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {featureFlagsConfig.map(feature => (
                             <div key={feature.id} className="flex items-center justify-between rounded-lg border p-4">
                                <Label htmlFor={`feature-${feature.id}`} className="text-base flex items-center gap-3">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                    {feature.label}
                                </Label>
                                <Switch
                                    id={`feature-${feature.id}`}
                                    checked={featureFlags[feature.id] ?? true}
                                    onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                                    disabled={isPending}
                                />
                             </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
