
import { Timestamp } from "firebase/firestore";
import type { GenerateQuizInput, GenerateQuizOutput } from "@/ai/flows/generate-quiz-flow";

export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
  messageType: 'text' | 'poll';
  poll?: Poll;
  isPinned?: boolean;
  pinnedAt?: Timestamp | null;
}

export interface UrlMetadata {
    url: string;
    title: string;
    description: string;
    image: string;
    siteName: string;
}

export interface PollOption {
    text: string;
    voterIds: string[];
}

export interface Poll {
    question: string;
    options: PollOption[];
    status: 'open' | 'closed';
    duration?: number; // in seconds
    endsAt?: Timestamp | null;
    correctOptionIndex?: number | null;
}


export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'dpp' | 'pyq';
  duration: string; 
  content: string; // URL for video/pdf, or JSON for quiz
  notes?: string;
  notesAttachment?: UrlMetadata | null;
  status: 'live' | 'recorded' | 'scheduled';
  scheduledTime?: Timestamp | string | null;
}

export interface StudyMaterialLink {
  id: string;
  type: 'link';
  title: string;
  url: string;
}

export interface StudyMaterialTopic {
  id: string;
  type: 'topic';
  title: string;
  subtopics: StudyMaterial[];
}

export type StudyMaterial = StudyMaterialLink | StudyMaterialTopic;


export interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
    studyMaterials?: StudyMaterial[];
}

export interface Subject {
    id: string;
    title: string;
    chapters: Chapter[];
    progress?: number;
}

export interface DailyMission {
  id: string;
  courseId: string;
  subjectId: string;
  missionDate: string; // YYYY-MM-DD format for easy querying
  details: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserMission {
    courseTitle: string;
    subjectTitle: string;
    details: string;
}

export interface Coupon {
  id: string;
  code: string;
  courseId: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Timestamp;
  timesUsed: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  grade: string;
  price: number;
  thumbnail: string;
  mentorName: string;
  description: string;
  tags?: string[];
  // lessons is deprecated but kept for safety, use subjects instead
  lessons?: Lesson[]; 
  subjects: Subject[];
  isActive: boolean;
  youtubeLink?: string;
  isFree?: boolean;
  progress?: number;
}


export interface CourseAnnouncement {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    type: 'standard' | 'alert' | 'poll';
    content?: string; // Optional for polls
    poll?: Poll;
    attachment?: UrlMetadata | null;
    reactions: { emoji: string, userIds: string[] }[];
    isPinned: boolean;
    pinnedAt?: Timestamp | null;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userGrade: string;
  text: string;
  rating: number;
  isFeatured: boolean;
  createdAt: Timestamp;
}

// EnrolledCourse now extends Course to include all its properties
export interface EnrolledCourse extends Course {
  courseId: string;
  progress: number;
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

export type PatraType = 'praise' | 'warning' | 'encouragement' | 'info';

export interface Patra {
    id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    type: PatraType;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: Timestamp;
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
    pushTokens?: string[];
    enrolledCourses?: string[];
    chambers?: string[]; // IDs of chambers the user is in
    progress?: { [courseId: string]: {
        progress: number;
        completedLessons: string[];
    } };
    focusStats?: FocusStats;
    missionCompletion?: { [date: string]: string[] }; // date: YYYY-MM-DD, value: array of mission keys
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
    status: 'waiting' | 'generating' | 'in-progress' | 'finished';
    members: RoomMember[];
    createdAt: Timestamp;
    joinRequests?: RoomMember[];
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

export interface Announcement {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    reactions: string[];
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}
