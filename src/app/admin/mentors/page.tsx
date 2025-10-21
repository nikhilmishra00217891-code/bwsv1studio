

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Mentor } from '@/types';
import { saveMentor, deleteMentor } from '@/app/actions';
import initialMentorData from '@/app/lib/mentors.json';
import { LoaderCircle, PlusCircle, Trash2, Edit, Youtube, Linkedin, Save } from 'lucide-react';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const MentorFormDialog = ({ mentor, onSave, onOpenChange, isOpen }: { mentor?: Mentor | null, onSave: () => void, onOpenChange: (open: boolean) => void, isOpen: boolean }) => {
    const [formData, setFormData] = useState<Partial<Mentor>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (isOpen) {
            setFormData(mentor || { subjects: [], socials: { youtube: '#', linkedin: '#' } });
        }
    }, [mentor, isOpen]);

    const handleFieldChange = (field: keyof Mentor, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSocialChange = (social: 'youtube' | 'linkedin', value: string) => {
        setFormData(prev => ({ ...prev, socials: { ...(prev.socials || {}), [social]: value } }));
    };
    
    const handleSubjectToggle = (subject: string) => {
        const currentSubjects = formData.subjects || [];
        const newSubjects = currentSubjects.includes(subject)
            ? currentSubjects.filter(s => s !== subject)
            : [...currentSubjects, subject];
        handleFieldChange('subjects', newSubjects);
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave: Mentor = {
                id: formData.id || formData.name?.toLowerCase().replace(/\s+/g, '-') || `mentor-${Date.now()}`,
                name: formData.name || '',
                role: formData.role || '',
                avatar: formData.avatar || 'https://i.postimg.cc/6p7xNnB0/placeholder.png',
                bio: formData.bio || '',
                subjects: formData.subjects || [],
                philosophy: formData.philosophy || '',
                socials: formData.socials || { youtube: '#', linkedin: '#' }
            }
            const { success, message } = await saveMentor(dataToSave);
            if (success) {
                toast({ title: "Mentor Saved!" });
                onSave();
            } else {
                 toast({ variant: 'destructive', title: "Save Failed", description: message });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
            onOpenChange(false);
        }
    }
    
    const allSubjects = ['Physics', 'Mathematics', 'Biology', 'Chemistry', 'Logical Reasoning'];
    
    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{mentor ? 'Edit Mentor' : 'Add New Mentor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="md:col-span-1">
                                    <div className="relative aspect-square w-full rounded-full border bg-muted overflow-hidden">
                                        <Image src={formData.avatar || 'https://i.postimg.cc/6p7xNnB0/placeholder.png'} alt="Mentor avatar" fill className="object-cover" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                     <div>
                                        <Label htmlFor="avatar">Avatar Image URL</Label>
                                        <Input id="avatar" value={formData.avatar || ''} onChange={(e) => handleFieldChange('avatar', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={formData.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role">Role / Title</Label>
                                    <Input id="role" value={formData.role || ''} onChange={(e) => handleFieldChange('role', e.target.value)} required placeholder="e.g., Founder & Physics Mentor" />
                                </div>
                                 <div>
                                    <Label htmlFor="philosophy">Teaching Philosophy</Label>
                                    <Input id="philosophy" value={formData.philosophy || ''} onChange={(e) => handleFieldChange('philosophy', e.target.value)} required />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Biography</Label>
                                <Textarea id="bio" value={formData.bio || ''} onChange={(e) => handleFieldChange('bio', e.target.value)} required className="min-h-[120px]" />
                            </div>

                            <div>
                                <Label>Subjects</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {allSubjects.map(sub => (
                                        <Badge 
                                            key={sub}
                                            variant={(formData.subjects || []).includes(sub) ? "default" : "secondary"}
                                            onClick={() => handleSubjectToggle(sub)}
                                            className="cursor-pointer"
                                        >{sub}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="youtube" className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500"/> YouTube URL</Label>
                                    <Input id="youtube" value={formData.socials?.youtube || ''} onChange={(e) => handleSocialChange('youtube', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-500"/> LinkedIn URL</Label>
                                    <Input id="linkedin" value={formData.socials?.linkedin || ''} onChange={(e) => handleSocialChange('linkedin', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <LoaderCircle className="animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function MentorManagementPage() {
    const [mentors, setMentors] = useState<Mentor[]>(initialMentorData.mentors);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const { toast } = useToast();

    // In a real app, you might fetch this dynamically. For now, we use the imported JSON.
    const refreshMentors = () => {
        // This is a dummy function to mimic refetching. 
        // In a real scenario with server-side data fetching, you'd use router.refresh()
        // But since we use a server action that writes to a file, the change is persistent.
        // Forcing a reload is a simple way to see the update.
        window.location.reload();
    };

    const handleAddClick = () => {
        setSelectedMentor(null);
        setIsDialogOpen(true);
    }
    
    const handleEditClick = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setIsDialogOpen(true);
    }
    
    const handleDelete = async (mentorId: string) => {
        const { success, message } = await deleteMentor(mentorId);
        if (success) {
            toast({ title: 'Mentor Deleted' });
            refreshMentors();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: message });
        }
    };

    return (
        <>
            <div className="animate-fade-in p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold font-headline">Mentor Management</h1>
                        <p className="text-muted-foreground">Add, edit, or remove mentor profiles.</p>
                    </div>
                    <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Mentor
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map(mentor => (
                         <Card key={mentor.id}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                     <Image src={mentor.avatar} alt={mentor.name} width={64} height={64} className="rounded-full border-2 border-primary" />
                                    <div>
                                        <CardTitle>{mentor.name}</CardTitle>
                                        <CardDescription>{mentor.role}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
                                <div className="flex justify-end gap-2 mt-4">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4"/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>This action will permanently delete {mentor.name}.</AlertDialogDescription>
                                            <AlertDialogFooterComponent>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(mentor.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooterComponent>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(mentor)}><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <MentorFormDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                mentor={selectedMentor}
                onSave={refreshMentors}
            />
        </>
    );
}

