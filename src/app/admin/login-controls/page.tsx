
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KeyRound, LoaderCircle, Mail, Phone } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { saveTextContent } from '@/lib/data/content';

const loginMethodsConfig = [
    { id: 'google', label: 'Google Sign-In', icon: () => (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <g>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </g>
        </svg>
    )},
    { id: 'phone', label: 'Phone Number (OTP)', icon: Phone },
    { id: 'email', label: 'Email & Password', icon: Mail },
];

export default function LoginControlsPage() {
    const { textContent, loading } = useAuth();
    const [loginMethods, setLoginMethods] = useState<Record<string, boolean>>({});
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading) {
            setLoginMethods((textContent.loginMethods as Record<string, boolean>) || {});
        }
    }, [textContent, loading]);

    const handleMethodToggle = (methodId: string, checked: boolean) => {
        const newMethods = { ...loginMethods, [methodId]: checked };
        
        // Rule: At least one login method must be enabled.
        const enabledMethods = Object.values(newMethods).filter(Boolean);
        if (enabledMethods.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Action Denied',
                description: 'At least one login method must be enabled for students.',
            });
            return;
        }
        
        setLoginMethods(newMethods);
        startTransition(async () => {
            try {
                await saveTextContent('loginMethods', newMethods);
                toast({
                    title: `Login Method Updated`,
                    description: `${methodId} has been ${checked ? 'enabled' : 'disabled'}.`,
                });
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Failed to update setting' });
                 // Revert UI state on failure
                 setLoginMethods(prev => ({...prev, [methodId]: !checked}));
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
        <div className="animate-fade-in p-4 md:p-8 space-y-8 max-w-2xl mx-auto">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Login Controls</h1>
                <p className="text-muted-foreground">Enable or disable login methods for students.</p>
            </div>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><KeyRound /> Student Login Methods</CardTitle>
                    <CardDescription>
                        Control how students can sign up or log in to the platform. Changes are applied immediately. At least one method must be enabled.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loginMethodsConfig.map(method => (
                         <div key={method.id} className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor={`method-${method.id}`} className="text-base flex items-center gap-3">
                                <method.icon />
                                {method.label}
                            </Label>
                            <Switch
                                id={`method-${method.id}`}
                                checked={loginMethods[method.id] ?? true}
                                onCheckedChange={(checked) => handleMethodToggle(method.id, checked)}
                                disabled={isPending}
                            />
                         </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
