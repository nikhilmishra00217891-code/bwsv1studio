
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, BookOpenCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./ThemeToggle";

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
  const router = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl font-headline tracking-wide">
            BiharWaleSirji
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
           {user && <NavLink href="/dashboard" label="Dashboard" />}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-4">
             {loading ? null : user ? (
              <Link href="/profile" aria-label="View Profile">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                  <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
               <Button asChild size="sm">
                <Link href="/login">Login / Signup</Link>
              </Button>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">BiharWaleSirji</span>
                    </Link>
                    {user && (
                        <Link href="/profile" aria-label="View Profile">
                             <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                                <AvatarFallback>{user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                            </Avatar>
                        </Link>
                    )}
                </div>

                <nav className="flex flex-col gap-4 text-lg">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                  {user && <NavLink href="/dashboard" label="Dashboard" />}
                  {user && <NavLink href="/profile" label="Profile" />}
                </nav>
                {user ? (
                   <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                   </Button>
                ) : (
                   <Button asChild className="w-full">
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
