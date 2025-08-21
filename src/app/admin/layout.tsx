"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userProfile || userProfile.role !== 'faculty') {
        router.replace("/dashboard");
      }
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'faculty') {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verifying credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}
