import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquareHeart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-card/50">
      <div className="container mx-auto px-6 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary">
            Parivaar. Pratishtha. Parivartan.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            India's first platform that teaches like an elder brother, not a stranger.
          </p>
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
