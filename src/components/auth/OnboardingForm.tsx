
"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, MoveRight, User, Cake, School, BookCopy, Target, Pencil, Check, Brain, Gauge, Timer, UserCheck, Star, Trophy, Gift, Lightbulb, Handshake, Sun, Sunset, Moon, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import type { UserProfile } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
                Let’s Begin <MoveRight className="ml-2" />
            </Button>
        </div>
    )
}

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const subjectOptions = [
    { value: 'Physics', label: 'Physics', icon: '⚛️' },
    { value: 'Chemistry', label: 'Chemistry', icon: '🧪' },
    { value: 'Maths', label: 'Maths', icon: '∑' },
    { value: 'Biology', label: 'Biology', icon: '🧬' },
    { value: 'English', label: 'English', icon: '✍️' },
    { value: 'History', label: 'History', icon: '📜' },
]

const goalOptions = [
    { id: 'exam', title: 'Crack Competitive Exams', subtitle: 'e.g., JEE, NEET, NDA', details: "We'll focus on rigorous practice, mock tests, and advanced problem-solving."},
    { id: 'boards', title: 'Score 95%+ in Boards', subtitle: 'Excel in your school exams.', details: "Let's master the syllabus, key concepts, and perfect answer-writing skills."},
    { id: 'discipline', title: 'Build Daily Study Discipline', subtitle: 'Create a consistent routine.', details: "Boost your daily practice streaks and build a powerful, lasting habit."},
    { id: 'strengthen', title: 'Strengthen Weak Subjects', subtitle: 'Turn weaknesses into strengths.', details: "We'll provide targeted exercises and extra support where you need it most."},
    { id: 'concepts', title: 'Understand Concepts Deeply', subtitle: 'Not just for memorizing.', details: "Fall in love with learning by understanding the 'why' behind every topic."}
];

const challengeOptions = [
    { id: 'focus', title: 'Staying Focused', icon: Brain },
    { id: 'memory', title: 'Remembering What I Study', icon: Gauge },
    { id: 'time', title: 'Time Management', icon: Timer },
    { id: 'guidance', title: 'Lack of Good Guidance', icon: UserCheck },
    { id: 'consistency', title: 'Consistency', icon: Star },
]

const studyTimeOptions = [
    { id: 'morning', title: 'Morning', icon: Sun },
    { id: 'afternoon', title: 'Afternoon', icon: Sparkles },
    { id: 'evening', title: 'Evening', icon: Sunset },
    { id: 'night', title: 'Night', icon: Moon },
]

const motivationOptions = [
    { id: 'competition', title: 'Competition', subtitle: 'I like challenges with others.', icon: Trophy },
    { id: 'rewards', title: 'Rewards', subtitle: 'Streaks, points, achievements.', icon: Gift },
    { id: 'inspiration', title: 'Inspiration', subtitle: 'Motivational content & quotes.', icon: Lightbulb },
    { id: 'guidance', title: 'Guidance', subtitle: 'Teacher feedback & reminders.', icon: Handshake },
]


const OnboardingStepWrapper = ({ title, children, step }: { title: string, children: React.ReactNode, step: number }) => (
    <div className="animate-slide-in-from-right w-full max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm font-semibold text-primary tracking-widest uppercase text-center">{`Step ${step - 1} / 10`}</p>
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mt-2 mb-12">{title}</h2>
        {children}
    </div>
)

