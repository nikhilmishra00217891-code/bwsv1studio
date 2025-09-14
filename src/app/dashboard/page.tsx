
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getEnrolledCoursesForUser, getCompletedMissionsForUser, getCoursesByIds } from "@/lib/data";
import type { EnrolledCourse, UserMission, Course } from "@/types";
import { LoaderCircle } from "lucide-react";
import { getMissionsForUser } from "@/lib/data/missions";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [todaysMissions, setTodaysMissions] = useState<UserMission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        setDataLoading(true);
        
        // This part becomes more complex as we need full course data for sessions.
        const enrolledCourseData = await getEnrolledCoursesForUser(user.uid);
        
        // Let's assume `getEnrolledCoursesForUser` is modified or we make another call
        // to get the full course objects for now.
        const courseIds = enrolledCourseData.map(c => c.courseId);
        const fullCourses = await getCoursesByIds(courseIds);

        const [missions, completed] = await Promise.all([
            getMissionsForUser(user.uid),
            getCompletedMissionsForUser(user.uid)
        ]);

        // We pass the full course objects to the dashboard now
        setEnrolledCourses(fullCourses.map(c => ({
            ...enrolledCourseData.find(ec => ec.courseId === c.id)!,
            ...c
        })));
        
        setTodaysMissions(missions);
        setCompletedMissions(completed);
        setDataLoading(false);
      };
      fetchDashboardData();
    }
  }, [user]);
  
  if (loading || dataLoading || !user || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
     <StudentDashboard 
        userProfile={userProfile}
        enrolledCourses={enrolledCourses}
        todaysMissions={todaysMissions}
        initialCompletedMissions={completedMissions}
        isReadOnly={false}
     />
  );
}
