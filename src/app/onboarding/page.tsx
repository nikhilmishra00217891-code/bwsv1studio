
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
        if (loading) {
            return; // Wait until auth state is fully resolved
        }

        if (!user) {
            // Not logged in, redirect to login
            router.replace('/login');
        } else if (userProfile?.onboardingComplete) {
            // Logged in AND onboarding is marked as complete
            router.replace('/dashboard');
        }
        // If user is logged in but profile is loading or onboarding is not complete,
        // this effect does nothing, allowing the component to render the form.

    }, [user, userProfile, loading, router]);
    
    // Show a loader while checking auth state or if user exists but profile is still loading.
    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If we reach here, the user is logged in.
    // If their profile is loaded and onboarding is NOT complete, show the form.
    if (userProfile && !userProfile.onboardingComplete) {
         return (
            <div className="h-screen w-screen">
                <OnboardingForm />
            </div>
        );
    }
    
    // Fallback loader for any other transitional states (e.g., profile is loading)
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}
