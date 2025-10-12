'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listenForCourses, createCourse } from "@/lib/data/courses";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { PlusCircle, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const gradeOptions = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Competitive Exams'];

const CreateCourseDialog = ({ onCourseCreated }: { onCourseCreated: (id: string) => void }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [grade, setGrade] = useState('');
    const [price, setPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !category.trim() || !grade) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in all required fields.' });
            return;
        }

        setIsLoading(true);
        try {
            const newCourseId = await createCourse({ title, category, grade, price });
            toast({
                title: "Course Created!",
                description: "Your new course placeholder is ready.",
            });
            onCourseCreated(newCourseId);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create course", error);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: "Could not create the course.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Course
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleCreateCourse}>
                    <DialogHeader>
                        <DialogTitle>Create a New Course</DialogTitle>
                        <DialogDescription>
                            Fill in the basic details for your new course. You can add more content later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" required placeholder="e.g., Physics, History"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">Grade</Label>
                            <Select value={grade} onValueChange={setGrade}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a grade level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    <SelectItem value="Uncategorized">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price (₹)</Label>
                            <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="col-span-3" placeholder="Enter 0 for a free course"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Create Course'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsFaculty, setUserIsFaculty] = useState(false);

  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect handles data fetching and real-time updates.
    if (authLoading) return;

    const facultyStatus = !!user && userProfile?.role === 'faculty';
    setUserIsFaculty(facultyStatus);

    // Now that faculty status is known, subscribe to the appropriate course list.
    // This listener will handle the initial fetch and subsequent real-time updates.
    const unsubscribe = listenForCourses(facultyStatus, (fetchedCourses) => {
      setCourses(fetchedCourses);
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [user, userProfile, authLoading]);

  const handleCourseCreated = (newCourseId: string) => {
      router.push(`/courses/${newCourseId}`);
  };
  
  if (loading || authLoading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 md:py-24 px-6 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Explore Our Courses</h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Find the right course to help you achieve your academic goals. We are with you at every step.
          </p>
           {userIsFaculty && (
            <div className="mt-8">
              <CreateCourseDialog onCourseCreated={handleCourseCreated} />
            </div>
          )}
        </div>
        
        <CourseList courses={courses} isFaculty={userIsFaculty} />
      </div>
    </div>
  );
}
