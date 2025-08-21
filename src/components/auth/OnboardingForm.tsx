

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, MoveRight, User, Cake, School, BookCopy, Target, Pencil, Check, Brain, Gauge, Timer, UserCheck, Star, Trophy, Gift, Lightbulb, Handshake, Sun, Sunset, Moon, Sparkles, Book, Atom, Sigma, FlaskConical, Languages, Milestone, Computer, Earth, History, Scale, Briefcase, Leaf, Globe, Calculator, BrainCircuit, Music, Gamepad2, Mic2, Code, Clapperboard, BookOpen, MessageCircle, PenSquare, Palette, Smile, Dices } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

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
    { value: 'Physics', label: 'Physics', icon: Atom, highSchoolOnly: true },
    { value: 'Chemistry', label: 'Chemistry', icon: FlaskConical, highSchoolOnly: true },
    { value: 'Maths', label: 'Maths', icon: Sigma, highSchoolOnly: true },
    { value: 'Biology', label: 'Biology', icon: Leaf, highSchoolOnly: true },
    { value: 'English', label: 'English', icon: Languages, highSchoolOnly: false },
    { value: 'Social Science', label: 'Social Science', icon: Globe, highSchoolOnly: false },
    { value: 'Computer Science', label: 'Computer Science', icon: Computer, highSchoolOnly: false },
    { value: 'Accountancy', label: 'Accountancy', icon: Calculator, highSchoolOnly: true },
    { value: 'Business Studies', label: 'Business Studies', icon: Briefcase, highSchoolOnly: true },
    { value: 'AI', label: 'AI', icon: BrainCircuit, highSchoolOnly: true },
    { value: 'Law', label: 'Law', icon: Scale, highSchoolOnly: true },
    { value: 'Astronomy', label: 'Astronomy', icon: Sparkles, highSchoolOnly: true },
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

const interestOptions = [
    { id: 'music', title: 'Music', icon: Music },
    { id: 'sports', title: 'Sports', icon: Trophy },
    { id: 'gaming', title: 'Gaming', icon: Gamepad2 },
    { id: 'coding', title: 'Coding', icon: Code },
    { id: 'reading', title: 'Reading', icon: BookOpen },
    { id: 'podcasts', title: 'Podcasts', icon: Mic2 },
]

const learningStyleOptions = [
    { id: 'video', title: 'Watching Videos', icon: Clapperboard, description: "I learn best by seeing and hearing explanations." },
    { id: 'reading', title: 'Reading Notes', icon: BookOpen, description: "I prefer detailed text and diagrams to understand concepts." },
    { id: 'practice', title: 'Practice Questions', icon: PenSquare, description: "Doing is learning. I master topics by solving problems." },
    { id: 'discussion', title: 'Group Discussions', icon: MessageCircle, description: "I gain new perspectives by talking with peers." },
]

const avatarOptions = [
    { id: 'rocket', icon: '🚀' },
    { id: 'brain', icon: '🧠' },
    { id: 'trophy', icon: '🏆' },
    { id: 'ninja', icon: '🥷' },
    { id: 'star', icon: '🌟' },
    { id: 'lion', icon: '🦁' },
    { id: 'eagle', icon: '🦅' },
    { id: 'dragon', icon: '🐲' },
];

const themeOptions = [
    {
        id: 'light',
        name: 'Default Light',
        colors: {
            bg: 'hsl(35 80% 97%)',
            primary: 'hsl(34 96% 49%)',
            accent: 'hsl(47 96% 50%)',
        }
    },
    {
        id: 'dark',
        name: 'Default Dark',
        colors: {
            bg: 'hsl(20 15% 10%)',
            primary: 'hsl(34 96% 49%)',
            accent: 'hsl(47 96% 50%)',
        }
    },
    {
        id: 'proudshe',
        name: 'Proudshe',
        colors: {
            bg: 'hsl(340 100% 98%)',
            primary: 'hsl(337 90% 60%)',
            accent: 'hsl(337 95% 65%)',
        }
    },
    {
        id: 'retrogamer',
        name: 'Retro Gamer',
        colors: {
            bg: 'hsl(236 65% 10%)',
            primary: 'hsl(260 90% 70%)',
            accent: 'hsl(45 85% 55%)',
        }
    }
];


