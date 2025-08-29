
"use client";

import { useState } from 'react';
import type { Course, Subject, Chapter } from "@/types";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addSubject, deleteSubject, addChapter, deleteChapter } from '@/lib/data';

interface CourseStructureEditorProps {
  course: Course;
  onCourseUpdate: (updatedCourse: Course) => void;
}

export default function CourseStructureEditor({ course, onCourseUpdate }: CourseStructureEditorProps) {
  const { toast } = useToast();
  const [newSubject, setNewSubject] = useState('');
  const [newChapters, setNewChapters] = useState<Record<string, string>>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    setLoadingState({ ...loadingState, addSubject: true });
    try {
      const updatedCourse = await addSubject(course.id, newSubject.trim());
      onCourseUpdate(updatedCourse);
      toast({ title: "Subject Added!", description: `"${newSubject.trim()}" has been added to the course.` });
      setNewSubject('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to add subject', description: error.message });
    } finally {
      setLoadingState({ ...loadingState, addSubject: false });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    setLoadingState({ ...loadingState, [`delete_subject_${subjectId}`]: true });
    try {
        const updatedCourse = await deleteSubject(course.id, subjectId);
        onCourseUpdate(updatedCourse);
        toast({ title: 'Subject Deleted' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete subject', description: error.message });
    } finally {
         setLoadingState({ ...loadingState, [`delete_subject_${subjectId}`]: false });
    }
  }

  const handleAddChapter = async (subjectId: string) => {
    const chapterTitle = newChapters[subjectId]?.trim();
    if (!chapterTitle) return;
     setLoadingState({ ...loadingState, [`add_chapter_${subjectId}`]: true });
     try {
        const updatedCourse = await addChapter(course.id, subjectId, chapterTitle);
        onCourseUpdate(updatedCourse);
        toast({ title: 'Chapter Added!', description: `"${chapterTitle}" has been added.` });
        setNewChapters({ ...newChapters, [subjectId]: '' });
     } catch(error: any) {
        toast({ variant: 'destructive', title: 'Failed to add chapter', description: error.message });
     } finally {
        setLoadingState({ ...loadingState, [`add_chapter_${subjectId}`]: false });
     }
  }

  const handleDeleteChapter = async (subjectId: string, chapterId: string) => {
    setLoadingState({ ...loadingState, [`delete_chapter_${chapterId}`]: true });
     try {
        const updatedCourse = await deleteChapter(course.id, subjectId, chapterId);
        onCourseUpdate(updatedCourse);
        toast({ title: 'Chapter Deleted' });
     } catch(error: any) {
        toast({ variant: 'destructive', title: 'Failed to delete chapter', description: error.message });
     } finally {
        setLoadingState({ ...loadingState, [`delete_chapter_${chapterId}`]: false });
     }
  }


  return (
    <Card className="shadow-lg mt-8 border-primary/20">
      <CardHeader>
        <CardTitle>Course Structure Editor</CardTitle>
        <CardDescription>Add, remove, and organize subjects and chapters for this course.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {course.subjects?.map((subject) => (
            <Card key={subject.id} className="bg-muted/50 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg">{subject.title}</h4>
                 <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteSubject(subject.id)}
                    disabled={loadingState[`delete_subject_${subject.id}`]}
                >
                    {loadingState[`delete_subject_${subject.id}`] ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 text-destructive" />}
                </Button>
              </div>
              <div className="space-y-2 pl-4">
                {subject.chapters?.map((chapter) => (
                  <div key={chapter.id} className="flex justify-between items-center bg-background p-2 rounded-md">
                    <span>{chapter.title}</span>
                     <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteChapter(subject.id, chapter.id)}
                        disabled={loadingState[`delete_chapter_${chapter.id}`]}
                    >
                         {loadingState[`delete_chapter_${chapter.id}`] ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 text-destructive" />}
                    </Button>
                  </div>
                ))}
                 <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="New chapter title..."
                    value={newChapters[subject.id] || ''}
                    onChange={(e) => setNewChapters({ ...newChapters, [subject.id]: e.target.value })}
                  />
                  <Button 
                    size="icon" 
                    onClick={() => handleAddChapter(subject.id)}
                    disabled={loadingState[`add_chapter_${subject.id}`]}
                  >
                     {loadingState[`add_chapter_${subject.id}`] ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Plus />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="border-t pt-6 space-y-2">
            <Label htmlFor="new-subject" className="font-semibold">Add New Subject</Label>
            <div className="flex gap-2">
                <Input
                    id="new-subject"
                    placeholder="e.g., Classical Mechanics"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                />
                <Button 
                    onClick={handleAddSubject}
                    disabled={loadingState.addSubject}
                >
                    {loadingState.addSubject ? <LoaderCircle className="animate-spin" /> : 'Add Subject'}
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
