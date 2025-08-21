
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, BookOpenCheck, LogOut, Pencil, Home, Compass, Info, UserCircle, Target, Swords, BrainCircuit, Megaphone, ArrowLeft, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { isFaculty as checkIsFaculty } from "@/lib/data";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useEditMode } from "./EditModeProvider";

const NavLink = ({ href, label, icon: Icon, onSelect }: { href: string; label: string, icon?: React.ElementType, onSelect?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href;

  const content = (
    <>
      {Icon && <Icon className="h-6 w-6" />}
      <span>{label}</span>
    </>
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onSelect) {
      router.push(href);
      onSelect();
    }
  };

  if (onSelect) {
      return (
         <button
            onClick={handleClick}
            className={cn(
                "transition-colors hover:text-primary flex items-center gap-4 w-full text-left",
                isActive ? "text-primary font-semibold" : "text-foreground/80"
            )}
        >
            {content}
        </button>
      )
  }

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-primary flex items-center gap-4",
        isActive ? "text-primary font-semibold" : "text-foreground/80"
      )}
    >
      {content}
    </Link>
  );
};

const mainNavPaths = ["/", "/courses", "/announcements", "/about", "/contact"];


export default function Header() {
  const { user, loading } = useAuth();
  const [isFaculty, setIsFaculty] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isEditMode, setIsEditMode } = useEditMode();
  const router = useRouter();
  const pathname = usePathname();
  const showBackButton = isClient && !mainNavPaths.includes(pathname);


  useEffect(() => {
    setIsClient(true);
    const checkFacultyStatus = async () => {
      if (user) {
        const facultyStatus = await checkIsFaculty(user.uid);
        setIsFaculty(facultyStatus);
      } else {
        setIsFaculty(false);
        setIsEditMode(false); // Ensure edit mode is off if user logs out
      }
    };
    if(isClient){
      checkFacultyStatus();
    }
  }, [user, isClient, setIsEditMode]);


  const handleLogout = async () => {
    await signOut(auth);
    setIsSheetOpen(false);
  }
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="flex items-center gap-4 mr-auto">
             {showBackButton ? (
                 <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                 </Button>
             ) : (
                <Link href="/" className="flex items-center gap-2">
                    <BookOpenCheck className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl font-headline tracking-wide">
                        BiharWaleSirji
                    </span>
                </Link>
             )}
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
            ))}
        </nav>
        
        <div className="flex-1"></div>


        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <ThemeToggle />
          
          {loading ? null : user ? (
            <div className="relative flex flex-col items-center justify-center">
              <Link href="/profile" aria-label="View Profile">
                <Avatar className={cn("h-9 w-9", isFaculty && "ring-2 ring-offset-2 ring-offset-background ring-primary")}>
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                  <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              {isClient && isFaculty && (
                 <span className="absolute -bottom-4 text-[10px] font-bold text-primary">FACULTY</span>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="hidden md:flex">
              <Link href="/login">Login / Signup</Link>
            </Button>
          )}

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menu</SheetTitle>
               <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <Link href="/" className="flex items-center gap-2" onClick={() => handleLinkClick()}>
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">BiharWaleSirji</span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-4 text-lg p-6 flex-grow">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} onSelect={handleLinkClick} />
                  ))}
                  <div className="my-2 border-t border-border/50"></div>
                  {user && futureNavLinks.map((link) => (
                    <NavLink key={link.label} {...link} onSelect={handleLinkClick} />
                  ))}
                  {isClient && isFaculty && (
                    <div className="flex items-center justify-between pt-4 mt-auto border-t">
                      <Label htmlFor="mobile-edit-mode-toggle" className="text-foreground/80 flex items-center gap-2 text-base cursor-pointer">
                        <Pencil className="w-5 h-5" />
                        Edit Mode
                      </Label>
                      <Switch id="mobile-edit-mode-toggle" checked={isEditMode} onCheckedChange={setIsEditMode}/>
                    </div>
                  )}
                </nav>
                
                <div className="p-6 border-t">
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: Compass },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Phone },
];

const futureNavLinks = [
  { href: "/profile", label: "My Profile", icon: UserCircle },
  { href: "#", label: "Focus Zone", icon: Target },
  { href: "#", label: "Warzone", icon: Swords },
  { href: "#", label: "Parivartan Chamber", icon: BrainCircuit },
];
