
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card/50 min-h-[calc(100vh-8rem)] py-16">
      <div className="container mx-auto px-6">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ""} />
              <AvatarFallback className="text-3xl">
                {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-headline">{user.displayName || 'User'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg p-8">
            <div className="flex items-center gap-4">
              <User className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">Username</p>
                <p className="text-muted-foreground">{user.displayName || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