const OnboardingStepWrapper = ({ title, children, step, totalSteps }: { title: string, children: React.ReactNode, step: number, totalSteps: number }) => (
    <div className="animate-slide-in-from-right w-full max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm font-semibold text-primary tracking-widest uppercase text-center">{`Step ${step - 1} / ${totalSteps-1}`}</p>
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mt-2 mb-12">{title}</h2>
        {children}
    </div>
)

const BasicDetailsStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
    return (
        <OnboardingStepWrapper title="Tell Us a Little About Yourself" step={2} totalSteps={totalSteps}>
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

const AcademicInfoStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
    const [customGrade, setCustomGrade] = useState(false);
    const [customBoard, setCustomBoard] = useState(false);
    const [customSubject, setCustomSubject] = useState(false);
    
    const showHighSchoolSubjects = ['11th', '12th', 'Competitive Exams'].includes(data.grade || '');

    const toggleSubject = (subject: string) => {
        if (subject === 'Other') {
            setCustomSubject(!customSubject);
            return;
        }
        const currentSubjects = data.subjects || [];
        const newSubjects = currentSubjects.includes(subject)
            ? currentSubjects.filter(s => s !== subject)
            : [...currentSubjects, subject];
        setData({ subjects: newSubjects });
    }

    const handleCustomSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const otherSubjectValue = e.target.value;
        const currentSubjects = data.subjects?.filter(s => !subjectOptions.map(o => o.value).includes(s) && s !== 'Other') || [];
        const baseSubjects = data.subjects?.filter(s => subjectOptions.map(o => o.value).includes(s)) || [];
        
        if (otherSubjectValue) {
            setData({ subjects: [...baseSubjects, otherSubjectValue] });
        } else {
             setData({ subjects: baseSubjects });
        }
    }

    const getCustomSubjectValue = () => {
        return data.subjects?.find(s => !subjectOptions.map(o => o.value).includes(s) && s !== 'Other') || '';
    }

    const gradeOptions = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Competitive Exams'];
    const boardOptions = ['CBSE', 'ICSE', 'State Board'];

    return (
        <OnboardingStepWrapper title="Your Academic World" step={3} totalSteps={totalSteps}>
            <div className="max-w-xl mx-auto space-y-10">
                 <div className="space-y-2">
                    <Label>Which class/grade are you in?</Label>
                     {customGrade ? (
                         <Input 
                            type="text"
                            placeholder="Please specify your grade"
                            className="h-12 text-base"
                            value={gradeOptions.includes(data.grade || '') ? '' : data.grade}
                            onChange={(e) => setData({ grade: e.target.value })}
                            autoFocus
                        />
                    ) : (
                        <Select
                            value={data.grade}
                            onValueChange={(value) => {
                                if (value === 'other') {
                                    setCustomGrade(true);
                                    setData({ grade: '' });
                                } else {
                                    setData({ grade: value });
                                }
                            }}
                        >
                            <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select your grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeOptions.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label>Your board (e.g., CBSE, ICSE)</Label>
                     {customBoard ? (
                         <Input 
                            type="text"
                            placeholder="Please specify your board"
                            className="h-12 text-base"
                             value={boardOptions.includes(data.board || '') ? '' : data.board}
                            onChange={(e) => setData({ board: e.target.value })}
                            autoFocus
                        />
                    ) : (
                         <Select
                            value={data.board}
                            onValueChange={(value) => {
                                if (value === 'other') {
                                    setCustomBoard(true);
                                    setData({ board: '' });
                                } else {
                                    setData({ board: value });
                                }
                            }}
                        >
                            <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select your board" />
                            </SelectTrigger>
                            <SelectContent>
                                {boardOptions.map(board => <SelectItem key={board} value={board}>{board}</SelectItem>)}
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                 <div>
                     <p className="text-muted-foreground text-center mb-4">Choose your core subjects</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {subjectOptions.filter(subject => !subject.highSchoolOnly || showHighSchoolSubjects).map(option => (
                            <Card 
                                key={option.value}
                                className={cn(
                                    "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg relative",
                                     (data.subjects || []).includes(option.value) && "ring-2 ring-primary shadow-lg scale-105"
                                )}
                                onClick={() => toggleSubject(option.value)}
                            >
                                <option.icon className="w-8 h-8 text-primary mb-2" />
                                <span className="font-semibold text-sm">{option.label}</span>
                                {(data.subjects || []).includes(option.value) && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </Card>
                        ))}
                         <Card
                            className={cn(
                                "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg relative",
                                customSubject && "ring-2 ring-primary shadow-lg scale-105"
                            )}
                            onClick={() => toggleSubject('Other')}
                        >
                            <Pencil className="w-8 h-8 text-primary mb-2" />
                            <span className="font-semibold text-sm">Other</span>
                            {customSubject && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </Card>
                    </div>
                    {customSubject && (
                        <div className="mt-4">
                            <Input
                                type="text"
                                placeholder="Please specify your subject"
                                className="h-12 text-base"
                                value={getCustomSubjectValue()}
                                onChange={handleCustomSubjectChange}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>
        </OnboardingStepWrapper>
    )
}

const LearningJourneyStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
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
        <OnboardingStepWrapper title="Your Learning Journey" step={4} totalSteps={totalSteps}>
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

const InterestsStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
    const [customInterest, setCustomInterest] = useState(false);

    const toggleInterest = (interest: string) => {
        if (interest === 'Other') {
            setCustomInterest(!customInterest);
            return;
        }
        const currentInterests = data.interests || [];
        const newInterests = currentInterests.includes(interest)
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];
        setData({ interests: newInterests });
    };

    const handleCustomInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const otherInterestValue = e.target.value;
        const baseInterests = data.interests?.filter(i => interestOptions.map(o => o.title).includes(i)) || [];
        if (otherInterestValue) {
            setData({ interests: [...baseInterests, otherInterestValue] });
        } else {
            setData({ interests: baseInterests });
        }
    };

    const getCustomInterestValue = () => {
        const value = data.interests?.find(i => !interestOptions.map(o => o.title).includes(i as any));
        return typeof value === 'string' ? value : '';
    };

    return (
        <OnboardingStepWrapper title="What else excites you?" step={5} totalSteps={totalSteps}>
            <div className="max-w-2xl mx-auto">
                <p className="text-muted-foreground text-center mb-8">
                    Knowing your hobbies helps us make your learning experience more fun and personalized!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {interestOptions.map(option => (
                        <Card
                            key={option.id}
                            onClick={() => toggleInterest(option.title)}
                            className={cn(
                                "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform-gpu",
                                "hover:shadow-lg hover:border-primary/50",
                                (data.interests || []).includes(option.title) ? "animate-pop-in ring-2 ring-primary shadow-xl" : "hover:-translate-y-1"
                            )}
                        >
                            <option.icon className="w-10 h-10 mb-2 text-primary" />
                            <span className="font-semibold">{option.title}</span>
                        </Card>
                    ))}
                    <Card
                        onClick={() => toggleInterest('Other')}
                        className={cn(
                            "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform-gpu",
                            "hover:shadow-lg hover:border-primary/50",
                            customInterest ? "animate-pop-in ring-2 ring-primary shadow-xl" : "hover:-translate-y-1"
                        )}
                    >
                        <Pencil className="w-10 h-10 mb-2 text-primary" />
                        <span className="font-semibold">Other</span>
                    </Card>
                </div>
                 {customInterest && (
                    <div className="mt-6">
                        <Input
                            type="text"
                            placeholder="What's your interest?"
                            className="h-12 text-base"
                            value={getCustomInterestValue()}
                            onChange={handleCustomInterestChange}
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </OnboardingStepWrapper>
    );
};

const LearningStyleStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
    const [customLearningStyle, setCustomLearningStyle] = useState(false);

    const toggleLearningStyle = (style: string) => {
        if (style === 'Other') {
            setCustomLearningStyle(!customLearningStyle);
            return;
        }

        const currentStyles = data.learningStyle || [];
        const newStyles = currentStyles.includes(style)
            ? currentStyles.filter(s => s !== style)
            : [...currentStyles, style];
        setData({ learningStyle: newStyles as any[] });
    };

    const handleCustomLearningStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const otherStyleValue = e.target.value;
        const baseStyles = data.learningStyle?.filter(s => learningStyleOptions.map(o => o.id).includes(s as any) || (s !== 'Other' && !learningStyleOptions.map(o => o.id).includes(s as any))) || [];
        const customValueIndex = baseStyles.findIndex(s => !learningStyleOptions.map(o => o.id).includes(s as any) && s !== 'Other');

        if (otherStyleValue) {
            if (customValueIndex > -1) {
                baseStyles[customValueIndex] = otherStyleValue;
            } else {
                baseStyles.push(otherStyleValue);
            }
             setData({ learningStyle: baseStyles as any[] });
        } else {
             setData({ learningStyle: baseStyles.filter(s => learningStyleOptions.map(o => o.id).includes(s as any)) as any[] });
        }
    };

    const getCustomLearningStyleValue = () => {
        const value = data.learningStyle?.find(s => !learningStyleOptions.map(o => o.id).includes(s as any) && s !== 'Other');
        return typeof value === 'string' ? value : '';
    };

    return (
        <OnboardingStepWrapper title="How do you like to learn?" step={6} totalSteps={totalSteps}>
             <div className="max-w-3xl mx-auto space-y-6">
                {learningStyleOptions.map(option => (
                    <Card
                        key={option.id}
                        onClick={() => toggleLearningStyle(option.id)}
                        className={cn(
                            "p-6 flex items-center gap-6 cursor-pointer transition-all duration-200",
                            "hover:shadow-lg hover:border-primary/50",
                            (data.learningStyle || []).includes(option.id) && "ring-2 ring-primary"
                        )}
                    >
                        <div className="bg-primary/10 p-4 rounded-xl">
                            <option.icon className="w-10 h-10 text-primary" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-lg">{option.title}</h4>
                            <p className="text-muted-foreground text-sm mt-1">{option.description}</p>
                        </div>
                        {(data.learningStyle || []).includes(option.id) && (
                             <div className="ml-auto text-primary">
                                <Check className="w-8 h-8"/>
                            </div>
                        )}
                    </Card>
                ))}
                 <Card
                    onClick={() => toggleLearningStyle('Other')}
                    className={cn(
                        "p-6 flex items-center gap-6 cursor-pointer transition-all duration-200",
                        "hover:shadow-lg hover:border-primary/50",
                        customLearningStyle && "ring-2 ring-primary"
                    )}
                >
                    <div className="bg-primary/10 p-4 rounded-xl">
                        <Pencil className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-bold text-lg">Other</h4>
                        <p className="text-muted-foreground text-sm mt-1">Tell us your unique way of learning.</p>
                    </div>
                    {customLearningStyle && (
                        <div className="ml-auto text-primary">
                            <Check className="w-8 h-8"/>
                        </div>
                    )}
                </Card>
                 {customLearningStyle && (
                    <div className="mt-4">
                        <Input
                            type="text"
                            placeholder="How do you learn best?"
                            className="h-12 text-base"
                            value={getCustomLearningStyleValue()}
                            onChange={handleCustomLearningStyleChange}
                            autoFocus
                        />
                    </div>
                )}
             </div>
        </OnboardingStepWrapper>
    )
};

const ThemeCustomizationStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
    const { setTheme } = useTheme();
    const [isCustomizing, setIsCustomizing] = useState(false);
    
    // HSL state for custom theme
    const [primaryHue, setPrimaryHue] = useState(34);
    const [primarySaturation, setPrimarySaturation] = useState(96);
    const [primaryLightness, setPrimaryLightness] = useState(49);
    
    const [accentHue, setAccentHue] = useState(47);
    const [accentSaturation, setAccentSaturation] = useState(96);
    const [accentLightness, setAccentLightness] = useState(50);
    
    const localDataRef = useRef(data);
    localDataRef.current = data;

    useEffect(() => {
        if (isCustomizing) {
            const root = document.documentElement;
            root.style.setProperty('--primary', `${primaryHue} ${primarySaturation}% ${primaryLightness}%`);
            root.style.setProperty('--accent', `${accentHue} ${accentSaturation}% ${accentLightness}%`);
            setData({
                theme: 'custom',
                customTheme: {
                    primary: { h: primaryHue, s: primarySaturation, l: primaryLightness },
                    accent: { h: accentHue, s: accentSaturation, l: accentLightness }
                }
            })
        }
    }, [isCustomizing, primaryHue, primarySaturation, primaryLightness, accentHue, accentSaturation, accentLightness]);
    
    const handlePresetSelect = (themeId: string) => {
        setIsCustomizing(false);
        setTheme(themeId);
        setData({ theme: themeId, customTheme: undefined });
        
        // Remove inline styles when a preset is chosen
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--accent');
    }
    
    const handleStartCustomizing = () => {
        setIsCustomizing(true);
        // We set a 'custom' theme class to disable the preset theme css variables
        setTheme('light'); // set to a neutral base
        setData({ ...localDataRef.current, theme: 'custom' });
    }

    const tryYourLuck = () => {
        if (!isCustomizing) handleStartCustomizing();
        
        const p_h = Math.floor(Math.random() * 360);
        const p_s = Math.floor(Math.random() * 30) + 70; // 70-100
        const p_l = Math.floor(Math.random() * 20) + 40; // 40-60
        
        const a_h = (p_h + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 60) + 30)) % 360;
        const a_s = Math.floor(Math.random() * 30) + 70;
        const a_l = Math.floor(Math.random() * 20) + 45;

        setPrimaryHue(p_h);
        setPrimarySaturation(p_s);
        setPrimaryLightness(p_l);
        setAccentHue(a_h);
        setAccentSaturation(a_s);
        setAccentLightness(a_l);
    }

    return (
        <OnboardingStepWrapper title="Choose Your Vibe" step={7} totalSteps={totalSteps}>
            <div className="max-w-4xl mx-auto">
                <p className="text-muted-foreground text-center mb-8">
                    Pick a theme that makes you feel motivated, or create your own!
                </p>
                <h3 className="text-lg font-bold text-center mb-4">Choose a Preset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {themeOptions.map(option => (
                        <Card 
                            key={option.id}
                            onClick={() => handlePresetSelect(option.id)}
                            className={cn(
                                "cursor-pointer transition-all duration-200",
                                !isCustomizing && data.theme === option.id ? "ring-4 ring-primary ring-offset-4 ring-offset-background" : "hover:ring-2 hover:ring-primary/50"
                            )}
                        >
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <h3 className="font-headline text-lg font-bold">{option.name}</h3>
                                </div>
                                <div 
                                    className="h-24 rounded-b-lg p-3 flex flex-col justify-end"
                                    style={{ backgroundColor: option.colors.bg }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1/2 h-8 rounded" style={{backgroundColor: option.colors.primary}}></div>
                                        <div className="w-1/2 h-8 rounded" style={{backgroundColor: option.colors.accent}}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="my-12 text-center text-muted-foreground">OR</div>

                <Card className={cn("p-6", isCustomizing && "ring-4 ring-primary ring-offset-4 ring-offset-background")}>
                     {!isCustomizing ? (
                         <div className="text-center">
                            <h3 className="text-lg font-bold mb-2">Create Your Own</h3>
                            <p className="text-muted-foreground mb-4">Unleash your creativity and design your own theme.</p>
                            <Button onClick={handleStartCustomizing}>
                                <Palette className="mr-2"/> Make My Own Theme
                            </Button>
                         </div>
                     ) : (
                         <div>
                            <div className="flex justify-between items-center mb-6">
                               <h3 className="text-lg font-bold">Create Your Own</h3>
                               <Button onClick={tryYourLuck} variant="outline" size="sm"><Dices className="mr-2"/> Try Your Luck</Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Primary Color */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-center">Primary Color</h4>
                                    <div className="space-y-2">
                                        <Label>Hue ({primaryHue})</Label>
                                        <Slider value={[primaryHue]} onValueChange={([val]) => setPrimaryHue(val)} max={360} step={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Saturation ({primarySaturation}%)</Label>
                                        <Slider value={[primarySaturation]} onValueChange={([val]) => setPrimarySaturation(val)} max={100} step={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lightness ({primaryLightness}%)</Label>
                                        <Slider value={[primaryLightness]} onValueChange={([val]) => setPrimaryLightness(val)} max={100} step={1} />
                                    </div>
                                </div>
                                {/* Accent Color */}
                                <div className="space-y-4">
                                     <h4 className="font-semibold text-center">Accent Color</h4>
                                    <div className="space-y-2">
                                        <Label>Hue ({accentHue})</Label>
                                        <Slider value={[accentHue]} onValueChange={([val]) => setAccentHue(val)} max={360} step={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Saturation ({accentSaturation}%)</Label>
                                        <Slider value={[accentSaturation]} onValueChange={([val]) => setAccentSaturation(val)} max={100} step={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lightness ({accentLightness}%)</Label>
                                        <Slider value={[accentLightness]} onValueChange={([val]) => setAccentLightness(val)} max={100} step={1} />
                                    </div>
                                </div>
                            </div>
                         </div>
                     )}
                </Card>
            </div>
        </OnboardingStepWrapper>
    )
};


const EngagementBoostStep = ({ data, setData, totalSteps }: { data: Partial<UserProfile>, setData: (d: Partial<UserProfile>) => void, totalSteps: number }) => {
    return (
        <OnboardingStepWrapper title="Pick a Motivational Avatar" step={8} totalSteps={totalSteps}>
            <div className="max-w-xl mx-auto">
                <p className="text-muted-foreground text-center mb-8">
                    This avatar will represent you in challenges, streaks, and leaderboards!
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {avatarOptions.map(option => (
                        <Card
                            key={option.id}
                            onClick={() => setData({ avatar: option.icon })}
                            className={cn(
                                "p-4 flex items-center justify-center text-center cursor-pointer transition-all duration-200 transform hover:scale-110 hover:shadow-lg",
                                data.avatar === option.icon && "ring-4 ring-primary shadow-2xl scale-110"
                            )}
                        >
                            <span className="text-5xl">{option.icon}</span>
                        </Card>
                    ))}
                </div>
                <div className="text-center mt-8">
                     <Button variant="link" onClick={() => setData({ avatar: '' })}>I'll choose later</Button>
                </div>
            </div>
        </OnboardingStepWrapper>
    )
};

// Placeholder for future steps
const PlaceholderStep = ({ step, onNext, onPrev, totalSteps }: { step: number; onNext: () => void; onPrev: () => void; totalSteps: number }) => {
    return (
        <div className="flex h-full items-center justify-center">
            <div>
                <h2 className="text-2xl font-bold">Step {step - 1} / {totalSteps - 1}</h2>
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
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    if (user && !userData.displayName) {
        setUserData(prev => ({...prev, displayName: user.displayName || ''}))
    }
    if (!userData.theme) {
        setUserData(prev => ({...prev, theme: theme || 'light' }));
    }
  }, [user, theme, userData.theme, userData.displayName]);

  // When component unmounts, reset any custom styles
  useEffect(() => {
    return () => {
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--accent');
    }
  }, []);

  const totalSteps = 9;
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
        
        // Finalize theme selection
        if (userData.theme && userData.theme !== 'custom') {
            setTheme(userData.theme);
        } else if (userData.theme === 'custom') {
             // The styles are already applied, but we set the theme to a base
             // so next-themes doesn't override our custom styles.
             setTheme('light'); 
        }

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
        case 2: return <BasicDetailsStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case 3: return <AcademicInfoStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case 4: return <LearningJourneyStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case 5: return <InterestsStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case 6: return <LearningStyleStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case 7: return <ThemeCustomizationStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case 8: return <EngagementBoostStep data={userData} setData={updateLocalUserData} totalSteps={totalSteps} />;
        case totalSteps: return (
            <div className="flex h-full items-center justify-center">
                 <OnboardingStepWrapper title="One Last Check!" step={totalSteps} totalSteps={totalSteps}>
                     <div className="text-center">
                        <p className="text-muted-foreground mb-8">You're all set! Press Finish to head to your personalized dashboard.</p>
                        <Button size="lg" onClick={handleFinish} disabled={isLoading}>
                            {isLoading ? <LoaderCircle className="animate-spin" /> : "Finish & Go to Dashboard"}
                        </Button>
                     </div>
                 </OnboardingStepWrapper>
            </div>
        )
        default: return <PlaceholderStep step={step} onNext={nextStep} onPrev={prevStep} totalSteps={totalSteps} />
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
