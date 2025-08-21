
import { Timestamp } from "firebase/firestore";

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
  isActive: boolean;
  youtubeLink?: string;
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

export interface MobileNumber {
  countryCode: string;
  number: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string;
    role: 'student' | 'faculty';
    onboardingComplete?: boolean;
    // Onboarding data - Step 2
    mobile?: MobileNumber;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    // Onboarding data - Step 3
    grade?: string;
    board?: string;
    subjects?: string[];
    // Onboarding data - Step 4
    goals?: string[];
    challenges?: string[];
    preferredStudyDuration?: number;
    preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night' | 'other';
    motivationStyles?: string[];
    // Onboarding data - Step 5
    interests?: string[];
    // Onboarding data - Step 6
    learningStyle?: ('video' | 'reading' | 'practice' | 'discussion' | string)[];
    // Onboarding data - Step 7
    theme?: string;
    customTheme?: {
        primary: { h: number; s: number; l: number };
        background: { h: number; s: number; l: number };
    }
    // Onboarding data - Step 8
    avatar?: string;
    // Original fields
    enrolledCourses?: string[];
    progress?: { [courseId: string]: number };
}

export interface Announcement {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  reactions: string[];
}


    
