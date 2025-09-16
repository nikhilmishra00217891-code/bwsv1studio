"use client";

import { motion } from 'framer-motion';
import { Award, Sunrise, Users } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

const pillarData = [
  {
    id: "parivar",
    title: "पारिवार (Parivar)",
    subtitle: "Family",
    icon: Users,
    content: "Bihar is an integral and valuable part of Bharat's grand family... We believe that education flourishes in an environment of mutual respect, care, and collective growth.",
    image: placeholderImages.about_parivar,
  },
  {
    id: "pratishtha",
    title: "प्रतिष्ठा (Pratishtha)",
    subtitle: "Dignity & Honor",
    icon: Award,
    content: "We are dedicated to elevating Bihar's dignity... We believe that quality education is the most powerful tool for restoring and building individual and collective honor.",
    image: placeholderImages.about_pratishtha,
  },
  {
    id: "parivartan",
    title: "परिवर्तन (Parivartan)",
    subtitle: "Transformation",
    icon: Sunrise,
    content: "Our mission is to catalyze positive change in Bihar... We ensure that geographical location never becomes a barrier to accessing world-class education.",
    image: placeholderImages.about_parivartan,
  },
];

const PillarCard = ({ pillar }: { pillar: typeof pillarData[0] }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleInteractionStart = () => setIsFlipped(true);
    const handleInteractionEnd = () => setIsFlipped(false);
    const handleClick = () => setIsFlipped(!isFlipped);

    return (
        <div 
            className="w-full h-80 rounded-2xl [perspective:1000px]"
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onClick={handleClick}
        >
            <motion.div
                className="relative w-full h-full rounded-2xl shadow-lg [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* Front of the card */}
                <div className="absolute inset-0 w-full h-full rounded-2xl bg-card flex flex-col items-center justify-center p-6 text-center [backface-visibility:hidden]">
                    <pillar.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold font-headline mb-1">{pillar.title}</h3>
                    <p className="text-muted-foreground">{pillar.subtitle}</p>
                </div>

                {/* Back of the card */}
                <div className="absolute inset-0 w-full h-full rounded-2xl bg-black [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
                    <Image
                        src={pillar.image.src}
                        alt={pillar.image.alt}
                        fill
                        className="object-cover opacity-30"
                        data-ai-hint={pillar.image['data-ai-hint']}
                    />
                     <div className="absolute inset-0 flex items-center justify-center p-6">
                        <p className="text-sm leading-relaxed text-white text-center">
                            {pillar.content}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function Pillars() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold font-headline mb-8 text-center">Our Foundation: Three Pillars of Transformation</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {pillarData.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}
