
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
  type User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
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
import { KeyRound, Mail, User as UserIcon, LoaderCircle, Sparkles, LockKeyhole, Phone } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createStudentProfile, createFacultyProfile } from "@/lib/data";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { PhoneNumberInput } from "../common/PhoneNumberInput";
import type { MobileNumber } from "@/types";

const FACULTY_SECRET_KEY = "1@*2#\"3₹'";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isFacultyMode, setIsFacultyMode] = useState(false);
  
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState<MobileNumber>({ countryCode: '+91', number: '' });
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();
  const { theme } = useTheme();

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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

   useEffect(() => {
    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
      });
      recaptchaVerifierRef.current = verifier;
    }
  }, [authMethod]);


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

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            const userDocRef = doc(db, "users", result.user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await createStudentProfile(result.user);
                 toast({ title: "Welcome!", description: "Let's get you set up." });
                 router.push("/onboarding");
            } else {
                 toast({ title: `Welcome back, ${result.user.displayName}!` });
                 router.push(redirectUrl);
            }

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Google Sign-In Failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

  const handlePhoneSignIn = async () => {
    if (!recaptchaVerifierRef.current) return;
    
    setIsLoading(true);
    try {
        const fullPhoneNumber = `${phoneNumber.countryCode}${phoneNumber.number}`;
        const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
        toast({ title: 'OTP Sent!', description: `We've sent a code to ${fullPhoneNumber}.` });
    } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Failed to Send OTP', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
          if (isSignUp) {
                if(!username) {
                    toast({ variant: 'destructive', title: 'Username is required.' });
                    setIsLoading(false);
                    return;
                }
                await updateProfile(result.user, { displayName: username });
                await createStudentProfile(result.user);
                toast({ title: "Account created!", description: "Welcome to the Parivaar!" });
                router.push("/onboarding");
          } else {
                toast({ variant: 'destructive', title: "Account Not Found", description: "Please sign up first." });
                setIsSignUp(true);
          }
      } else {
         toast({ title: `Welcome back, ${userDocSnap.data().displayName}!` });
         router.push(redirectUrl);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Invalid OTP', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMethod === 'phone') {
        if (confirmationResult) {
            await handleOtpSubmit();
        } else {
            await handlePhoneSignIn();
        }
        return;
    }

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

  const renderEmailForm = () => (
    <>
      {isSignUp && (
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="username" type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10" required
          />
        </div>
      )}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="email" type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10" required
        />
      </div>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="password" type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10" required
        />
      </div>
    </>
  );

  const renderPhoneForm = () => (
    <>
       {isSignUp && (
            <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                id="username-phone" type="text" placeholder="Username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10" required
            />
            </div>
        )}
        <div className="relative">
            <PhoneNumberInput value={phoneNumber} onChange={setPhoneNumber} />
        </div>
    </>
  );
  
  const renderOtpForm = () => (
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="otp" type="text" placeholder="Enter 6-digit OTP" value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="pl-10" required maxLength={6}
        />
      </div>
  )

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
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
                <Button type="button" variant={authMethod === 'email' ? 'secondary' : 'ghost'} onClick={() => { setAuthMethod('email'); setConfirmationResult(null); }}>Email</Button>
                <Button type="button" variant={authMethod === 'phone' ? 'secondary' : 'ghost'} onClick={() => { setAuthMethod('phone'); setConfirmationResult(null); }}>Phone</Button>
            </div>
             
             {confirmationResult ? renderOtpForm() : authMethod === 'email' ? renderEmailForm() : renderPhoneForm()}
             
             {isSignUp && isFacultyMode && authMethod === 'email' && (
                <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="secretKey" type="password" placeholder="Secret Key" value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="pl-10" required
                    />
                </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin" />
                    : confirmationResult ? 'Verify OTP'
                    : authMethod === 'phone' ? 'Send OTP'
                    : isSignUp ? 'Sign Up' 
                    : 'Login'}
            </Button>

             {!isFacultyMode && (
                <>
                    <div className="flex w-full items-center gap-4">
                        <Separator className="flex-1"/>
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1"/>
                    </div>
                     <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                        <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.05 1.67-3.27 0-5.93-2.66-5.93-5.93s2.66-5.93 5.93-5.93c1.7 0 3.14.63 4.13 1.56l2.58-2.58C18.04 3.82 15.6 2.5 12.48 2.5c-5.48 0-9.93 4.45-9.93 9.93s4.45 9.93 9.93 9.93c2.8 0 4.93-1 6.6-2.63 1.8-1.8 2.54-4.28 2.54-6.62 0-.66-.06-1.26-.17-1.84z"></path></svg>
                        Sign {isSignUp ? "up" : "in"} with Google
                    </Button>
                </>
             )}

            <div className="text-sm text-center text-muted-foreground">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => { setIsSignUp(false); setConfirmationResult(null); }}
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
                    onClick={() => { setIsSignUp(true); setConfirmationResult(null); }}
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
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </>
  );
}
