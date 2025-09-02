
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  type User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
import { KeyRound, Mail, User as UserIcon, LoaderCircle, Sparkles, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createStudentProfile, createFacultyProfile } from "@/lib/data";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const FACULTY_SECRET_KEY = "1@*2#\"3₹'";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isFacultyMode, setIsFacultyMode] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();
  const { theme } = useTheme();

  const themeChangeCount = useRef(0);
  const lastThemeChangeTime = useRef(Date.now());
  
  useEffect(() => {
    // This effect tracks theme changes to unlock faculty mode
    if (theme) {
        const now = Date.now();
        if(now - lastThemeChangeTime.current < 2000) { // 2 seconds between changes
            themeChangeCount.current += 1;
        } else {
            themeChangeCount.current = 1; // Reset if too slow
        }
        lastThemeChangeTime.current = now;

        if(themeChangeCount.current >= 4) {
            setIsFacultyMode(true);
            toast({
                title: "Ritual Complete!",
                description: "Faculty portal unlocked.",
            });
            themeChangeCount.current = 0; // Reset after unlocking
        }
    }
  }, [theme, toast]);


  const handleStudentSignup = async () => {
    setIsLoading(true);
    if(!username) {
        toast({ variant: 'destructive', title: 'Username is required.' });
        setIsLoading(false);
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        await createStudentProfile(user);
        toast({ title: "Account created!", description: "Welcome to the Parivaar!" });
        router.push("/onboarding");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Sign Up Failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleFacultySignup = async () => {
     setIsLoading(true);
     if (secretKey !== FACULTY_SECRET_KEY) {
        toast({ variant: 'destructive', title: 'Invalid Secret Key.' });
        setIsLoading(false);
        return;
    }
    if(!username) {
        toast({ variant: 'destructive', title: 'Username is required.' });
        setIsLoading(false);
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        await createFacultyProfile(user);
        toast({ title: "Faculty Account created!", description: "Welcome to the team!" });
        router.push(redirectUrl);
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Faculty Sign Up Failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleEmailLogin = async () => {
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!" });
        router.push(redirectUrl);
      } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
        if(isFacultyMode) {
            await handleFacultySignup();
        } else {
            await handleStudentSignup();
        }
    } else {
      await handleEmailLogin();
    }
  };

  return (
    <>
      <Card className={cn("w-full max-w-md transition-all duration-500", isFacultyMode && "border-primary shadow-lg shadow-primary/20")}>
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            {isFacultyMode ? (
                <>
                 <Sparkles className="w-10 h-10 mx-auto text-primary animate-pulse"/>
                 <CardTitle className="text-2xl font-headline">Faculty Portal</CardTitle>
                 <CardDescription>Enter the realm of creators.</CardDescription>
                </>
            ) : (
                <>
                <CardTitle className="text-2xl font-headline">{isSignUp ? "Create an Account" : "Welcome Back"}</CardTitle>
                <CardDescription>
                    {isSignUp ? "Join our family to start your journey." : "Sign in to access your dashboard."}
                </CardDescription>
                </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
             {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
             {isSignUp && isFacultyMode && (
                <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="secretKey"
                        type="password"
                        placeholder="Secret Key"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="pl-10"
                        required
                    />
                </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : isSignUp ? "Sign Up" : "Login"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-primary hover:underline font-semibold"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
