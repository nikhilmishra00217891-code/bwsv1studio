
"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, MoveRight } from "lucide-react";
import { Button } from "../ui/button";

const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight animate-drop-in">
                Welcome, Future Achiever!
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto animate-fade-in animation-delay-500">
                "The best way to predict the future is to create it."
            </p>
            <Button size="lg" className="mt-10 animate-fade-in animation-delay-1000" onClick={onNext}>
                Let's Begin <MoveRight className="ml-2" />
            </Button>
        </div>
    )
}

// Placeholder for future steps
const PlaceholderStep = ({ step, onNext, onPrev }: { step: number; onNext: () => void; onPrev: () => void; }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">Step {step}</h2>
            <p>This is a placeholder for step {step}.</p>
            <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={onPrev}>Back</Button>
                <Button onClick={onNext}>Next</Button>
            </div>
        </div>
    )
}


export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 10;

  const nextStep = () => setStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleFinish = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        // Here we'll save all the collected data
        await updateUserProfile(user.uid, { onboardingComplete: true });
        toast({
            title: "Awesome! You’re all set.",
            description: "Let’s start your journey 🚀",
        });
        router.push('/dashboard');
    } catch (error) {
        console.error("Failed to save onboarding data", error);
        toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Could not save your preferences. Please try again.",
        })
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-card/50 p-6">
        <div className="w-full max-w-4xl">
            {step === 1 && <WelcomeStep onNext={nextStep} />}
            {step > 1 && step < totalSteps && <PlaceholderStep step={step} onNext={nextStep} onPrev={prevStep} />}
            {step === totalSteps && (
                <div>
                     <h2 className="text-2xl font-bold">Step {totalSteps} - Finish</h2>
                     <p>This is a placeholder for the final step.</p>
                    <div className="flex justify-between mt-8">
                        <Button variant="outline" onClick={prevStep}>Back</Button>
                        <Button onClick={handleFinish} disabled={isLoading}>
                             {isLoading ? <LoaderCircle className="animate-spin" /> : "Go to Dashboard"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
