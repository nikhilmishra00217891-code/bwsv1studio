
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AiMentorWidget from "@/components/common/AiMentorWidget";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import Link from "next/link";
import FeedbackWidget from "@/components/common/FeedbackWidget";
import { useAuth } from "@/components/auth/AuthProvider";
import SuspendedAccountFirewall from "@/components/auth/SuspendedAccountFirewall";


export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { userProfile } = useAuth();
    const isOnboarding = pathname === '/onboarding';
    const isHomepage = pathname === '/';

    if (userProfile?.suspension?.isSuspended) {
        return <SuspendedAccountFirewall reason={userProfile.suspension.reason} />;
    }

    return (
        <>
            <div className="flex min-h-screen flex-col">
                {!isOnboarding && <Header />}
                <main className="flex-1">{children}</main>
                {isHomepage && <Footer />}
            </div>
            {!isOnboarding && (
                 <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
                    <FeedbackWidget />
                    <Button
                        asChild
                        className="h-16 w-16 rounded-full shadow-lg"
                        size="icon"
                        aria-label="Contact Us"
                    >
                        <Link href="/contact">
                        <Phone className="h-8 w-8" />
                        </Link>
                    </Button>
                    <AiMentorWidget />
                </div>
            )}
        </>
    )
}
