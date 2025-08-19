import Link from 'next/link';
import { BookOpenCheck, Twitter, Youtube, Instagram } from 'lucide-react';

const navLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About Us' },
  { href: '/dashboard', label: 'Dashboard' },
];

const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="bg-secondary/50">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
             <Link href="/" className="flex items-center gap-2">
                <BookOpenCheck className="h-8 w-8 text-primary" />
                <span className="font-bold text-2xl font-headline tracking-wide">
                    BiharWaleSirji
                </span>
            </Link>
            <p className="mt-4 text-foreground/70">
                Parivaar. Pratishtha. Parivartan.
            </p>
             <div className="flex space-x-4 mt-6">
                {socialLinks.map(social => (
                     <Link key={social.label} href={social.href} className="text-foreground/60 hover:text-primary transition-colors">
                        <social.icon className="h-6 w-6" />
                        <span className="sr-only">{social.label}</span>
                    </Link>
                ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-foreground">Platform</h3>
              <nav className="mt-4 flex flex-col space-y-2">
                 {navLinks.map(link => (
                     <Link key={link.href} href={link.href} className="text-foreground/70 hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                 ))}
              </nav>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Legal</h3>
              <nav className="mt-4 flex flex-col space-y-2">
                <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">Terms of Service</Link>
                <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">Privacy Policy</Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Contact</h3>
              <nav className="mt-4 flex flex-col space-y-2">
                <a href="mailto:support@biharwalesirji.com" className="text-foreground/70 hover:text-primary transition-colors">support@biharwalesirji.com</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} BiharWaleSirji. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
