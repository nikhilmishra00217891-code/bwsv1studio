
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, BookOpenCheck, LogOut, Pencil, Home, Compass, Info, UserCircle, Target, Swords, BrainCircuit, Megaphone, ArrowLeft, Phone, Rocket, VenetianMask, Award, StarIcon, Bird, FerrisWheel, Brain, Trophy, Users, Gamepad2, Workflow, Radio, Mailbox, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useEditMode } from "./EditModeProvider";
import { ScrollArea } from "../ui/scroll-area";
import SmartSearch from "../home/SmartSearch";
import { listenForUserPatra } from "@/lib/data/patra";

const NavLink = ({ href, label, icon: Icon, onSelect, isProtected, isDesktop = false }: { href: string; label: string, icon?: React.ElementType, onSelect?: () => void, isProtected?: boolean, isDesktop?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isActive = pathname.startsWith(href) && href !== "/" || pathname === href;

  const content = (
    <>
      {Icon && !isDesktop && <Icon className="h-6 w-6" />}
      <span>{label}</span>
    </>
  )

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isProtected && !user) {
        router.push('/login');
    } else {
        router.push(href);
    }
    if (onSelect) {
      onSelect();
    }
  };

  if (onSelect) {
      return (
         <button
            onClick={handleClick}
            className={cn(
                "transition-colors hover:text-primary flex items-center gap-4 w-full text-left",
                isActive ? "text-primary font-semibold" : "text-foreground/80",
                isDesktop && "p-2 rounded-md text-sm gap-2"
            )}
        >
            {content}
        </button>
      )
  }

  return (
    <Link
      href={isProtected && !user ? "/login" : href}
      onClick={handleClick}
      className={cn(
        "transition-colors hover:text-primary flex items-center gap-4",
        isActive ? "text-primary font-semibold" : "text-foreground/80",
        isDesktop && "p-2 rounded-md text-sm gap-2"
      )}
    >
      {content}
    </Link>
  );
};


const mainNavPaths = ["/", "/courses", "/announcements", "/about", "/contact", "/games", "/focus-zone", "/warzone", "/dashboard", "/profile", "/patra"];
const navLinksData = [
  { href: "/", label: "Home", icon: Home, isProtected: false },
  { href: "/courses", label: "Courses", icon: Compass, isProtected: false },
  { href: "/announcements", label: "Announcements", icon: Megaphone, isProtected: true },
  { href: "/games", label: "BWS Games", icon: Gamepad2, isProtected: true },
  { href: "/about", label: "About", icon: Info, isProtected: false },
  { href: "/contact", label: "Contact", icon: Phone, isProtected: false },
];
const futureNavLinks = [
  { href: "/profile", label: "My Profile", icon: UserCircle, isProtected: true },
  { href: "/patra", label: "पत्र", icon: Mailbox, isProtected: true },
  { href: "/focus-zone", label: "Focus Zone", icon: Target, isProtected: true },
  { href: "/warzone", label: "Warzone", icon: Swords, isProtected: true },
  { href: "/parivartan", label: "Parivartan Chamber", icon: Users, isProtected: true },
];


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


