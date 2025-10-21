
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { LoaderCircle } from "lucide-react";


export default function OnboardingPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in, redirect to login
                router.replace('/login');
            } else if (userProfile && userProfile.onboardingComplete) {
                // Already onboarded, redirect to dashboard
                router.replace('/dashboard');
            }
            // If userProfile exists but onboarding is not complete, stay on this page.
        }
    }, [user, userProfile, loading, router]);
    
    // Show a loader while checking auth state or if the user is not ready
    if (loading || !user || (userProfile && userProfile.onboardingComplete)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Only render the form if the user is logged in and HAS NOT completed onboarding
    return (
      <div className="h-screen w-screen">
        <OnboardingForm />
      </div>
    );
}
