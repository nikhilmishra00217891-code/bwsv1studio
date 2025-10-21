
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import type { EnrolledCourse, UserMission } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until loading is complete
    }

    if (!user) {
      // If no user, send to login
      router.replace("/login");
      return;
    }
    
    if (user && userProfile && !userProfile.onboardingComplete) {
      // If user is logged in but has NOT completed onboarding,
      // strictly enforce redirection to the onboarding page.
      router.replace("/onboarding");
      return;
    }

  }, [user, userProfile, loading, router]);
  
  if (pathname === '/dashboard' && !loading && user) {
    return <>{children}</>;
  }


  if (loading || !user || !userProfile || !userProfile.onboardingComplete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
