
export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf';
  duration: string; 
}

export interface Course {
  id: string;
  title: string;
  category: string;
  isFree: boolean;
  thumbnail: string;
  mentorName: string;
  description: string;
  lessons: Lesson[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
}

export interface EnrolledCourse {
  courseId: string;
  progress: number;
  title: string;
  thumbnail: string;
  category: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: 'student' | 'faculty';
    enrolledCourses?: string[];
    preferredSubjects?: string[];
}
