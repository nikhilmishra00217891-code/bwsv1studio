

import { Timestamp } from "firebase/firestore";
import type { GenerateQuizInput, GenerateQuizOutput } from "@/ai/flows/generate-quiz-flow";

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'dpp' | 'pyq';
  duration: string; 
  content: string; // URL for video/pdf, or JSON for quiz
  notes?: string;
  status: 'live' | 'recorded';
}

export interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Subject {
    id: string;
    title: string;
    chapters: Chapter[];
    progress?: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  isFree: boolean;
  thumbnail: string;
  mentorName: string;
  description: string;
  // lessons is deprecated but kept for safety, use subjects instead
  lessons: Lesson[]; 
  subjects: Subject[];
  isActive: boolean;
  youtubeLink?: string;
  courseCompletionPercent?: number; // Faculty-driven progress
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

export interface FocusStats {
    totalMinutes: number;
    totalSessions: number;
}

export interface Task {
    id: number;
    text: string;
    completed: boolean;
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
    chambers?: string[]; // IDs of chambers the user is in
    progress?: { [courseId: string]: {
        progress: number;
        completedLessons: string[];
    } };
    focusStats?: FocusStats;
}

export interface RoomMember {
    uid: string;
    displayName: string;
    photoURL: string;
    avatar: string;
    roleIds?: string[];
    status?: 'waiting' | 'playing' | 'finished';
    // Inspectable properties
    focusStats?: FocusStats;
    currentCycle?: 'work' | 'break' | 'transition';
    timerSettings?: {
        workMinutes: number;
        breakMinutes: number;
    };
    tasks?: Task[];
    isTasksPublic?: boolean;
    // Warzone specific
    answers?: { [questionIndex: number]: string };
    score?: number;
    accuracy?: number;
    timeTaken?: number;
}

export interface Room {
    id: string;
    type: 'focus-zone' | 'warzone';
    hostId: string;
    hostName: string;
    status: 'waiting' | 'in-progress' | 'finished';
    members: RoomMember[];
    createdAt: Timestamp;
    quizSettings?: GenerateQuizInput;
    quizData?: GenerateQuizOutput | null;
}

export interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

// --- Parivartan Chamber Types ---

export const PERMISSIONS = {
    manageChannels: "Manage Channels",
    manageRoles: "Manage Roles",
    removeMembers: "Remove Members",
    pinMessages: "Pin Messages",
} as const;

export type Permission = keyof typeof PERMISSIONS;


export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface Reaction {
    emoji: string;
    userIds: string[];
}

export interface ReplyInfo {
    messageId: string;
    senderName: string;
    text: string;
}

export interface PollOption {
    text: string;
    voterIds: string[];
}

export interface Poll {
    question: string;
    options: PollOption[];
}

export interface ChamberMessage {
    id: string;
    messageType: 'text' | 'poll';
    text?: string;
    poll?: Poll;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    timestamp: Timestamp;
    isAiResponse?: boolean;
    reactions?: Reaction[];
    replyTo?: ReplyInfo;
    isPinned?: boolean;
    pinnedAt?: Timestamp | null;
}

export interface Channel {
    id: string;
    name: string;
    type: 'text' | 'resource' | 'whiteboard';
    pinnedMessageIds?: string[];
}

export interface Chamber {
    id: string;
    name: string;
    description: string;
    creatorId: string;
    members: RoomMember[]; // Now uses RoomMember for consistency
    memberIds: string[]; // For efficient querying
    channels: Channel[];
    roles?: Role[];
    createdAt: Timestamp;
}