export default function Header() {
  const { user, userProfile, loading } = useAuth();
  const [isFaculty, setIsFaculty] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isEditMode, setIsEditMode } = useEditMode();
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnreadPatra, setHasUnreadPatra] = useState(false);
  
  const isLearnZone = pathname.startsWith('/courses/') && pathname.includes('/learnzone');
  const isViewingStudentDashboard = pathname.startsWith('/admin/users/');
  
  const showBackButton = isClient && !isLearnZone && !mainNavPaths.includes(pathname) && !isViewingStudentDashboard;


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenForUserPatra(user.uid, (letters) => {
        const hasUnread = letters.some(letter => !letter.isRead);
        setHasUnreadPatra(hasUnread);
      });
      return () => unsubscribe();
    } else {
        setHasUnreadPatra(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (userProfile) {
        setIsFaculty(userProfile.role === 'faculty');
      } else {
        setIsFaculty(false);
        setIsEditMode(false); // Ensure edit mode is off if user logs out
      }
    }
  }, [user, userProfile, loading, setIsEditMode]);


  const handleLogout = async () => {
    await signOut(auth);
    setIsSheetOpen(false);
  }
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  }

  const renderAvatarContent = () => {
    if (userProfile?.avatar) {
      const Icon = avatarIcons[userProfile.avatar];
      if(Icon) return <Icon className="w-5 h-5" />;
    }
    return user?.displayName ? user.displayName[0].toUpperCase() : user?.email?.[0].toUpperCase() ?? 'U'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="flex items-center gap-4">
             {showBackButton ? (
                 <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                 </Button>
             ) : isViewingStudentDashboard ? (
                <Button variant="ghost" className="mr-2" asChild>
                    <Link href="/admin/users">
                        <UserCog className="mr-2 h-4 w-4" /> Back to Admin
                    </Link>
                </Button>
             ) : (
                <Link href="/" className="flex items-center gap-2 mr-4">
                    <BookOpenCheck className="h-7 w-7 text-primary" />
                    <span className="hidden sm:block font-bold text-xl font-headline tracking-wide">
                        BiharWaleSirji
                    </span>
                </Link>
             )}
        </div>
        
        <div className="flex-1 justify-center hidden lg:flex">
             <SmartSearch />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <ThemeToggle />
          
          {loading ? null : user ? (
             <div className="flex items-center gap-2">
                <Link href="/patra" className="relative">
                    <Button variant="outline" size="icon">
                        <Mailbox className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Mailbox</span>
                    </Button>
                    {hasUnreadPatra && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                    )}
                </Link>
                <div className="relative flex flex-col items-center justify-center">
                <Link href="/profile" aria-label="View Profile">
                    <Avatar className={cn("h-9 w-9", isFaculty && "ring-2 ring-offset-2 ring-offset-background ring-primary")}>
                    <AvatarFallback className="flex items-center justify-center text-primary">
                        {renderAvatarContent()}
                    </AvatarFallback>
                    </Avatar>
                </Link>
                {isClient && isFaculty && (
                    <span className="absolute -bottom-4 text-[10px] font-bold text-primary">FACULTY</span>
                )}
                </div>
            </div>
          ) : (
             <Button asChild variant="outline">
                <Link href="/login">Login</Link>
            </Button>
          )}

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
               
                <div className="flex items-center justify-between p-6 border-b">
                    <Link href="/" className="flex items-center gap-2" onClick={() => handleLinkClick()}>
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">BiharWaleSirji</span>
                    </Link>
                </div>

                <ScrollArea className="flex-grow">
                    <div className="p-6 lg:hidden">
                      <SmartSearch />
                    </div>
                    <nav className="flex flex-col gap-4 text-lg p-6">
                      {[...navLinksData, { href: "/dashboard", label: "Dashboard", icon: UserCircle, isProtected: true }].map((link) => (
                        <NavLink key={link.href} {...link} onSelect={handleLinkClick} />
                      ))}
                      {isFaculty && (
                        <>
                          <div className="my-2 border-t border-border/50"></div>
                          <p className="px-2 text-sm font-semibold text-muted-foreground">Faculty Tools</p>
                          <NavLink href="/admin/users" label="User Management" icon={Users} onSelect={handleLinkClick} isProtected />
                          <NavLink href="/admin/ai-controls" label="AI Controls" icon={BrainCircuit} onSelect={handleLinkClick} isProtected />
                          <NavLink href="/admin/course-flow" label="Course Flow" icon={Workflow} onSelect={handleLinkClick} isProtected />
                          <NavLink href="/admin/live-sessions" label="Live Sessions" icon={Radio} onSelect={handleLinkClick} isProtected />
                        </>
                      )}
                      <div className="my-2 border-t border-border/50"></div>
                      {user && futureNavLinks.map((link) => (
                        <NavLink key={link.label} {...link} onSelect={handleLinkClick} />
                      ))}
                    </nav>
                </ScrollArea>
                
                <div className="p-6 border-t mt-auto">
                   {isClient && isFaculty && (
                    <div className="flex items-center justify-between pb-4 mb-4 border-b">
                      <Label htmlFor="mobile-edit-mode-toggle" className="text-foreground/80 flex items-center gap-2 text-base cursor-pointer">
                        <Pencil className="w-5 h-5" />
                        Edit Mode
                      </Label>
                      <Switch id="mobile-edit-mode-toggle" checked={isEditMode} onCheckedChange={setIsEditMode}/>
                    </div>
                  )}
                  {user ? (
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  ) : (
                    <Button asChild className="w-full" onClick={() => handleLinkClick()}>
                        <Link href="/login">Login / Signup</Link>
                    </Button>
                  )}
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
