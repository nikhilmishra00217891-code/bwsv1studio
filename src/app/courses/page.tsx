
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listenForCourses, createCourse, isFaculty } from "@/lib/data";
import { CourseList } from "@/components/courses/CourseList";
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { PlusCircle, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/types';


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [userIsFaculty, setUserIsFaculty] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let unsubscribe: () => void;

    const checkFacultyAndSubscribe = async () => {
      let facultyStatus = false;
      if (user) {
        facultyStatus = await isFaculty(user.uid);
      }
      setUserIsFaculty(facultyStatus);

      // Now that faculty status is known, subscribe to the appropriate course list
      unsubscribe = listenForCourses(facultyStatus, (fetchedCourses) => {
        setCourses(fetchedCourses);
        setLoading(false);
      });
    };

    checkFacultyAndSubscribe();

    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

  const handleCreateCourse = async () => {
    setIsCreating(true);
    try {
      const newCourseId = await createCourse();
      toast({
        title: "Course Created!",
        description: "Your new course placeholder is ready.",
      });
      router.push(`/courses/${newCourseId}`);
    } catch (error) {
      console.error("Failed to create course", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create the course.",
      });
      setIsCreating(false);
    }
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
              <Button onClick={handleCreateCourse} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Course
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <CourseList courses={courses} isFaculty={userIsFaculty} />
      </div>
    </div>
  );
}
