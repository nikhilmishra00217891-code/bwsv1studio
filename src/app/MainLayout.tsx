

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Footer from "@/components/common/Footer";
import AiMentorWidget from "@/components/common/AiMentorWidget";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import FeedbackWidget from "@/components/common/FeedbackWidget";
import { useAuth } from "@/components/auth/AuthProvider";
import SuspendedAccountFirewall from "@/components/auth/SuspendedAccountFirewall";
import MaintenanceFirewall from "@/components/common/MaintenanceFirewall";
import { useState, useEffect } from "react";
import PwaInstall from "@/components/common/PwaInstall";
import CourseDrawer from "@/components/common/CourseDrawer";
import PushNotificationManager from "@/components/auth/PushNotificationManager";
import Header from "@/components/common/Header";


export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, userProfile, textContent } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const featureFlags = (textContent.featureFlags as Record<string, boolean>) || {};
    const isMaintenanceBypass = searchParams.get('bypass') === 'true';

    if (!isMounted) {
        return (
             <div className="flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
            </div>
        )
    }

    if (textContent.isMaintenanceMode && userProfile?.role !== 'faculty') {
        // If it's the login page accessed via bypass, show it clean.
        if (pathname === '/login' && isMaintenanceBypass) {
             return (
                 <div className="flex min-h-screen flex-col">
                    <main className="flex-1">{children}</main>
                </div>
            )
        }
        return <MaintenanceFirewall />;
    }

    const isHomepage = pathname === '/';
    const isAboutPage = pathname === '/about';
    const isDashboard = pathname === '/dashboard';
    const isGamePage = pathname.startsWith('/games/');
    const isAdminPage = pathname.startsWith('/admin/');
    const isCoursePage = pathname.startsWith('/courses/') && pathname.length > '/courses/'.length;

    if (userProfile?.suspension?.isSuspended) {
        return <SuspendedAccountFirewall reason={userProfile.suspension.reason} />;
    }

    const FloatingCTA = () => (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Button asChild size="lg" className="rounded-full shadow-lg animate-fade-in">
          <Link href="/dashboard">
            Continue Learning <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
    
    const showFloatingButtons = isHomepage || isAboutPage;
    const showCourseDrawer = user && (isHomepage || isAboutPage || isDashboard);

    return (
        <>
            <PushNotificationManager />
            <div className="flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
                {!isGamePage && !isAdminPage && !isCoursePage && (
                    <>
                        <PwaInstall />
                        <Footer />
                    </>
                )}
            </div>
             {isHomepage && user && <FloatingCTA />}
             
             {showCourseDrawer && (
                <div className="fixed bottom-6 left-6 z-50">
                    <CourseDrawer />
                </div>
             )}

            {showFloatingButtons && (
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
                    {(featureFlags.aiMentor ?? true) && <AiMentorWidget />}
                </div>
            )}
        </>
    )
}
