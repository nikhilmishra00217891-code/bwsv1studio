import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login / Signup - BiharWaleSirji",
    description: "Access your dashboard and continue your learning.",
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-card/50 p-6">
      <LoginForm />
    </div>
  );
}
