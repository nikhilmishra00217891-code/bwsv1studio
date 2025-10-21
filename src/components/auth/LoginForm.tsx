
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
import { createStudentProfile } from "@/lib/data/user";
import { createFacultyUser } from "@/app/actions";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { PhoneNumberInput } from "../common/PhoneNumberInput";
import type { MobileNumber } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";

const FACULTY_SECRET_KEY = "veremor1@*2#\"3£'";

export function LoginForm() {
  const { textContent } = useAuth();
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { toast } = useToast();
  const { theme } = useTheme();

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const themeChangeCount = useRef(0);
  const lastThemeChangeTime = useRef(Date.now());

  const loginMethods = (textContent.loginMethods as Record<string, boolean>) || { google: true, phone: true, email: true };
  
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
    // Initialize reCAPTCHA verifier once on component mount
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
      });
      // Render the reCAPTCHA explicitly
      recaptchaVerifierRef.current.render().catch((error) => {
        console.error("reCAPTCHA render error:", error);
      });
    }
  }, []);

  const handleFirebaseAuthError = (error: any) => {
    let title = "An error occurred";
    let description = "Please try again later.";

    switch (error.code) {
        case 'auth/user-not-found':
            title = 'User Not Found';
            description = 'No account exists with this email. Please sign up first.';
            setIsSignUp(true);
            break;
        case 'auth/wrong-password':
            title = 'Incorrect Password';
            description = 'The password you entered is incorrect. Please try again.';
            break;
        case 'auth/email-already-in-use':
            title = 'Email Already in Use';
            description = 'An account already exists with this email. Please log in.';
            setIsSignUp(false);
            break;
        case 'auth/invalid-email':
            title = 'Invalid Email';
            description = 'Please enter a valid email address.';
            break;
        case 'auth/weak-password':
            title = 'Weak Password';
            description = 'Your password should be at least 6 characters long.';
            break;
        case 'auth/invalid-credential':
             title = 'Invalid Credentials';
             description = 'The email or password you entered is incorrect.';
             break;
        case 'auth/unauthorized-domain':
            title = 'Unauthorized Domain';
            description = 'This domain is not authorized for Google Sign-In. Please contact support.';
            break;
        default:
            description = error.message;
            break;
    }

    toast({
        variant: "destructive",
        title: title,
        description: description,
    });
  }


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
        handleFirebaseAuthError(error);
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
    
    const result = await createFacultyUser(username, email, password);
    
    if (result.success) {
        // Since the user is created on the server, we need to sign them in on the client
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Faculty Account created!", description: "Welcome to the team!" });
        router.push(redirectUrl);
    } else {
        toast({ variant: 'destructive', title: 'Creation Failed', description: result.message });
    }
    
    setIsLoading(false);
  }

  const handleEmailLogin = async () => {
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!" });
        router.push(redirectUrl);
      } catch (error: any) {
         handleFirebaseAuthError(error);
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

            if (!userDocSnap.exists() || !userDocSnap.data()?.onboardingComplete) {
                // If it's a new user OR an existing user who never finished onboarding
                await createStudentProfile(result.user);
                 toast({ title: "Welcome!", description: "Let's get you set up." });
                 router.push("/onboarding");
            } else {
                 toast({ title: `Welcome back, ${result.user.displayName}!` });
                 router.push(redirectUrl);
            }

        } catch (error: any) {
            handleFirebaseAuthError(error);
        } finally {
            setIsLoading(false);
        }
    }

  const handlePhoneSignIn = async () => {
    if (!recaptchaVerifierRef.current) {
        toast({ variant: 'destructive', title: "reCAPTCHA not initialized. Please refresh."});
        return;
    };
    
    setIsLoading(true);
    try {
        const fullPhoneNumber = `${phoneNumber.countryCode}${phoneNumber.number}`;
        const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
        toast({ title: 'OTP Sent!', description: `We've sent a code to ${fullPhoneNumber}.` });
    } catch (error: any) {
        handleFirebaseAuthError(error);
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

      if (!userDocSnap.exists() || !userDocSnap.data()?.onboardingComplete) {
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
      handleFirebaseAuthError(error);
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

  const showEmail = isFacultyMode || loginMethods.email;
  const showPhone = isFacultyMode || loginMethods.phone;
  
  const isSignupDisabled = isSignUp && !agreedToTerms;

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
            {(showEmail || showPhone) && (
                <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
                    {showEmail && <Button type="button" variant={authMethod === 'email' ? 'secondary' : 'ghost'} onClick={() => { setAuthMethod('email'); setConfirmationResult(null); }}>Email</Button>}
                    {showPhone && <Button type="button" variant={authMethod === 'phone' ? 'secondary' : 'ghost'} onClick={() => { setAuthMethod('phone'); setConfirmationResult(null); }}>Phone</Button>}
                </div>
            )}
             
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
            {isSignUp && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                    <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I agree to the 
                        <Link href="/terms" className="underline hover:text-primary" target="_blank"> Terms of Service </Link> 
                        and 
                        <Link href="/privacy" className="underline hover:text-primary" target="_blank"> Privacy Policy</Link>.
                    </label>
                </div>
            )}
            {/* This div is now inside the form but visually hidden */}
            <div ref={recaptchaContainerRef} className="absolute -z-10 -bottom-20"></div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || isSignupDisabled}>
                {isLoading ? <LoaderCircle className="animate-spin" />
                    : confirmationResult ? 'Verify OTP'
                    : authMethod === 'phone' ? 'Send OTP'
                    : isSignUp ? 'Sign Up' 
                    : 'Login'}
            </Button>

             {!isFacultyMode && loginMethods.google && (
                <>
                    <div className="flex w-full items-center gap-4">
                        <Separator className="flex-1"/>
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1"/>
                    </div>
                     <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || (isSignUp && !agreedToTerms)}>
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            className="mr-2 h-4 w-4"
                        >
                            <g>
                            <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            ></path>
                            <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            ></path>
                            <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            ></path>
                            <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            ></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                            </g>
                        </svg>
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
    </>
  );
}
