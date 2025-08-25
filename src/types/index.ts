
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
  id: "t1" | "t2" | "t3" | "t4" | "t5";
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
    createdAt?: string | null; // Changed to string for serialization
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
    // App data
    suspension?: {
        isSuspended: boolean;
        reason: string;
        suspendedAt: string | null;
    };
    enrolledCourses?: string[];
    progress?: { [courseId: string]: number };
    focusStats?: {
        totalMinutes: number;
        totalSessions: number;
    };
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

export interface RoomMember {
    uid: string;
    displayName: string;
    photoURL: string;
    avatar: string;
}

export interface Room {
    id: string;
    type: 'focus-zone' | 'warzone';
    hostId: string;
    hostName: string;
    status: 'waiting' | 'in-progress' | 'finished';
    members: RoomMember[];
    createdAt: Timestamp;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Timestamp;
}

export interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}
