
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getEnrolledCoursesForUser, getCompletedMissionsForUser } from "@/lib/data";
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
        
        const [enrolledCourseData, missions, completed] = await Promise.all([
          getEnrolledCoursesForUser(user.uid),
          getMissionsForUser(user.uid),
          getCompletedMissionsForUser(user.uid)
        ]);
        
        setEnrolledCourses(enrolledCourseData);
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
