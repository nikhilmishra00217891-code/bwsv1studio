
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquareHeart } from 'lucide-react';
import { EditableText } from '../common/EditableText';
import { useAuth } from '../auth/AuthProvider';
import { saveTextContent } from '@/lib/data/content';

export default function Hero() {
  const { textContent } = useAuth();

  return (
    <section className="bg-card/50">
      <div className="container mx-auto px-6 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto">
            <div className="animate-drop-in">
              <EditableText
                  contentId="heroTitle"
                  defaultValue={textContent.heroTitle || "Parivaar. Pratishtha. Parivartan."}
                  className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary"
              />
              <EditableText
                  contentId="heroSubtitle"
                  defaultValue={textContent.heroSubtitle || "India's first platform that teaches like an elder brother, not a stranger."}
                  multiline
                  className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto block"
              />
            </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-500">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto" onClick={(e) => {
                const mentorWidget = document.getElementById('ai-mentor');
                if (mentorWidget) {
                    e.preventDefault();
                    mentorWidget.click();
                }
            }}>
              <a href="#">
                Ask Our AI Mentor
                <MessageSquareHeart className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