const BasicDetailsStep = ({ data, setData }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void }) => {
    return (
        <OnboardingStepWrapper title="Tell Us a Little About Yourself" step={2}>
            <div className="max-w-lg mx-auto space-y-8">
                <div className="relative flex items-center">
                    <User className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    <Input 
                        type="text" 
                        placeholder="What should we call you?"
                        className="pl-12 h-14 text-lg"
                        value={data.displayName || ''}
                        onChange={(e) => setData({ displayName: e.target.value })}
                    />
                </div>
                <div className="relative flex items-center">
                    <Cake className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    <Input 
                        type="number"
                        placeholder="Your age (optional)"
                        className="pl-12 h-14 text-lg"
                        value={data.age || ''}
                        onChange={(e) => setData({ age: parseInt(e.target.value) || undefined })}
                    />
                </div>
                <div>
                     <p className="text-muted-foreground text-center mb-4">Your gender (optional)</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {genderOptions.map(option => (
                            <Card 
                                key={option.value}
                                className={cn(
                                    "p-4 flex items-center justify-center text-center cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg",
                                    data.gender === option.value && "ring-2 ring-primary shadow-lg scale-105"
                                )}
                                onClick={() => setData({ gender: option.value as any })}
                            >
                                {option.label}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </OnboardingStepWrapper>
    )
}

const AcademicInfoStep = ({ data, setData }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void }) => {
    const [customBoard, setCustomBoard] = useState(false);
    const toggleSubject = (subject: string) => {
        const currentSubjects = data.subjects || [];
        const newSubjects = currentSubjects.includes(subject)
            ? currentSubjects.filter(s => s !== subject)
            : [...currentSubjects, subject];
        setData({ subjects: newSubjects });
    }

    return (
        <OnboardingStepWrapper title="Your Academic World" step={3}>
            <div className="max-w-xl mx-auto space-y-10">
                 <div className="relative flex items-center">
                    <School className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    <Input 
                        type="text"
                        placeholder="Which class/grade are you in?"
                        className="pl-12 h-14 text-lg"
                        value={data.grade || ''}
                        onChange={(e) => setData({ grade: e.target.value })}
                    />
                </div>
                 <div className="relative flex items-center">
                    <BookCopy className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    {customBoard ? (
                         <Input 
                            type="text"
                            placeholder="Please specify your board"
                            className="pl-12 h-14 text-lg"
                            value={data.board || ''}
                            onChange={(e) => setData({ board: e.target.value })}
                            autoFocus
                        />
                    ) : (
                         <Input 
                            type="text"
                            placeholder="Your board (e.g., CBSE, ICSE)"
                            className="pl-12 h-14 text-lg"
                             value={data.board || ''}
                            onChange={(e) => setData({ board: e.target.value })}
                        />
                    )}
                     <Button variant="ghost" className="absolute right-2" onClick={() => setCustomBoard(prev => !prev)}>
                         <Pencil className="w-4 h-4"/>
                     </Button>
                </div>
                 <div>
                     <p className="text-muted-foreground text-center mb-4">Choose your core subjects</p>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {subjectOptions.map(option => (
                            <Card 
                                key={option.value}
                                className={cn(
                                    "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg relative",
                                     (data.subjects || []).includes(option.value) && "ring-2 ring-primary shadow-lg scale-105"
                                )}
                                onClick={() => toggleSubject(option.value)}
                            >
                                <span className="text-4xl mb-2">{option.icon}</span>
                                <span className="font-semibold">{option.label}</span>
                                {(data.subjects || []).includes(option.value) && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </OnboardingStepWrapper>
    )
}

const LearningJourneyStep = ({ data, setData }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void }) => {
    const toggleGoal = (goal: string) => {
        const currentGoals = data.goals || [];
        const newGoals = currentGoals.includes(goal)
            ? currentGoals.filter(g => g !== goal)
            : [...currentGoals, goal];
        setData({ goals: newGoals });
    }
     const toggleChallenge = (challenge: string) => {
        const current = data.challenges || [];
        const newChallenges = current.includes(challenge)
            ? current.filter(c => c !== challenge)
            : [...current, challenge];
        setData({ challenges: newChallenges });
    }
     const toggleMotivation = (motivation: string) => {
        const current = data.motivationStyles || [];
        const newStyles = current.includes(motivation)
            ? current.filter(s => s !== motivation)
            : [...current, motivation];
        setData({ motivationStyles: newStyles });
    }


    return (
        <OnboardingStepWrapper title="Your Learning Journey" step={4}>
            <div className="max-w-3xl mx-auto space-y-16">
                {/* Main Goal */}
                <div>
                    <h3 className="text-xl font-bold text-center mb-2">What is your main goal?</h3>
                    <p className="text-muted-foreground text-center mb-6">Select one or more that apply.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goalOptions.map(goal => (
                            <div key={goal.id} className="[perspective:1000px]" onClick={() => toggleGoal(goal.title)}>
                                <Card className={cn(
                                    "min-h-48 p-4 flex items-center justify-center text-center cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]",
                                    (data.goals || []).includes(goal.title) && "[transform:rotateY(180deg)]"
                                )}>
                                    <div className="[backface-visibility:hidden] absolute inset-0 flex flex-col items-center justify-center p-4">
                                        <p className="text-xl font-headline">{goal.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{goal.subtitle}</p>
                                    </div>
                                    <div className="[backface-visibility:hidden] [transform:rotateY(180deg)] absolute inset-0 flex flex-col items-center justify-center p-6 bg-primary text-primary-foreground rounded-lg">
                                        <Check className="w-12 h-12 mb-2" />
                                        <p className="font-semibold text-sm">{goal.details}</p>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Biggest Challenge */}
                <div>
                     <h3 className="text-xl font-bold text-center mb-2">What's your biggest challenge right now?</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        {challengeOptions.map(option => (
                           <Card key={option.id}
                                onClick={() => toggleChallenge(option.title)}
                                className={cn(
                                    "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform-gpu",
                                    "hover:shadow-lg hover:border-primary/50",
                                     (data.challenges || []).includes(option.title) ? "animate-pop-in ring-2 ring-primary shadow-xl" : "hover:-translate-y-1"
                                )}>
                                <option.icon className="w-10 h-10 mb-2 text-primary" />
                                <span className="font-semibold">{option.title}</span>
                           </Card>
                        ))}
                     </div>
                </div>
                
                 {/* Study Duration */}
                 <div>
                    <h3 className="text-xl font-bold text-center mb-6">How long do you usually study daily?</h3>
                    <div className="max-w-md mx-auto px-4">
                        <Slider
                            defaultValue={[1.5]}
                            value={[data.preferredStudyDuration || 1.5]}
                            onValueChange={(value) => setData({ preferredStudyDuration: value[0] })}
                            max={8}
                            min={0.5}
                            step={0.5}
                        />
                         <p className="text-center font-bold text-primary text-lg mt-4">{data.preferredStudyDuration || 1.5} hours</p>
                    </div>
                 </div>

                 {/* Study Time */}
                <div>
                    <h3 className="text-xl font-bold text-center mb-6">When do you feel most productive?</h3>
                    <RadioGroup 
                        value={data.preferredStudyTime}
                        onValueChange={(value) => setData({ preferredStudyTime: value as any })}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {studyTimeOptions.map(option => (
                            <Label key={option.id} htmlFor={option.id} className="cursor-pointer">
                                <Card className={cn("p-4 flex flex-col items-center justify-center text-center transition-all",
                                    data.preferredStudyTime === option.id && "ring-2 ring-primary"
                                )}>
                                     <RadioGroupItem value={option.id} id={option.id} className="sr-only"/>
                                     <option.icon className="w-10 h-10 mb-2 text-primary"/>
                                     <span className="font-semibold">{option.title}</span>
                                </Card>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>

                 {/* Motivation Style */}
                <div>
                     <h3 className="text-xl font-bold text-center mb-2">What pushes you to keep going?</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {motivationOptions.map(option => (
                           <Card key={option.id}
                                onClick={() => toggleMotivation(option.title)}
                                className={cn(
                                    "p-4 flex items-center gap-4 cursor-pointer transition-all duration-200",
                                    "hover:shadow-lg hover:border-primary/50",
                                     (data.motivationStyles || []).includes(option.title) && "ring-2 ring-primary"
                                )}>
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <option.icon className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <span className="font-bold">{option.title}</span>
                                    <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                                </div>
                                {(data.motivationStyles || []).includes(option.title) &&
                                    <div className="ml-auto text-primary">
                                        <Check className="w-6 h-6"/>
                                    </div>
                                }
                           </Card>
                        ))}
                     </div>
                </div>

            </div>
        </OnboardingStepWrapper>
    );
};


// Placeholder for future steps
const PlaceholderStep = ({ step, onNext, onPrev }: { step: number; onNext: () => void; onPrev: () => void; }) => {
    return (
        <div className="flex h-full items-center justify-center">
            <div>
                <h2 className="text-2xl font-bold">Step {step}</h2>
                <p>This is a placeholder for step {step}.</p>
                <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={onPrev}>Back</Button>
                    <Button onClick={onNext}>Next</Button>
                </div>
            </div>
        </div>
    )
}


export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<Partial<UserProfile>>({});
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 10;
  const progress = ((step - 1) / (totalSteps -1)) * 100;

  const nextStep = () => setStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));
  
  const updateLocalUserData = (newData: Partial<UserProfile>) => {
      setUserData(prev => ({...prev, ...newData}));
  }

  const handleFinish = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        await updateUserProfile(user.uid, { ...userData, onboardingComplete: true });
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

  const renderStep = () => {
    switch(step) {
        case 1: return <div className="flex h-full items-center justify-center"><WelcomeStep onNext={nextStep} /></div>;
        case 2: return <BasicDetailsStep data={userData} setData={updateLocalUserData} />;
        case 3: return <AcademicInfoStep data={userData} setData={updateLocalUserData} />;
        case 4: return <LearningJourneyStep data={userData} setData={updateLocalUserData} />;
        case totalSteps: return (
            <div className="flex h-full items-center justify-center">
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
            </div>
        )
        default: return <PlaceholderStep step={step} onNext={nextStep} onPrev={prevStep} />
    }
  }

  return (
    <div className="flex h-screen flex-col bg-card/50 transition-all duration-500">
        <ScrollArea className="flex-grow">
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
                 {renderStep()}
            </div>
        </ScrollArea>

        {step > 1 && (
            <div className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-t p-4">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                     <Button variant="outline" onClick={prevStep} disabled={step <= 1}>Back</Button>
                     <div className="w-1/2">
                         <Progress value={progress} />
                     </div>
                      {step < totalSteps ? (
                        <Button onClick={nextStep}>Next</Button>
                      ) : (
                         <Button onClick={handleFinish} disabled={isLoading}>
                             {isLoading ? <LoaderCircle className="animate-spin" /> : "Finish"}
                        </Button>
                      )}
                </div>
            </div>
        )}
    </div>
  );
}
