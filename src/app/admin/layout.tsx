
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VERIFIED_SESSION_KEY = 'faculty_verified_session';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!userProfile || userProfile.role !== 'faculty') {
        router.replace("/dashboard");
        return;
      }
      
      try {
        const sessionVerified = sessionStorage.getItem(VERIFIED_SESSION_KEY) === 'true';
        setIsVerified(sessionVerified);

        if (!sessionVerified && pathname !== '/admin/verify') {
          router.replace('/admin/verify');
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        // sessionStorage is not available on the server
        setIsChecking(false);
      }
    }
  }, [userProfile, loading, router, pathname]);

  if (loading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying credentials...</p>
      </div>
    );
  }

  if (!isVerified && pathname !== '/admin/verify') {
     return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting to verification...</p>
      </div>
    );
  }

  return <>{children}</>;
}
