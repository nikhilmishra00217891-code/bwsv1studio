
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoaderCircle, Mail, User, Rocket, Brain, Trophy, VenetianMask, StarIcon, Award, Bird, FerrisWheel, Phone, Pencil, Save, Undo, Check, Dices, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/data";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { PhoneNumberInput } from "@/components/common/PhoneNumberInput";

const avatarIcons: { [key: string]: React.ElementType } = {
  rocket: Rocket,
  brain: Brain,
  trophy: Trophy,
  ninja: VenetianMask,
  star: StarIcon,
  award: Award,
  eagle: Bird,
  dragon: FerrisWheel,
};

const avatarOptions = [
    { id: 'rocket', icon: Rocket },
    { id: 'brain', icon: Brain },
    { id: 'trophy', icon: Trophy },
    { id: 'ninja', icon: VenetianMask },
    { id: 'star', icon: StarIcon },
    { id: 'award', icon: Award },
    { id: 'eagle', icon: Bird },
    { id: 'dragon', icon: FerrisWheel },
];

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const gradeOptions = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Competitive Exams'];
const boardOptions = ['CBSE', 'ICSE', 'State Board'];

const subjectOptions = [
    { value: 'Physics', label: 'Physics' }, { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Maths', label: 'Maths' }, { value: 'Biology', label: 'Biology' },
    { value: 'English', label: 'English' }, { value: 'Social Science', label: 'Social Science' },
    { value: 'Computer Science', label: 'Computer Science' }, { value: 'Accountancy', label: 'Accountancy' },
    { value: 'Business Studies', label: 'Business Studies' }, { value: 'AI', label: 'AI' },
    { value: 'Law', label: 'Law' }, { value: 'Astronomy', label: 'Astronomy' },
];

const goalOptions = [
    'Crack Competitive Exams', 'Score 95%+ in Boards', 'Build Daily Study Discipline',
    'Strengthen Weak Subjects', 'Understand Concepts Deeply'
];

const learningStyleOptions = [
    'Watching Videos', 'Reading Notes', 'Practice Questions', 'Group Discussions'
];

const studyTimeOptions = [
    { id: 'morning', title: 'Morning' }, { id: 'afternoon', title: 'Afternoon' },
    { id: 'evening', title: 'Evening' }, { id: 'night', title: 'Night' },
];


export default function ProfilePage() {
  const { user, userProfile, loading, setUserProfile } = useAuth();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [initialProfileData, setInitialProfileData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (userProfile) {
      const initialData = {
          ...userProfile,
          mobile: userProfile.mobile || { countryCode: '+91', number: '' }
      };
      setProfileData(initialData);
      setInitialProfileData(initialData);
    }
  }, [user, userProfile, loading, router]);
  
   useEffect(() => {
    if (profileData?.theme === 'custom' && profileData.customTheme) {
        const root = document.documentElement;
        root.style.setProperty('--primary', `${profileData.customTheme.primary.h} ${profileData.customTheme.primary.s}% ${profileData.customTheme.primary.l}%`);
        root.style.setProperty('--card', `${profileData.customTheme.background.h} ${profileData.customTheme.background.s}% ${profileData.customTheme.background.l}%`);
    }

    // Cleanup function to remove styles when component unmounts or theme changes
    return () => {
        if(profileData?.theme === 'custom') {
            const root = document.documentElement;
            root.style.removeProperty('--primary');
            root.style.removeProperty('--card');
        }
    };
}, [profileData?.customTheme, profileData?.theme]);

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(initialProfileData);

  const handleSaveChanges = async () => {
    if (!user || !hasChanges) return;
    setIsSaving(true);
    try {
        await updateUserProfile(user.uid, profileData);
        setInitialProfileData(profileData); // Update initial state to reflect saved changes
        setUserProfile(profileData as UserProfile); // Update context
        toast({
            title: "Profile Updated!",
            description: "Your changes have been saved successfully.",
        });
        
        // Apply theme globally after saving
        if (profileData.theme && profileData.theme !== 'custom') {
            setTheme(profileData.theme);
        }

    } catch(error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your changes. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleResetChanges = () => {
    setProfileData(initialProfileData);
  }

  const renderAvatarContent = () => {
    const avatarKey = profileData.avatar || userProfile?.avatar;
    if (avatarKey) {
      const Icon = avatarIcons[avatarKey];
      if (Icon) return <Icon className="w-16 h-16 text-primary" />;
    }
    return user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U';
  };
  
  const MultiSelectCard = ({ title, options, selected, onToggle }: { title: string, options: string[], selected: string[] | undefined, onToggle: (option: string) => void }) => (
    <div>
        <Label className="font-semibold">{title}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {options.map(option => (
                <div 
                    key={option} 
                    className={cn(
                        "p-2 border rounded-md text-center text-sm cursor-pointer transition-all flex items-center justify-center gap-2",
                        (selected || []).includes(option) ? "bg-primary/10 text-primary border-primary font-semibold" : "hover:bg-muted"
                    )}
                    onClick={() => onToggle(option)}
                >
                     {(selected || []).includes(option) && <Check className="w-4 h-4" />}
                     {option}
                </div>
            ))}
        </div>
    </div>
  )

  if (loading || !user || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card/50 min-h-[calc(100vh-4rem)] py-12 md:py-16">
      <div className="container mx-auto px-6 max-w-4xl space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">My Profile</h1>
                <p className="text-muted-foreground">Manage your account details and preferences.</p>
            </div>
            <div className="flex items-center gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="outline" disabled={!hasChanges || isSaving}><Undo className="w-4 h-4 mr-2"/>Reset</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will discard all unsaved changes you've made to your profile.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetChanges}>Discard Changes</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                    {isSaving ? <LoaderCircle className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>

        {/* --- Personal Details Card --- */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                 <Avatar className="w-28 h-28 border-4 border-primary bg-primary/10">
                    <AvatarFallback className="text-4xl flex items-center justify-center">
                        {renderAvatarContent()}
                    </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {avatarOptions.map(opt => (
                        <button key={opt.id} onClick={() => setProfileData(p => ({...p, avatar: opt.id}))} className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                            profileData.avatar === opt.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
                        )}>
                            <opt.icon className="w-6 h-6 text-primary/80"/>
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" value={profileData.displayName || ''} onChange={e => setProfileData(p => ({...p, displayName: e.target.value}))} />
                </div>
                <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={profileData.age || ''} onChange={e => setProfileData(p => ({...p, age: parseInt(e.target.value) || undefined}))} />
                </div>
                <div>
                     <Label htmlFor="email">Email</Label>
                     <div className="flex items-center gap-2 p-2 h-10 rounded-md bg-muted text-muted-foreground text-sm">
                        <Mail className="w-4 h-4"/>
                        <span>{user.email}</span>
                     </div>
                </div>
                 <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                     <PhoneNumberInput 
                        value={profileData.mobile || { countryCode: '+91', number: '' }}
                        onChange={(value) => setProfileData(p => ({...p, mobile: value }))}
                    />
                </div>
                <div>
                    <Label htmlFor="gender">Gender</Label>
                     <Select value={profileData.gender} onValueChange={v => setProfileData(p => ({...p, gender: v as any}))}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                            {genderOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Academic Info Card --- */}
        <Card className="shadow-lg">
            <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                        <Label>Grade/Class</Label>
                        <Select value={profileData.grade} onValueChange={v => setProfileData(p => ({...p, grade: v}))}>
                            <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                            <SelectContent>
                                {gradeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label>Board</Label>
                        <Select value={profileData.board} onValueChange={v => setProfileData(p => ({...p, board: v}))}>
                            <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
                            <SelectContent>
                                {boardOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <MultiSelectCard 
                    title="Core Subjects"
                    options={subjectOptions.map(s => s.value)}
                    selected={profileData.subjects}
                    onToggle={(subject) => {
                        const current = profileData.subjects || [];
                        const newSubjects = current.includes(subject)
                            ? current.filter(s => s !== subject)
                            : [...current, subject];
                        setProfileData(p => ({ ...p, subjects: newSubjects }));
                    }}
                />
            </CardContent>
        </Card>
        
        {/* --- Learning Preferences Card --- */}
        <Card className="shadow-lg">
            <CardHeader><CardTitle>Learning Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                 <MultiSelectCard 
                    title="Your Goals"
                    options={goalOptions}
                    selected={profileData.goals}
                    onToggle={(goal) => {
                        const current = profileData.goals || [];
                        const newGoals = current.includes(goal)
                            ? current.filter(g => g !== goal)
                            : [...current, goal];
                        setProfileData(p => ({ ...p, goals: newGoals }));
                    }}
                />
                 <MultiSelectCard 
                    title="Learning Style"
                    options={learningStyleOptions}
                    selected={profileData.learningStyle as string[]}
                    onToggle={(style) => {
                        const current = profileData.learningStyle || [];
                        const newStyles = current.includes(style)
                            ? current.filter(s => s !== style)
                            : [...current, style];
                        setProfileData(p => ({ ...p, learningStyle: newStyles as any[] }));
                    }}
                />
                 <div>
                    <Label className="font-semibold">Daily Study Duration</Label>
                    <div className="flex items-center gap-4 mt-2">
                        <Slider
                            value={[profileData.preferredStudyDuration || 1.5]}
                            onValueChange={(value) => setProfileData(p => ({ ...p, preferredStudyDuration: value[0] }))}
                            max={8} min={0.5} step={0.5}
                        />
                        <span className="font-bold text-primary text-sm w-20 text-center">{profileData.preferredStudyDuration || 1.5} hrs</span>
                    </div>
                 </div>
                 <div>
                    <Label className="font-semibold">Most Productive Time</Label>
                    <RadioGroup 
                        value={profileData.preferredStudyTime}
                        onValueChange={(value) => setProfileData(p => ({...p, preferredStudyTime: value as any }))}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
                    >
                        {studyTimeOptions.map(option => (
                            <Label key={option.id} htmlFor={`profile-${option.id}`} className="cursor-pointer">
                                <div className={cn("p-2 border rounded-md text-center text-sm transition-all",
                                    profileData.preferredStudyTime === option.id && "bg-primary/10 text-primary border-primary font-semibold"
                                )}>
                                    <RadioGroupItem value={option.id} id={`profile-${option.id}`} className="sr-only"/>
                                    {option.title}
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>

        {/* --- Appearance Card --- */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose a preset theme or create your own vibe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup 
                    value={profileData.theme}
                    onValueChange={(value) => {
                        if (value === 'custom') {
                            const defaultCustom = {
                                primary: { h: 34, s: 96, l: 49 },
                                background: { h: 35, s: 80, l: 97 },
                            };
                            setProfileData(p => ({...p, theme: 'custom', customTheme: p.customTheme || defaultCustom }));
                        } else {
                            setProfileData(p => ({...p, theme: value }));
                            setTheme(value);
                            const root = document.documentElement;
                            root.style.removeProperty('--primary');
                            root.style.removeProperty('--card');
                        }
                    }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    <Label htmlFor="theme-light" className="cursor-pointer"><RadioGroupItem value="light" id="theme-light" className="sr-only"/> <div className={cn("p-2 border rounded-md text-center", profileData.theme === 'light' && 'border-primary ring-2 ring-primary')}>Light</div></Label>
                    <Label htmlFor="theme-dark" className="cursor-pointer"><RadioGroupItem value="dark" id="theme-dark" className="sr-only"/> <div className={cn("p-2 border rounded-md text-center", profileData.theme === 'dark' && 'border-primary ring-2 ring-primary')}>Dark</div></Label>
                    <Label htmlFor="theme-proudshe" className="cursor-pointer"><RadioGroupItem value="proudshe" id="theme-proudshe" className="sr-only"/> <div className={cn("p-2 border rounded-md text-center", profileData.theme === 'proudshe' && 'border-primary ring-2 ring-primary')}>Proudshe</div></Label>
                    <Label htmlFor="theme-retrogamer" className="cursor-pointer"><RadioGroupItem value="retrogamer" id="theme-retrogamer" className="sr-only"/> <div className={cn("p-2 border rounded-md text-center", profileData.theme === 'retrogamer' && 'border-primary ring-2 ring-primary')}>Retro Gamer</div></Label>
                    <Label htmlFor="theme-custom" className="cursor-pointer"><RadioGroupItem value="custom" id="theme-custom" className="sr-only"/> <div className={cn("p-2 border rounded-md text-center flex items-center justify-center gap-2", profileData.theme === 'custom' && 'border-primary ring-2 ring-primary')}><Palette className="w-4 h-4"/> Custom</div></Label>
                </RadioGroup>

                {profileData.theme === 'custom' && (
                    <Card className="p-4 bg-muted/50">
                        <div className="flex justify-end mb-4">
                            <Button variant="ghost" size="sm" onClick={() => {
                                const p_h = Math.floor(Math.random() * 360);
                                const p_s = Math.floor(Math.random() * 30) + 70;
                                const p_l = Math.floor(Math.random() * 20) + 40;
                                const b_h = (p_h + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 60) + 30)) % 360;
                                const b_s = Math.floor(Math.random() * 20) + 70;
                                const b_l = Math.floor(Math.random() * 10) + 88;
                                setProfileData(p => ({...p, customTheme: { primary: {h: p_h, s: p_s, l: p_l}, background: {h: b_h, s: b_s, l: b_l}}}));
                            }}><Dices className="w-4 h-4 mr-2"/> Try Your Luck</Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                             <div>
                                <h4 className="font-semibold text-center mb-2" style={{color: `hsl(${profileData.customTheme?.primary.h}, ${profileData.customTheme?.primary.s}%, ${profileData.customTheme?.primary.l}%)`}}>Primary Color</h4>
                                <div className="space-y-2">
                                    <Label>Hue ({profileData.customTheme?.primary.h})</Label>
                                    <Slider value={[profileData.customTheme?.primary.h || 0]} onValueChange={([val]) => setProfileData(p => ({...p, customTheme: {...p.customTheme!, primary: {...p.customTheme!.primary, h: val}} }))} max={360} step={1} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Saturation ({profileData.customTheme?.primary.s}%)</Label>
                                    <Slider value={[profileData.customTheme?.primary.s || 0]} onValueChange={([val]) => setProfileData(p => ({...p, customTheme: {...p.customTheme!, primary: {...p.customTheme!.primary, s: val}} }))} max={100} step={1} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Lightness ({profileData.customTheme?.primary.l}%)</Label>
                                    <Slider value={[profileData.customTheme?.primary.l || 0]} onValueChange={([val]) => setProfileData(p => ({...p, customTheme: {...p.customTheme!, primary: {...p.customTheme!.primary, l: val}} }))} max={100} step={1} />
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-center mb-2">Background Color</h4>
                                 <div className="space-y-2">
                                    <Label>Hue ({profileData.customTheme?.background.h})</Label>
                                    <Slider value={[profileData.customTheme?.background.h || 0]} onValueChange={([val]) => setProfileData(p => ({...p, customTheme: {...p.customTheme!, background: {...p.customTheme!.background, h: val}} }))} max={360} step={1} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Saturation ({profileData.customTheme?.background.s}%)</Label>
                                    <Slider value={[profileData.customTheme?.background.s || 0]} onValueChange={([val]) => setProfileData(p => ({...p, customTheme: {...p.customTheme!, background: {...p.customTheme!.background, s: val}} }))} max={100} step={1} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Lightness ({profileData.customTheme?.background.l}%)</Label>
                                    <Slider value={[profileData.customTheme?.background.l || 0]} onValueChange={([val]) => setProfileData(p => ({...p, customTheme: {...p.customTheme!, background: {...p.customTheme!.background, l: val}} }))} max={100} step={1} />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

            </CardContent>
        </Card>

      </div>
    </div>
  );
}
