
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, BookOpenCheck, LogOut, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-primary",
        isActive ? "text-primary font-semibold" : "text-foreground/80"
      )}
    >
      {label}
    </Link>
  );
};

export default function Header() {
  const { user, loading } = useAuth();
  const [isFaculty, setIsFaculty] = useState(false);

  useEffect(() => {
    const checkFacultyStatus = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'faculty') {
          setIsFaculty(true);
        } else {
          setIsFaculty(false);
        }
      } else {
        setIsFaculty(false);
      }
    };
    checkFacultyStatus();
  }, [user]);


  const handleLogout = async () => {
    await signOut(auth);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2">
              <BookOpenCheck className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl font-headline tracking-wide">
                BiharWaleSirji
              </span>
            </Link>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center items-center gap-6">
           {isFaculty && (
             <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/content">
                    <Edit className="mr-2 h-4 w-4" /> Edit Content
                </Link>
             </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <ThemeToggle />
          
          {loading ? null : user ? (
            <div className="relative flex flex-col items-center">
              <Link href="/profile" aria-label="View Profile">
                <Avatar className={cn("h-9 w-9", isFaculty && "ring-2 ring-offset-2 ring-offset-background ring-primary animate-pulse")}>
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                  <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              {isFaculty && (
                 <span className="absolute -bottom-4 text-[10px] font-bold text-primary">BWS</span>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="hidden md:flex">
              <Link href="/login">Login / Signup</Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menu</SheetTitle>
               <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <Link href="/" className="flex items-center gap-2">
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">BiharWaleSirji</span>
                    </Link>
                </div>

                <nav className="flex flex-col gap-4 text-lg p-6 flex-grow">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                  {user && <NavLink href="/dashboard" label="Dashboard" />}
                  {user && <NavLink href="/profile" label="Profile" />}
                   {user && isFaculty && <NavLink href="/dashboard/content" label="Edit Content" />}
                </nav>
                
                <div className="p-6 border-t">
                  {user ? (
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
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
