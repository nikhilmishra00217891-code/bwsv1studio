
import type { Course, Testimonial, EnrolledCourse, UserProfile } from "@/types";
import { db } from "./firebase";
import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";


export const getCourses = async (isFaculty: boolean = false): Promise<Course[]> => {
  const coursesCol = collection(db, "courses");
  
  let q;
  if (isFaculty) {
    // Faculty sees all courses
    q = query(coursesCol, orderBy("title"));
  } else {
    // Students only see active courses
    q = query(coursesCol, where("isActive", "==", true), orderBy("title"));
  }

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Course)
  );
};

export const listenForCourses = (isFaculty: boolean, callback: (courses: Course[]) => void): () => void => {
    const coursesCol = collection(db, "courses");
    
    let q;
    if (isFaculty) {
        // Faculty sees all courses, ordered by title
        q = query(coursesCol, orderBy("title"));
    } else {
        // Students only see active courses, ordered by title
        q = query(coursesCol, where("isActive", "==", true), orderBy("title"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            callback([]);
            return;
        }
        const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        callback(courses);
    }, (error) => {
        console.error("Error listening for courses:", error);
        // You might want to handle errors in the callback as well
        callback([]);
    });

    return unsubscribe; // Return the unsubscribe function
};

export const getCourseById = async (id: string): Promise<Course | null> => {
    const courseDocRef = doc(db, 'courses', id);
    const docSnap = await getDoc(courseDocRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Course;
    } else {
        return null;
    }
}

export const createCourse = async (): Promise<string> => {
  const coursesCol = collection(db, "courses");
  const newCourseData = {
    title: "New Course Title",
    category: "New Category",
    description: "A brief description of your new course. You can edit this later.",
    mentorName: "Faculty Name",
    thumbnail: "https://placehold.co/600x400.png",
    isFree: false,
    isActive: false, // Default to inactive
    lessons: [],
    youtubeLink: "",
  };
  const docRef = await addDoc(coursesCol, newCourseData);
  return docRef.id;
}

export const updateCourse = async (courseId: string, data: Partial<Course>) => {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, data);
}

export const deleteCourse = async (courseId: string) => {
    const courseRef = doc(db, "courses", courseId);
    await deleteDoc(courseRef);
}


export const getFeaturedCourses = async (): Promise<Course[]> => {
  const coursesCol = collection(db, "courses");
  const q = query(coursesCol, where("isActive", "==", true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];
  
  const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  return courses.slice(0, 3); // In a real app, you might have a 'isFeatured' flag
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Aman Kumar",
    role: "JEE Aspirant",
    avatar: "https://i.postimg.cc/d1W1VcYF/aman-kumar.png",
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

export const getTestimonials = async (): Promise<Testimonial[]> => {
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
        const courseData = await getCourseById(courseId);
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
        const { uid, email, displayName } = user;
        const createdAt = new Date();

        try {
            await setDoc(userDocRef, {
                uid,
                email,
                displayName,
                // Do not set photoURL here, it will be handled by avatar selection
                role,
                createdAt,
                onboardingComplete: false,
                enrolledCourses: [],
                progress: {},
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
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

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const usersCol = collection(db, "users");
    const q = query(usersCol, orderBy("displayName"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        
        const serializedData: any = { ...data };

        // Manually convert Firestore Timestamp to a serializable format (ISO string)
        if (data.createdAt instanceof Timestamp) {
            serializedData.createdAt = data.createdAt.toDate().toISOString();
        }

        if (data.suspension?.suspendedAt instanceof Timestamp) {
            serializedData.suspension.suspendedAt = data.suspension.suspendedAt.toDate().toISOString();
        }

        return serializedData as UserProfile;
    });
};
