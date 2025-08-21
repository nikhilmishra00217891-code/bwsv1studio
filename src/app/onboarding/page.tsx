
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Welcome! - BiharWaleSirji",
    description: "Let's get you set up for an amazing learning journey.",
}

export default function OnboardingPage() {
    return <OnboardingForm />;
}
