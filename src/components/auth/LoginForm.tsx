
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
       setIsLoading(false);
    } 
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check if user already exists before creating profile
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await createUserProfile(result.user, 'student'); // Google sign in is for students only
      }
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
    <>
    <Card className={cn("w-full max-w-sm shadow-xl transition-all", isFacultyMode && "border-primary shadow-primary/20")}>
      <CardHeader className="text-center">
        {isFacultyMode && (
          <div className="flex justify-center items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <p className="font-semibold">Faculty Portal</p>
          </div>
        )}
        <CardTitle className="text-2xl font-headline">{isSignUp ? 'Create an Account' : 'Welcome!'}</CardTitle>
        <CardDescription>{isSignUp ? 'Enter your details to sign up.' : 'Login or create an account to continue'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {isSignUp && (
             <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                 <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="username"
                        type="text"
                        placeholder="Chintu Kumar"
                        required
                        className="pl-10"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>
          )}
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
           {isFacultyMode && isSignUp && (
             <div className="grid gap-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                 <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="secretKey"
                        type="password"
                        placeholder="Enter the secret key"
                        required
                        className="pl-10"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>
          )}
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
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isFacultyMode}>
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                <title>Google</title>
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.22 0-7.65-3.5-7.65-7.8s3.43-7.8 7.65-7.8c2.44 0 3.99 1.04 4.9 1.98l2.6-2.58C18.44 3.14 15.98 2 12.48 2 7.07 2 3.25 5.74 3.25 10.92s3.82 8.92 9.23 8.92c5.22 0 8.53-3.64 8.53-8.74 0-.82-.07-1.48-.19-2.18h-8.05z" fill="#4285F4"/>
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

    <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Ready to Revolutionize?</AlertDialogTitle>
            <AlertDialogDescription>
                Confirm your commitment to change the face of education in Bihar.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="ghost" onClick={() => {
                    setShowConfirmation(false);
                    setIsLoading(false);
                }}>Cancel</Button>
                <AlertDialogAction onClick={handleFacultySignup}>
                    {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>}
                    Confirm
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
