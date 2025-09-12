
import { getUserProfile } from "@/lib/firebase/server";
import { notFound } from "next/navigation";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { getEnrolledCoursesForUser, getMissionsForUser } from "@/lib/data/missions";

// This is the server component that fetches the student's data
export default async function ViewStudentDashboardPage({ params }: { params: { userId: string } }) {
    const userProfile = await getUserProfile(params.userId);

    if (!userProfile) {
        notFound();
    }
    
    const enrolledCourses = await getEnrolledCoursesForUser(params.userId);
    const todaysMissions = await getMissionsForUser(params.userId);

    return (
        <div className="animate-fade-in">
           <StudentDashboard 
                userProfile={userProfile}
                enrolledCourses={enrolledCourses}
                todaysMissions={todaysMissions}
                isReadOnly={true}
           />
        </div>
    );
}
