
import { Mail, MessageSquare, Instagram } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Contact Us - BiharWaleSirji",
    description: "We're here to help. Reach out to us via WhatsApp, Email, or Instagram.",
}

const contactOptions = [
    {
        icon: MessageSquare,
        title: "WhatsApp",
        description: "Get instant support from our team. Best for quick questions.",
        cta: "Chat Now",
        link: "#", // Placeholder
        handle: "+91 12345 67890"
    },
    {
        icon: Mail,
        title: "Email",
        description: "For detailed inquiries or support requests, send us an email.",
        cta: "Send Email",
        link: "mailto:support@biharwalesirji.com",
        handle: "support@biharwalesirji.com"
    },
    {
        icon: Instagram,
        title: "Instagram",
        description: "Follow us for updates, tips, and behind-the-scenes content.",
        cta: "Follow Us",
        link: "https://instagram.com/biharwalesirji?igsh=MTNpOGc4eG00aGZ3",
        handle: "@biharwalesirji"
    }
]


export default function ContactPage() {
  return (
    <div className="bg-card/50 py-20 md:py-28 animate-fade-in">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Get In Touch</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Have questions? We're here to help! Choose the best way to reach us, and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactOptions.map((option) => (
                <Card key={option.title} className="text-center flex flex-col group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="items-center">
                         <div className="bg-primary/10 p-4 rounded-full mb-4 transition-colors duration-300 group-hover:bg-primary">
                            <option.icon className="w-8 h-8 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                        </div>
                        <CardTitle className="font-headline text-2xl">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                        <p className="text-muted-foreground flex-grow">{option.description}</p>
                        <p className="font-semibold text-primary my-4">{option.handle}</p>
                        <Button asChild className="mt-auto w-full">
                            <Link href={option.link} target="_blank" rel="noopener noreferrer">
                                {option.cta}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
