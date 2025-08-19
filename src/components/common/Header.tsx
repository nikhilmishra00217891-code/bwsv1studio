"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
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
        </nav>

        <div className="flex items-center gap-4">
            <Button asChild className="hidden md:flex">
                <Link href="/login">Login / Signup</Link>
            </Button>
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right">
                <div className="flex flex-col gap-6 p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">BiharWaleSirji</span>
                    </Link>
                    <nav className="flex flex-col gap-4 text-lg">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} {...link} />
                    ))}
                    </nav>
                     <Button asChild className="w-full">
                        <Link href="/login">Login / Signup</Link>
                    </Button>
                </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
