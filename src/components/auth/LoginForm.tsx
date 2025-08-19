
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { KeyRound, Mail, User as UserIcon, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createUserProfile } from "@/lib/data";
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [facultyUser, setFacultyUser] = useState<User | null>(null);

  const router = useRouter();
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


  const handleFacultySignup = async () => {
    if (!facultyUser) return;
    setIsLoading(true);
    try {
        await updateProfile(facultyUser, { displayName: username });
        await createUserProfile(facultyUser, 'faculty');
        toast({ title: "Account created!", description: "You've been successfully signed up as faculty." });
        router.push("/dashboard");
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Creation failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
        setShowConfirmation(false);
        setFacultyUser(null);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp && isFacultyMode && secretKey !== FACULTY_SECRET_KEY) {
        toast({ variant: 'destructive', title: 'Invalid Secret Key.' });
        setIsLoading(false);
        return;
    }

    try {
      if (isSignUp) {
        if(!username) {
            toast({ variant: 'destructive', title: 'Username is required.' });
            setIsLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        if(isFacultyMode) {
            setFacultyUser(userCredential.user);
            setShowConfirmation(true);
            // Don't set isLoading to false here, wait for confirmation
            return;
        }

        await updateProfile(userCredential.user, { displayName: username });
        await createUserProfile(userCredential.user, 'student');
        toast({ title: "Account created!", description: "You've been successfully signed up." });
        router.push("/dashboard");

      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!" });
        router.push("/dashboard");
      }
    } catch (error: any).