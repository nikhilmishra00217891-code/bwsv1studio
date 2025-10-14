
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, KeyRound, LoaderCircle, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveRazorpayKeys } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentsPage() {
    const { textContent, loading } = useAuth();
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [isSaving, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading) {
            setKeyId(textContent.razorpayKeyId as string || '');
            // We never display the secret, only check if it exists
            if (textContent.razorpayKeySecret) {
                setKeySecret('******************');
            }
        }
    }, [textContent, loading]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
             // Only update the secret if it has been changed from the placeholder
            const secretToSave = keySecret === '******************' ? textContent.razorpayKeySecret as string : keySecret;
            
            if (!keyId.trim() || !secretToSave.trim()) {
                toast({
                    variant: 'destructive',
                    title: 'Missing Keys',
                    description: 'Please provide both Key ID and Key Secret.'
                });
                return;
            }
            
            const { success, message } = await saveRazorpayKeys({ keyId, keySecret: secretToSave });
            
            if (success) {
                toast({ title: 'Settings Saved', description: 'Your Razorpay keys have been updated.'});
                if (keySecret !== '******************') {
                    setKeySecret('******************'); // Mask the secret again after saving
                }
            } else {
                toast({ variant: 'destructive', title: 'Save Failed', description: message });
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
        <div className="animate-fade-in p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Payment Settings</h1>
                <p className="text-muted-foreground">Manage payment gateway integrations for your platform.</p>
            </div>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-primary" />
                        <CardTitle>Razorpay Integration</CardTitle>
                    </div>
                    <CardDescription>
                        Enter your API keys from the Razorpay dashboard to enable payments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="keyId">Key ID</Label>
                             <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="keyId"
                                    placeholder="rzp_live_..."
                                    value={keyId}
                                    onChange={(e) => setKeyId(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="keySecret">Key Secret</Label>
                             <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="keySecret"
                                    type={showSecret ? 'text' : 'password'}
                                    placeholder="Your secret key"
                                    value={keySecret}
                                    onChange={(e) => setKeySecret(e.target.value)}
                                    className="pl-10 pr-12"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowSecret(!showSecret)}
                                >
                                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        
                         <Alert variant="destructive">
                            <AlertTitle>Security Warning</AlertTitle>
                            <AlertDescription>
                                Your Key Secret is highly sensitive. Do not share it or expose it in your frontend code. These keys are stored securely on the server.
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Keys
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
