
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sunrise, Users } from 'lucide-react';
import { useState } from 'react';

const pillarData = [
  {
    id: "parivar",
    title: "पारिवार (Parivar)",
    subtitle: "Family",
    icon: Users,
    content: "Bihar is an integral and valuable part of Bharat's grand family... We believe that education flourishes in an environment of mutual respect, care, and collective growth.",
    color: "bg-green-500",
  },
  {
    id: "pratishtha",
    title: "प्रतिष्ठा (Pratishtha)",
    subtitle: "Dignity & Honor",
    icon: Award,
    content: "We are dedicated to elevating Bihar's dignity... We believe that quality education is the most powerful tool for restoring and building individual and collective honor.",
    color: "bg-blue-500",
  },
  {
    id: "parivartan",
    title: "परिवर्तन (Parivartan)",
    subtitle: "Transformation",
    icon: Sunrise,
    content: "Our mission is to catalyze positive change in Bihar... We ensure that geographical location never becomes a barrier to accessing world-class education.",
    color: "bg-amber-500",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const PillarCard = ({ pillar, index }: { pillar: typeof pillarData[0], index: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleInteractionStart = () => setIsHovered(true);
    const handleInteractionEnd = () => setIsHovered(false);

    return (
        <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="relative h-64 w-full rounded-2xl shadow-lg overflow-hidden cursor-pointer bg-card"
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onClick={() => setIsHovered(!isHovered)}
        >
            {/* Expanding Ink Background */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className={`absolute inset-0 ${pillar.color}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 2.5 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.4, ease: 'easeIn' }}
                    />
                )}
            </AnimatePresence>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full p-6 flex items-center justify-center text-center">
                {/* Title and Icon */}
                <AnimatePresence>
                    {!isHovered && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="flex flex-col items-center"
                        >
                            <pillar.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-bold font-headline mb-1">{pillar.title}</h3>
                            <p className="text-muted-foreground">{pillar.subtitle}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Description Text */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0 }}
                            className="text-primary-foreground"
                        >
                            <p className="text-sm leading-relaxed">{pillar.content}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default function Pillars() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold font-headline mb-8 text-center">Our Foundation: Three Pillars of Transformation</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {pillarData.map((pillar, index) => (
          <PillarCard key={pillar.id} pillar={pillar} index={index} />
        ))}
      </div>
    </div>
  );
}
