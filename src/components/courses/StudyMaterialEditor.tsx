

"use client";

import { useState } from 'react';
import type { Chapter, StudyMaterial } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, FileText, Folder, Link as LinkIcon, Edit, Trash2, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addStudyMaterial, updateStudyMaterial, deleteStudyMaterial } from '@/lib/data/courses';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type MaterialItem = {
    type: 'topic' | 'link';
    title: string;
    url?: string;
};

const MaterialFormDialog = ({
    isOpen,
    onOpenChange,
    onSubmit,
    initialData,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: MaterialItem) => void;
    initialData?: MaterialItem & { id?: string };
}) => {
    const [type, setType] = useState<'topic' | 'link'>(initialData?.type || 'topic');
    const [title, setTitle] = useState(initialData?.title || '');
    const [url, setUrl] = useState(initialData?.url || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ type, title, url: type === 'link' ? url : undefined });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData?.id ? 'Edit' : 'Add'} Study Material</DialogTitle>
                    <DialogDescription>Add a new topic or a link to a resource.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <Button type="button" variant={type === 'topic' ? 'default' : 'outline'} onClick={() => setType('topic')} className="w-full">
                            <Folder className="mr-2 h-4 w-4" /> Topic
                        </Button>
                        <Button type="button" variant={type === 'link' ? 'default' : 'outline'} onClick={() => setType('link')} className="w-full">
                            <LinkIcon className="mr-2 h-4 w-4" /> Link
                        </Button>
                    </div>
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    {type === 'link' && (
                        <div>
                            <Label htmlFor="url">URL</Label>
                            <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://docs.google.com/..." />
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
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAdd = async (data: MaterialItem) => {
        setIsLoading(true);
        try {
            await addStudyMaterial(courseId, subjectId, chapterId, material.id, data);
            toast({ title: 'Material Added!' });
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
            setIsAdding(false);
        }
    };
    
    const handleEdit = async (data: MaterialItem) => {
        setIsLoading(true);
         try {
            await updateStudyMaterial(courseId, subjectId, chapterId, { ...data, id: material.id });
            toast({ title: 'Material Updated!' });
            onUpdate();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
            setIsEditing(false);
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
        return (
            <div className="flex items-center group gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline flex-grow">{material.title}</a>
                {isFaculty && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                            {isLoading ? <LoaderCircle className="animate-spin w-4 h-4"/> : <Edit className="w-4 h-4" />}
                         </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
                            {isLoading ? <LoaderCircle className="animate-spin w-4 h-4"/> : <Trash2 className="w-4 h-4 text-destructive" />}
                         </Button>
                    </div>
                )}
                 {isEditing && (
                    <MaterialFormDialog 
                        isOpen={isEditing} 
                        onOpenChange={setIsEditing} 
                        onSubmit={handleEdit} 
                        initialData={material} 
                    />
                 )}
            </div>
        )
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={material.id} className="border-none">
                <div className="flex items-center group">
                    <AccordionTrigger className="p-0 hover:no-underline flex-grow">
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">{material.title}</span>
                        </div>
                    </AccordionTrigger>
                    {isFaculty && (
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsAdding(true)}><PlusCircle className="w-4 h-4"/></Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                                {isLoading ? <LoaderCircle className="animate-spin w-4 h-4"/> : <Edit className="w-4 h-4" />}
                             </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
                                 {isLoading ? <LoaderCircle className="animate-spin w-4 h-4"/> : <Trash2 className="w-4 h-4 text-destructive" />}
                             </Button>
                         </div>
                     )}
                </div>
                <AccordionContent className="pl-6 border-l-2 ml-2 mt-2 space-y-2">
                    {material.subtopics.map(sub => (
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
                    {material.subtopics.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No materials in this topic yet.</p>
                    )}
                </AccordionContent>
            </AccordionItem>
            {isAdding && (
                <MaterialFormDialog isOpen={isAdding} onOpenChange={setIsAdding} onSubmit={handleAdd} />
            )}
             {isEditing && (
                <MaterialFormDialog 
                    isOpen={isEditing} 
                    onOpenChange={setIsEditing} 
                    onSubmit={handleEdit} 
                    initialData={material} 
                />
            )}
        </Accordion>
    )
};


export default function StudyMaterialEditor({ courseId, subjectId, chapters, isFaculty }: { courseId: string; subjectId: string; chapters: Chapter[], isFaculty: boolean }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const forceRerender = () => {
        router.refresh();
    }
    
    const handleAdd = async (chapterId: string, data: MaterialItem) => {
        setIsLoading(true);
        try {
            await addStudyMaterial(courseId, subjectId, chapterId, null, data);
            toast({ title: 'Material Added!' });
            forceRerender();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
            setIsAdding(null);
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
        <Accordion type="multiple" className="w-full space-y-4">
            {chapters.map(chapter => (
                <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between w-full">
                        <AccordionTrigger className="text-lg font-bold hover:no-underline">{chapter.title}</AccordionTrigger>
                        {isFaculty && (
                            <Button size="sm" variant="outline" onClick={() => setIsAdding(chapter.id)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Material
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
                    {isAdding === chapter.id && (
                        <MaterialFormDialog 
                            isOpen={isAdding === chapter.id} 
                            onOpenChange={() => setIsAdding(null)} 
                            onSubmit={(data) => handleAdd(chapter.id, data)}
                        />
                    )}
                </AccordionItem>
            ))}
        </Accordion>
    );
}

