
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquareHeart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';

interface HeroContent {
    heroTitle: string;
    heroSubtitle: string;
}

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contentDocRef = doc(db, 'siteContent', 'hero');
    
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setContent(docSnap.data() as HeroContent);
        } else {
            // Set default content if nothing is in Firestore
            setContent({
                heroTitle: "Parivaar. Pratishtha. Parivartan.",
                heroSubtitle: "India's first platform that teaches like an elder brother, not a stranger."
            });
        }
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  return (
    <section className="bg-card/50">
      <div className="container mx-auto px-6 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <>
              <Skeleton className="h-16 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto mt-6" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary">
                {content?.heroTitle}
              </h1>
              <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
                {content?.heroSubtitle}
              </p>
            </>
          )}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#ai-mentor">
                Ask Our AI Mentor
                <MessageSquareHeart className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
