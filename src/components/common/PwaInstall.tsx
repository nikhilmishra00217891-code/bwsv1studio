"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstall() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      // Show the install promotion
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
        // Hide the install prompt
        setShowBanner(false);
        setInstallPromptEvent(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the install prompt
    await installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;
    // We've used the prompt, and can't use it again, so clear it
    setInstallPromptEvent(null);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <section className="bg-card/30 py-12">
      <div className="container mx-auto px-6">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold font-headline">Get the Full Experience</h2>
                <p className="text-muted-foreground mt-3">
                    Install the BiharWaleSirji app on your device for quick access, offline features, and a faster, more integrated learning experience.
                </p>
                <Button size="lg" className="mt-6" onClick={handleInstallClick}>
                    <Download className="mr-2" />
                    Install App
                </Button>
            </div>
             <div className="relative w-full h-64 md:h-full min-h-[200px] aspect-square mx-auto md:mx-0">
                <Image
                    src="https://i.postimg.cc/FR3TT8KL/IMG-20250915-WA0003-1.jpg"
                    alt="BiharWaleSirji app icon"
                    fill
                    className="object-cover"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
