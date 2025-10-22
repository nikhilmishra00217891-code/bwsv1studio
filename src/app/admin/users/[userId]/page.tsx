
import { getUserProfile } from "@/lib/firebase/server";
import { notFound } from "next/navigation";
import type { UserProfile } from "@/types";
import ViewStudentDashboardClient from "./ViewStudentDashboardClient";

// This is the server component. It can only fetch server-side data.
export default async function ViewStudentDashboardPage({ params }: { params: { userId: string } }) {
    const rawUserProfile = await getUserProfile(params.userId);

    if (!rawUserProfile) {
        notFound();
    }
    
    // Serialize the user profile to convert Timestamps to strings, making it safe to pass to a client component.
    const userProfile: UserProfile = JSON.parse(JSON.stringify(rawUserProfile));

    // We pass the userProfile to a Client Component, which will handle all client-side data fetching.
    return (
        <div className="animate-fade-in">
           <ViewStudentDashboardClient userProfile={userProfile} />
        </div>
    );
}
