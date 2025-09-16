
"use client";

import { motion } from 'framer-motion';
import { Award, Sunrise, Users } from 'lucide-react';
import { EditableText } from '@/components/common/EditableText';
import { useAuth } from '../auth/AuthProvider';

const pillarData = [
  {
    id: "parivar",
    title: "पारिवार (Parivar)",
    subtitle: "Family",
    icon: Users,
    contentId: "about_pillar_parivar",
    defaultContent: "Bihar is an integral and valuable part of Bharat's grand family, deserving respect and recognition rather than ridicule. Every student who joins us becomes part of our Gyan Parivar (Knowledge Family), where learning transcends boundaries and creates bonds that last a lifetime. We believe that education flourishes in an environment of mutual respect, care, and collective growth—values that have been the cornerstone of Bihar's educational heritage.",
  },
  {
    id: "pratishtha",
    title: "प्रतिष्ठा (Pratishtha)",
    subtitle: "Dignity & Honor",
    icon: Award,
    contentId: "about_pillar_pratishtha",
    defaultContent: "We are dedicated to elevating Bihar's dignity and transforming it into the nation's premier state for education and development. More importantly, we are committed to enhancing the pratishtha (dignity) of every student—from their academic journey through examinations to their professional and personal lives. We believe that quality education is the most powerful tool for restoring and building individual and collective honor.",
  },
  {
    id: "parivartan",
    title: "परिवर्तन (Parivartan)",
    subtitle: "Transformation",
    icon: Sunrise,
    contentId: "about_pillar_parivartan",
    defaultContent: "Our mission is to catalyze positive change in Bihar and contribute to Bharat's journey toward becoming a global leader. We aim to transform the life of every child by providing them with opportunities and educational experiences that rival those available to students in metropolitan cities like Mumbai. Through our comprehensive approach to learning, we ensure that geographical location never becomes a barrier to accessing world-class education.",
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
    const { textContent } = useAuth();
    
    return (
        <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="relative bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg overflow-hidden h-64 group"
        >
            {/* Front of the card */}
            <motion.div 
                className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center"
                animate={{ opacity: 1 }}
                whileHover={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <pillar.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold font-headline mb-1">{pillar.title}</h3>
                <p className="text-muted-foreground">{pillar.subtitle}</p>
            </motion.div>
            
            {/* Back of the card (revealed on hover) */}
            <motion.div
                className="absolute inset-0 p-6 flex flex-col justify-center opacity-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <EditableText
                    contentId={pillar.contentId}
                    defaultValue={textContent[pillar.contentId] || pillar.defaultContent}
                    multiline
                    className="w-full text-sm text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
                />
            </motion.div>
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
