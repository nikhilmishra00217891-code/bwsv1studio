"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { KeyRound, Mail, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account created!", description: "You've been successfully signed up." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!" });
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in with Google!" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-in failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{isSignUp ? 'Create an Account' : 'Welcome!'}</CardTitle>
        <CardDescription>{isSignUp ? 'Enter your details to sign up.' : 'Login or create an account to continue'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="chintu@email.com"
                required
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                className="pl-10"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <Button className="w-full" disabled={isLoading}>
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Login'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col gap-4">
        <Button variant="link" size="sm" onClick={() => setIsSignUp(!isSignUp)} className="text-sm">
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </Button>
        <div className="relative w-full">
          <Separator />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.84-4.25 1.84A6.96 6.96 0 0 1 5 12.1a6.96 6.96 0 0 1 6.96-6.96c1.82 0 3.25.68 4.25 1.62l2.33-2.33A11.97 11.97 0 0 0 12.23 2a12.23 12.23 0 0 0-11.96 12.25c0 6.62 5.34 11.96 11.96 11.96 6.42 0 11.43-4.38 11.43-11.75 0-.78-.08-1.48-.2-2.15z"
              ></path>
            </svg>
          )}
          Google
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="#" className="underline hover:text-primary">
            Terms of Service
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
