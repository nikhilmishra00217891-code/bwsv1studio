
"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function PrivacyPolicyPage() {
  const { textContent } = useAuth();
  const privacyContent = (textContent.privacy_policy as string) || "Privacy Policy content has not been set yet. Please check back later.";

  return (
    <div className="bg-card/50 py-20 md:py-28 animate-fade-in">
        <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-8 text-center">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none bg-card p-8 rounded-lg shadow-lg">
                    <p className="whitespace-pre-wrap break-words">{privacyContent}</p>
                </div>
            </div>
        </div>
    </div>
  );
}
