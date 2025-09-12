
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getEnrolledCoursesForUser } from "@/lib/data";
import type { EnrolledCourse, UserMission } from "@/types";
import { LoaderCircle } from "lucide-react";
import { getMissionsForUser } from "@/lib/data/missions";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [todaysMissions, setTodaysMissions] = useState<UserMission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        setDataLoading(true);
        const courses = await getEnrolledCoursesForUser(user.uid);
        const missions = await getMissionsForUser(user.uid);
        setEnrolledCourses(courses);
        setTodaysMissions(missions);
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
        isReadOnly={false}
     />
  );
}
