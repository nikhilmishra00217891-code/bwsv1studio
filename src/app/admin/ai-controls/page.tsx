
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveTextContent } from "@/lib/data/content";
import { BrainCircuitIcon, LoaderCircle, Save, Undo } from "lucide-react";
import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AiControlsPage() {
    const { textContent } = useAuth();
    const { toast } = useToast();

    const [aiSystemPrompt, setAiSystemPrompt] = useState('');
    const [initialAiSystemPrompt, setInitialAiSystemPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // textContent might be empty on initial load
        const currentPrompt = textContent.bwsBuddySystemPrompt || '';
        setAiSystemPrompt(currentPrompt);
        setInitialAiSystemPrompt(currentPrompt);
        if (Object.keys(textContent).length > 0) {
            setIsLoading(false);
        }
    }, [textContent]);

    const hasChanges = aiSystemPrompt !== initialAiSystemPrompt;

    const handleSaveChanges = async () => {
        if (!hasChanges) return;
        setIsSaving(true);
        try {
            await saveTextContent('bwsBuddySystemPrompt', aiSystemPrompt);
            setInitialAiSystemPrompt(aiSystemPrompt);
            toast({
                title: "Changes Saved!",
                description: "The AI system prompt has been updated globally.",
            });
        } catch (error) {
            console.error("Error updating AI prompt: ", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetChanges = () => {
        setAiSystemPrompt(initialAiSystemPrompt);
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">AI Controls</h1>
                    <p className="text-muted-foreground">Manage the global BWS Buddy AI assistant.</p>
                </div>
                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={!hasChanges || isSaving}><Undo className="w-4 h-4 mr-2" />Reset</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will discard your unsaved changes to the system prompt.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleResetChanges}>Discard Changes</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                        {isSaving ? <LoaderCircle className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Card className="shadow-lg border-primary/30">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <BrainCircuitIcon className="w-6 h-6 text-primary" />
                        <div>
                            <CardTitle>BWS Buddy Personality</CardTitle>
                            <CardDescription>Define the personality and knowledge of the global AI assistant.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="systemPrompt" className="font-semibold">System Prompt</Label>
                        <Textarea
                            id="systemPrompt"
                            value={aiSystemPrompt}
                            onChange={(e) => setAiSystemPrompt(e.target.value)}
                            placeholder="e.g., You are BWS Buddy, a helpful AI assistant..."
                            className="min-h-[250px] mt-2 font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            This prompt defines the AI's core personality and instructions for all users. Changes go live immediately after saving.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
