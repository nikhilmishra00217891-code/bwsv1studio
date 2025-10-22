
"use client";

import { useEffect, useState } from "react";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import type { EnrolledCourse, UserMission, UserProfile } from "@/types";
import { getEnrolledCoursesForUser } from '@/lib/data';
import { listenForUserProfile } from '@/lib/data/user';
import { getMissionsForUser, getCompletedMissionsForUser } from '@/lib/data/missions';
import { LoaderCircle } from 'lucide-react';

export default function ViewStudentDashboardClient({
    userProfile: initialProfile,
}: {
    userProfile: UserProfile;
}) {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [todaysMissions, setTodaysMissions] = useState<UserMission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [dataLoading, setDataLoading] = useState(true);

  // The profile passed from the server is initial data, but we can also listen for real-time updates.
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);

  useEffect(() => {
      const unsubscribe = listenForUserProfile(initialProfile.uid, (profile) => {
          if (profile) {
              setUserProfile(profile);
          }
      });
      return () => unsubscribe();
  }, [initialProfile.uid]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDataLoading(true);
      
      const [enrolledCourseData, missions, completed] = await Promise.all([
        getEnrolledCoursesForUser(initialProfile.uid),
        getMissionsForUser(initialProfile.uid),
        getCompletedMissionsForUser(initialProfile.uid)
      ]);
      
      setEnrolledCourses(enrolledCourseData);
      setTodaysMissions(missions);
      setCompletedMissions(completed);
      setDataLoading(false);
    };
    fetchDashboardData();
  }, [initialProfile.uid]);

  if (dataLoading) {
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
        isReadOnly={true}
     />
  );
}
