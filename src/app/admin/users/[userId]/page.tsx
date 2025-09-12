
import { getUserProfile } from "@/lib/firebase/server";
import { notFound } from "next/navigation";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { getEnrolledCoursesForUser, getCompletedMissionsForUser } from "@/lib/data";
import { getMissionsForUser } from "@/lib/data/missions";
import type { UserProfile } from "@/types";

// This is the server component that fetches the student's data
export default async function ViewStudentDashboardPage({ params }: { params: { userId: string } }) {
    const rawUserProfile = await getUserProfile(params.userId);

    if (!rawUserProfile) {
        notFound();
    }
    
    // Serialize the user profile to convert Timestamps to strings
    const userProfile: UserProfile = JSON.parse(JSON.stringify(rawUserProfile));

    const enrolledCourses = await getEnrolledCoursesForUser(params.userId);
    const todaysMissions = await getMissionsForUser(params.userId);
    const completedMissions = await getCompletedMissionsForUser(params.userId);

    return (
        <div className="animate-fade-in">
           <StudentDashboard 
                userProfile={userProfile}
                enrolledCourses={enrolledCourses}
                todaysMissions={todaysMissions}
                initialCompletedMissions={completedMissions}
                isReadOnly={true}
           />
        </div>
    );
}
