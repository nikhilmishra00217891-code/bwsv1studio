

"use client";

import React, { useState } from 'react';
import type { Chapter, StudyMaterial, StudyMaterialLink } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Folder, Link as LinkIcon, Edit, Trash2, LoaderCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addStudyMaterial, updateStudyMaterial, deleteStudyMaterial } from '@/lib/data/courses';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';

const MaterialFormDialog = ({
    isOpen,
    onOpenChange,
    onSubmit,
    initialData,
    type,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: { title?: string, url?: string }) => void;
    initialData?: Partial<StudyMaterial>;
    type: 'topic' | 'link';
}) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    
    React.useEffect(() => {
        setTitle(initialData?.title || '');
        if (type === 'link') {
            setUrl((initialData as any)?.url || '');
        }
    }, [initialData, type, isOpen]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            ...(type === 'topic' && { title }),
            ...(type === 'link' && { title, url })
        });
    };
    
    const isLink = type === 'link';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData?.id ? 'Edit' : 'Add'} {isLink ? 'Link' : 'Topic'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="material-title">Title</Label>
                        <Input id="material-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                     {isLink && (
                        <div>
                            <Label htmlFor="material-url">URL</Label>
                            <Input id="material-url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://docs.google.com/..."/>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const MaterialNode = ({
    material,
    courseId,
    subjectId,
    chapterId,
    isFaculty,
    onUpdate
}: {
    material: StudyMaterial;
    courseId: string;
    subjectId: string;
    chapterId: string;
    isFaculty: boolean;
    onUpdate: () => void;
}) => {
    const { toast } = useToast();
    const [modalState, setModalState] = useState<{ open: boolean; type: 'topic' | 'link'; mode: 'add' | 'edit', parentId: string | null, initialData?: Partial<StudyMaterial> }>({ open: false, type: 'topic', mode: 'add', parentId: null });
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAdd = async (data: {title?: string, url?: string}) => {
        setIsLoading(true);
        try {
            const itemData: Omit<StudyMaterial, 'id'> = modalState.type === 'link' 
                ? { type: 'link', url: data.url!, title: data.title! }
                : { type: 'topic', title: data.title!, subtopics: [] };

            await addStudyMaterial(courseId, subjectId, chapterId, modalState.parentId, itemData);
            toast({ title: 'Material Added!' });
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
            setModalState({ open: false, type: 'topic', mode: 'add', parentId: null });
        }
    };
    
    const handleEdit = async (data: { title?: string, url?: string }) => {
        setIsLoading(true);
        try {
            await updateStudyMaterial(courseId, subjectId, chapterId, { id: material.id, title: data.title, url: data.url });
            toast({ title: 'Material Updated!' });
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
            setModalState({ open: false, type: 'topic', mode: 'edit', parentId: null });
        }
    }
    
    const handleDelete = async () => {
         setIsLoading(true);
         try {
            await deleteStudyMaterial(courseId, subjectId, chapterId, material.id);
            toast({ title: 'Material Deleted' });
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    if (material.type === 'link') {
        const link = material as StudyMaterialLink;
        return (
            <div className="flex items-center group gap-2 pl-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline flex-grow truncate flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors">
                    <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{link.title}</span>
                    <ExternalLink className="h-3 h-3 text-muted-foreground shrink-0"/>
                </a>
                {isFaculty && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isLoading}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete "{link.title}"?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                                <AlertDialogFooterComponent>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooterComponent>
                            </AlertDialogContent>
                         </AlertDialog>
                    </div>
                )}
            </div>
        )
    }

    // It's a topic
    return (
       <>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={material.id} className="border-none">
                    <div className="flex items-center group p-2 rounded-md hover:bg-muted">
                        <AccordionTrigger className="p-0 hover:no-underline flex-grow">
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-semibold">{material.title}</span>
                            </div>
                        </AccordionTrigger>
                        {isFaculty && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModalState({ open: true, type: 'topic', mode: 'add', parentId: material.id })} title="Add Sub-Topic">
                                    <Folder className="w-4 h-4"/><PlusCircle className="w-2.5 h-2.5 absolute bottom-0 right-0"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModalState({ open: true, type: 'link', mode: 'add', parentId: material.id })} title="Add Link">
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModalState({ open: true, type: 'topic', mode: 'edit', parentId: null, initialData: material })}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isLoading}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete "{material.title}"?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will delete the topic and all its contents. This cannot be undone.</AlertDialogDescription>
                                        <AlertDialogFooterComponent>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                        </AlertDialogFooterComponent>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                    <AccordionContent className="pl-6 border-l-2 ml-2 mt-2 space-y-1">
                        {(material.subtopics || []).map(sub => (
                            <MaterialNode 
                                key={sub.id} 
                                material={sub} 
                                courseId={courseId} 
                                subjectId={subjectId} 
                                chapterId={chapterId} 
                                isFaculty={isFaculty} 
                                onUpdate={onUpdate}
                            />
                        ))}
                        {(material.subtopics || []).length === 0 && (
                            <p className="text-xs text-muted-foreground italic pl-2">No materials in this topic yet.</p>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
             <MaterialFormDialog 
                isOpen={modalState.open && modalState.parentId === material.id} 
                onOpenChange={(open) => setModalState({ ...modalState, open })} 
                onSubmit={handleAdd}
                type={modalState.type}
            />
             <MaterialFormDialog 
                isOpen={modalState.open && modalState.mode === 'edit' && modalState.initialData?.id === material.id}
                onOpenChange={(open) => setModalState({ ...modalState, open, mode: 'edit' })}
                onSubmit={handleEdit}
                initialData={material}
                type="topic"
            />
       </>
    );
};


