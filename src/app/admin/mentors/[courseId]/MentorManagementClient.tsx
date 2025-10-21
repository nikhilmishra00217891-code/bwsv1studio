
"use client";

import React, { useState, useTransition } from 'react';
import type { Course, Mentor } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateCourse } from '@/lib/data/courses';
import { LoaderCircle, PlusCircle, Trash2, Edit, Save, ArrowLeft, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const MentorFormDialog = ({ course, mentor, onSave, onOpenChange, isOpen }: { course: Course, mentor?: Mentor | null, onSave: (mentors: Mentor[]) => void, onOpenChange: (open: boolean) => void, isOpen: boolean }) => {
    const [formData, setFormData] = useState<Partial<Mentor>>({});
    const [isSaving, startTransition] = useTransition();
    const { toast } = useToast();
    
    React.useEffect(() => {
        if (isOpen) {
            setFormData(mentor || { subjects: [], socials: { youtube: '', linkedin: '', instagram: '', facebook: '' } });
        }
    }, [mentor, isOpen]);

    const handleFieldChange = (field: keyof Mentor, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSocialChange = (social: 'youtube' | 'linkedin' | 'instagram' | 'facebook', value: string) => {
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

        // Validation for at least one social link
        const hasSocialLink = formData.socials && Object.values(formData.socials).some(link => link && link.trim() !== '');
        if (!hasSocialLink) {
            toast({
                variant: 'destructive',
                title: 'Missing Social Link',
                description: 'Please provide at least one social media link for the mentor.',
            });
            return;
        }

        startTransition(async () => {
            try {
                const dataToSave: Mentor = {
                    id: formData.id || `mentor-${Date.now()}`,
                    name: formData.name || '',
                    role: formData.role || '',
                    avatar: formData.avatar || 'https://i.postimg.cc/6p7xNnB0/placeholder.png',
                    bio: formData.bio || '',
                    subjects: formData.subjects || [],
                    philosophy: formData.philosophy || '',
                    socials: formData.socials || {}
                }

                const currentMentors = course.mentors || [];
                let updatedMentors;

                if (mentor) { // Editing existing mentor
                    updatedMentors = currentMentors.map(m => m.id === dataToSave.id ? dataToSave : m);
                } else { // Adding new mentor
                    updatedMentors = [...currentMentors, dataToSave];
                }
                
                await updateCourse(course.id, { mentors: updatedMentors });

                toast({ title: mentor ? "Mentor Updated!" : "Mentor Added!" });
                onSave(updatedMentors);
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error", description: error.message });
            } finally {
                onOpenChange(false);
            }
        });
    }
    
    const allSubjects = ['Physics', 'Mathematics', 'Biology', 'Chemistry', 'Logical Reasoning'];
    
    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl flex flex-col h-full max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>{mentor ? 'Edit Mentor' : 'Add New Mentor'}</DialogTitle>
                    <DialogDescription>Manage mentor details for "{course.title}".</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
                    <ScrollArea className="flex-grow px-6">
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

                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <Label htmlFor="youtube" className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500"/> YouTube URL</Label>
                                    <Input id="youtube" value={formData.socials?.youtube || ''} onChange={(e) => handleSocialChange('youtube', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-500"/> LinkedIn URL</Label>
                                    <Input id="linkedin" value={formData.socials?.linkedin || ''} onChange={(e) => handleSocialChange('linkedin', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500"/> Instagram URL</Label>
                                    <Input id="instagram" value={formData.socials?.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="facebook" className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-700"/> Facebook URL</Label>
                                    <Input id="facebook" value={formData.socials?.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-6 pt-4 border-t shrink-0">
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


export default function MentorManagementClient({ initialCourse }: { initialCourse: Course }) {
    const { toast } = useToast();
    const [course, setCourse] = useState<Course>(initialCourse);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

    const handleAddClick = () => {
        setSelectedMentor(null);
        setIsDialogOpen(true);
    }
    
    const handleEditClick = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setIsDialogOpen(true);
    }
    
    const handleDelete = async (mentorId: string) => {
        const updatedMentors = course.mentors?.filter(m => m.id !== mentorId) || [];
        try {
            await updateCourse(course.id, { mentors: updatedMentors });
            setCourse(prev => ({...prev, mentors: updatedMentors}));
            toast({ title: 'Mentor Deleted' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const handleMentorsUpdate = (updatedMentors: Mentor[]) => {
        setCourse(prev => ({...prev, mentors: updatedMentors}));
    }

    return (
        <>
            <div className="animate-fade-in p-4 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/mentors">
                            <ArrowLeft className="mr-2 w-4 h-4"/> Back to Courses
                        </Link>
                    </Button>
                     <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-headline">{course.title}</h1>
                        <p className="text-muted-foreground">Mentor Management</p>
                    </div>
                </div>

                <div className="flex justify-end">
                     <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Mentor
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(course.mentors || []).map(mentor => (
                         <Card key={mentor.id}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                     <Image src={mentor.avatar || 'https://i.postimg.cc/6p7xNnB0/placeholder.png'} alt={mentor.name} width={64} height={64} className="rounded-full border-2 border-primary" />
                                    <div>
                                        <CardTitle>{mentor.name}</CardTitle>
                                        <CardDescription>{mentor.role}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{mentor.bio}</p>
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
                                                <AlertDialogAction onClick={() => handleDelete(mentor.id)} className={cn(buttonVariants({variant: "destructive"}))}>Delete</AlertDialogAction>
                                            </AlertDialogFooterComponent>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(mentor)}><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {(course.mentors || []).length === 0 && (
                     <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p>No mentors have been added to this course yet.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <MentorFormDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                course={course}
                mentor={selectedMentor}
                onSave={handleMentorsUpdate}
            />
        </>
    );
}
