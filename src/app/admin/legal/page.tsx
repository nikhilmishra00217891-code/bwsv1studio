
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoaderCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveTextContent } from '@/lib/data/content';

export default function LegalPagesAdminPage() {
    const { textContent, loading } = useAuth();
    const [isSaving, startTransition] = useTransition();
    const { toast } = useToast();

    const [terms, setTerms] = useState('');
    const [privacy, setPrivacy] = useState('');

    useEffect(() => {
        if (!loading) {
            setTerms((textContent.terms_of_service as string) || '');
            setPrivacy((textContent.privacy_policy as string) || '');
        }
    }, [textContent, loading]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await saveTextContent('terms_of_service', terms);
                await saveTextContent('privacy_policy', privacy);
                toast({ title: 'Legal Pages Saved!' });
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
        <div className="animate-fade-in p-4 md:p-8 space-y-8">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Legal Pages Management</h1>
                <p className="text-muted-foreground">Edit the content of your Terms of Service and Privacy Policy.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Terms of Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="terms"
                                placeholder="Write your Terms of Service here..."
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                className="min-h-[400px] text-base"
                                required
                            />
                        </CardContent>
                    </Card>
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Privacy Policy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="privacy"
                                placeholder="Write your Privacy Policy here..."
                                value={privacy}
                                onChange={(e) => setPrivacy(e.target.value)}
                                className="min-h-[400px] text-base"
                                required
                            />
                        </CardContent>
                    </Card>
                </div>
                 <div className="flex justify-end mt-8">
                    <Button type="submit" disabled={isSaving} size="lg">
                        {isSaving ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