export default function StudyMaterialEditor({ courseId, subjectId, chapters, isFaculty }: { courseId: string; subjectId: string; chapters: Chapter[], isFaculty: boolean }) {
    const router = useRouter();
    const { toast } = useToast();
    const [modalState, setModalState] = useState<{ open: boolean; chapterId: string | null }>({ open: false, chapterId: null });
    const [isLoading, setIsLoading] = useState(false);
    
    const forceRerender = () => {
        router.refresh();
    }
    
    const handleAdd = async (data: { title?: string, url?: string }) => {
        if (!modalState.chapterId) return;
        setIsLoading(true);
        try {
            await addStudyMaterial(courseId, subjectId, modalState.chapterId, null, {
                type: 'topic',
                title: data.title!,
                subtopics: []
            });
            toast({ title: 'Topic Added!' });
            forceRerender();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
            setModalState({ open: false, chapterId: null });
        }
    };
    
    if (chapters.length === 0) {
        return (
            <Card className="p-8 text-center text-muted-foreground">
                No chapters exist for this subject yet. Add chapters in the Course Flow editor to add study materials.
            </Card>
        )
    }

    return (
       <>
         <Accordion type="multiple" className="w-full space-y-4">
            {chapters.map(chapter => (
                <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between w-full">
                        <AccordionTrigger className="text-lg font-bold hover:no-underline">{chapter.title}</AccordionTrigger>
                        {isFaculty && (
                            <Button size="sm" variant="outline" onClick={() => setModalState({ open: true, chapterId: chapter.id })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Topic
                            </Button>
                        )}
                    </div>
                    <AccordionContent className="mt-4 pt-4 border-t">
                        <div className="space-y-3">
                           {(chapter.studyMaterials || []).map(material => (
                                <MaterialNode 
                                    key={material.id}
                                    material={material} 
                                    courseId={courseId} 
                                    subjectId={subjectId} 
                                    chapterId={chapter.id} 
                                    isFaculty={isFaculty} 
                                    onUpdate={forceRerender}
                                />
                           ))}
                           {(chapter.studyMaterials || []).length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No study materials for this chapter yet.</p>
                           )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
         <MaterialFormDialog 
            isOpen={modalState.open} 
            onOpenChange={() => setModalState({ open: false, chapterId: null })} 
            onSubmit={handleAdd}
            type="topic"
        />
       </>
    );
}
