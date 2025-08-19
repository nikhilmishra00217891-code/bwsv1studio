
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isFaculty } from "@/lib/data";

export default function ContentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [facultyChecked, setFacultyChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.replace("/login");
      return;
    }

    const checkAccess = async () => {
        const userIsFaculty = await isFaculty(user.uid);
        if (!userIsFaculty) {
            router.replace("/dashboard");
        } else {
            setFacultyChecked(true);
        }
    }
    checkAccess();

  }, [user, loading, router]);

  if (loading || !facultyChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
