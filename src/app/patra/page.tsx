
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { listenForUserPatra, markPatraAsRead, deletePatra } from '@/lib/data/patra';
import type { Patra, PatraType } from '@/types';
import { LoaderCircle, Mailbox, Trash2, Smile, AlertTriangle, ChevronsRight, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const stampConfig: Record<PatraType, { text: string, icon: React.ElementType, color: string }> = {
    praise: { text: 'Shabashi', icon: Award, color: 'bg-blue-500 text-blue-100' },
    warning: { text: 'Chetaavani', icon: AlertTriangle, color: 'bg-red-600 text-red-100' },
    encouragement: { text: 'Protsahan', icon: Smile, color: 'bg-green-500 text-green-100' },
    info: { text: 'Suchna', icon: ChevronsRight, color: 'bg-gray-500 text-gray-100' },
};

const PatraCard = ({ patra, onOpen }: { patra: Patra, onOpen: () => void }) => {
    const stamp = stampConfig[patra.type];

    return (
        <button onClick={onOpen} className="block w-full text-left">
            <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group", !patra.isRead && "border-primary/50 shadow-md")}>
                <div className="flex items-stretch h-full">
                    <div className={cn("w-20 shrink-0 flex flex-col items-center justify-center p-2 text-center -rotate-12 transform-gpu", stamp.color)}>
                        <stamp.icon className="w-8 h-8 opacity-80" />
                        <span className="font-bold uppercase text-sm tracking-wider mt-1">{stamp.text}</span>
                    </div>
                    <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary">{patra.title}</h3>
                            {!patra.isRead && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{patra.content}</p>
                         <p className="text-xs text-muted-foreground mt-2">From: {patra.senderName} • {formatDistanceToNow(patra.createdAt.toDate(), { addSuffix: true })}</p>
                    </div>
                </div>
            </Card>
        </button>
    )
}

export default function PatraPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [letters, setLetters] = useState<Patra[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [selectedPatra, setSelectedPatra] = useState<Patra | null>(null);

    useEffect(() => {
        if (user) {
            setDataLoading(true);
            const unsubscribe = listenForUserPatra(user.uid, (patraList) => {
                setLetters(patraList);
                setDataLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user]);
    
    const handleOpenPatra = (patra: Patra) => {
        setSelectedPatra(patra);
        if (!patra.isRead && user) {
            markPatraAsRead(user.uid, patra.id).catch(err => console.error("Failed to mark as read:", err));
        }
    }
    
    const handleDelete = async () => {
        if (!user || !selectedPatra) return;
        
        try {
            await deletePatra(user.uid, selectedPatra.id);
            toast({ title: "Letter Deleted" });
            setSelectedPatra(null);
        } catch (error) {
            toast({ variant: 'destructive', title: "Could not delete letter." });
        }
    }

    if (authLoading || dataLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const stamp = selectedPatra ? stampConfig[selectedPatra.type] : null;

    return (
        <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-12 md:py-16 animate-fade-in">
            <div className="container mx-auto max-w-4xl">
                 <div className="text-center mb-12">
                    <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                        <Mailbox className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Your Mailbox</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Personal letters and important updates from your BWS mentors will appear here.
                    </p>
                </div>

                {letters.length > 0 ? (
                    <div className="space-y-6">
                        {letters.map(letter => (
                            <PatraCard key={letter.id} patra={letter} onOpen={() => handleOpenPatra(letter)} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <h3 className="text-xl font-semibold">Your mailbox is empty.</h3>
                            <p>No letters yet. Keep up the good work!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={!!selectedPatra} onOpenChange={(open) => !open && setSelectedPatra(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedPatra && stamp && (
                        <>
                             <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                     <div className={cn("p-2 rounded-md", stamp.color)}>
                                        <stamp.icon className="w-6 h-6" />
                                     </div>
                                     <DialogTitle className="text-2xl font-headline">{selectedPatra.title}</DialogTitle>
                                </div>
                                <DialogDescription>
                                    From: {selectedPatra.senderName} • Sent {formatDistanceToNow(selectedPatra.createdAt.toDate(), { addSuffix: true })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[50vh] overflow-y-auto py-4">
                                <p className="whitespace-pre-wrap">{selectedPatra.content}</p>
                            </div>
                            <DialogFooter className="sm:justify-between items-center">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will permanently delete this letter.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button onClick={() => setSelectedPatra(null)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
