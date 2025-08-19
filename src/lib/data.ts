import type { Course, Testimonial, EnrolledCourse } from "@/types";

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

export const enrolledCourses: EnrolledCourse[] = [
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

export const getCourses = async () => {
  return courses;
};

export const getCourseById = async (id: string) => {
    return courses.find(course => course.id === id);
}

export const getFeaturedCourses = async () => {
  return courses.slice(0, 3);
};

export const getTestimonials = async () => {
  return testimonials;
};

export const getEnrolledCourses = async (userId: string) => {
    // In a real app, you'd fetch this based on the userId
    return enrolledCourses;
}
