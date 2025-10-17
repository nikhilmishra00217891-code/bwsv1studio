
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram, LoaderCircle, Mail, MessageSquare, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveTextContent } from '@/lib/data/content';

export default function ContactControlsPage() {
    const { textContent, loading } = useAuth();
    const [isSaving, startTransition] = useTransition();
    const { toast } = useToast();

    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [instagram, setInstagram] = useState('');

    useEffect(() => {
        if (!loading) {
            setWhatsapp((textContent.contact_whatsapp as string) || '');
            setEmail((textContent.contact_email as string) || '');
            setInstagram((textContent.contact_instagram as string) || '');
        }
    }, [textContent, loading]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await saveTextContent('contact_whatsapp', whatsapp);
                await saveTextContent('contact_email', email);
                await saveTextContent('contact_instagram', instagram);
                toast({ title: 'Contact Details Saved!' });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
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
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Contact Page Controls</h1>
                <p className="text-muted-foreground">Update the contact information displayed on the "Contact Us" page.</p>
            </div>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> WhatsApp Number</Label>
                             <Input
                                id="whatsapp"
                                placeholder="+91 12345 67890"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                required
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/> Support Email</Label>
                             <Input
                                id="email"
                                type="email"
                                placeholder="support@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="w-4 h-4"/> Instagram Handle</Label>
                             <Input
                                id="instagram"
                                placeholder="@username"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
