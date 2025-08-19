
import type { Course, Testimonial, EnrolledCourse, UserProfile } from "@/types";
import { db } from "./firebase";
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";


export const courses: Course[] = [
  {
    id: "jee-physics-01",
    title: "JEE Physics: Complete Mechanics",
    category: "Physics",
    isFree: true,
    thumbnail: "https://placehold.co/600x400.png",
    mentorName: "Rahul Bhaiya",
    description: "Master the fundamentals of mechanics for your JEE preparation. This course covers everything from Kinematics to Rotational Motion with a focus on problem-solving techniques.",
    lessons: [
      { id: "l1", title: "Introduction to Kinematics", type: "video", duration: "25 min" },
      { id: "l2", title: "Newton's Laws of Motion", type: "video", duration: "45 min" },
      { id: "l3", title: "Work, Energy, and Power", type: "video", duration: "35 min" },
      { id: "l4", title: "Rotational Motion", type: "pdf", duration: "50 pages" },
    ],
  },
  {
    id: "neet-biology-01",
    title: "NEET Biology: Human Physiology",
    category: "Biology",
    isFree: false,
    thumbnail: "https://placehold.co/600x400.png",
    mentorName: "Priya Didi",
    description: "A deep dive into the systems of the human body. This course is crucial for any NEET aspirant aiming for a top score in Biology.",
    lessons: [
      { id: "l1", title: "Digestive System", type: "video", duration: "40 min" },
      { id: "l2", title: "Respiratory System", type: "video", duration: "30 min" },
      { id: "l3", title: "Nervous System - Part 1", type: "video", duration: "50 min" },
      { id: "l4", title: "Endocrine System", type: "pdf", duration: "60 pages" },
    ],
  },
  {
    id: "jee-chemistry-01",
    title: "JEE Advanced: Organic Chemistry",
    category: "Chemistry",
    isFree: false,
    thumbnail: "https://placehold.co/600x400.png",
    mentorName: "Amit Bhaiya",
    description: "Tackle the most challenging topics in Organic Chemistry. This course is designed to build a strong conceptual foundation for JEE Advanced.",
    lessons: [
        { id: "l1", title: "General Organic Chemistry (GOC)", type: "video", duration: "60 min" },
        { id: "l2", title: "Reaction Mechanisms", type: "video", duration: "55 min" },
        { id: "l3", title: "Biomolecules", type: "pdf", duration: "45 pages" },
    ],
  },
    {
    id: "bpsc-history-01",
    title: "BPSC Special: History of Bihar",
    category: "History",
    isFree: true,
    thumbnail: "https://placehold.co/600x400.png",
    mentorName: "Sanjay Sir",
    description: "Explore the rich history of Bihar, from ancient empires to its role in modern India. A must-know for all BPSC aspirants.",
    lessons: [
        { id: "l1", title: "Ancient History of Bihar", type: "video", duration: "45 min" },
        { id: "l2", title: "Bihar during the Freedom Struggle", type: "video", duration: "50 min" },
        { id: "l3", title: "Post-Independence Bihar", type: "pdf", duration: "40 pages" },
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Aman Kumar",
    role: "JEE Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "BiharWaleSirji feels like learning from an elder brother. The concepts are explained so clearly, and the AI mentor is a game-changer for late-night doubts!",
  },
  {
    id: "t2",
    name: "Sunita Singh",
    role: "NEET Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "The personal touch is what makes this platform special. Priya Didi's biology course is fantastic. I finally feel confident in my preparation.",
  },
  {
    id: "t3",
    name: "Rajesh Mahto",
    role: "BPSC Aspirant",
    avatar: "https://placehold.co/100x100.png",
    text: "Finally, a platform that understands students from Bihar. The teaching style is relatable, and the content is top-notch. Highly recommended.",
  },
];

// This is mock data. In a real app, this would be fetched from a user's collection in Firestore.
const mockEnrolledCourses: EnrolledCourse[] = [
    {
        courseId: "jee-physics-01",
        title: "JEE Physics: Complete Mechanics",
        category: "Physics",
        thumbnail: "https://placehold.co/600x400.png",
        progress: 75,
    },
    {
        courseId: "jee-chemistry-01",
        title: "JEE Advanced: Organic Chemistry",
        category: "Chemistry",
        thumbnail: "https://placehold.co/600x400.png",
        progress: 40,
    }
]

export const getCourses = async (): Promise<Course[]> => {
  // In a real app, you might fetch this from Firestore
  return courses;
};

export const getCourseById = async (id: string): Promise<Course | undefined> => {
    // In a real app, you might fetch this from Firestore
    return courses.find(course => course.id === id);
}

export const getFeaturedCourses = async (): Promise<Course[]> => {
    // In a real app, you might fetch this from Firestore
  return courses.slice(0, 3);
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
    // In a real app, you might fetch this from Firestore
  return testimonials;
};


export const getEnrolledCoursesForUser = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const enrolledCourseIds: string[] = userData.enrolledCourses || [];

      if(enrolledCourseIds.length === 0) return [];

      const enrolledCoursesPromises = enrolledCourseIds.map(async (courseId) => {
        const courseData = courses.find(c => c.id === courseId); // finding from mock data for now
        const progress = userData.progress?.[courseId] || 0;
        if(courseData) {
          return {
            courseId: courseData.id,
            title: courseData.title,
            category: courseData.category,
            thumbnail: courseData.thumbnail,
            progress: progress,
          };
        }
        return null;
      });
      
      const enrolledCourses = (await Promise.all(enrolledCoursesPromises)).filter(c => c !== null) as EnrolledCourse[];
      return enrolledCourses;

    } else {
      console.log("No such user!");
      return [];
    }
  } catch(error) {
    console.error("Error fetching enrolled courses:", error);
    return []; // Return empty array on error
  }
};

export const createUserProfile = async (user: User, role: 'student' | 'faculty' = 'student') => {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        const { uid, email, displayName, photoURL } = user;
        const createdAt = new Date();

        try {
            await setDoc(userDocRef, {
                uid,
                email,
                displayName,
                photoURL,
                role,
                createdAt,
                enrolledCourses: [],
                progress: {},
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
};


export const isFaculty = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() && userDocSnap.data().role === 'faculty';
  } catch (error) {
    console.error("Error checking faculty status:", error);
    return false;
  }
}

export const getTextContent = async (contentId: string): Promise<string | null> => {
    try {
        const docRef = doc(db, "siteContent", "text");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data()[contentId] || null;
        }
        return null;
    } catch (error) {
        console.error("Error fetching text content:", error);
        return null;
    }
}

export const saveTextContent = async (contentId: string, newText: string) => {
    try {
        const docRef = doc(db, "siteContent", "text");
        await updateDoc(docRef, {
            [contentId]: newText
        });
    } catch (error: any) {
        if (error.code === 'not-found') {
            await setDoc(doc(db, "siteContent", "text"), { [contentId]: newText });
        } else {
            console.error("Error saving text content:", error);
            throw error;
        }
    }
}
