
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, BookHeart, MapPin, MessageSquareHeart } from "lucide-react";
import { EditableText } from "../common/EditableText";
import { useAuth } from "../auth/AuthProvider";

const features = [
  {
    icon: Users,
    titleContentId: "why_bws_f1_title",
    defaultTitle: "Parivaar Jaisa Mahol",
    descriptionContentId: "why_bws_f1_desc",
    defaultDescription: "Learn from mentors who feel like family. We teach with the care and understanding of an elder brother, making even the toughest subjects feel approachable.",
    color: "text-green-500",
    bg: "hover:bg-green-500/10",
    border: "hover:border-green-500/50",
  },
  {
    icon: BookHeart,
    titleContentId: "why_bws_f2_title",
    defaultTitle: "Sirf Ratta Nahi, Concept Samjho",
    descriptionContentId: "why_bws_f2_desc",
    defaultDescription: "Our goal isn't just to help you pass exams, but to make you fall in love with learning. We focus on the 'why' behind every topic for true mastery.",
    color: "text-blue-500",
    bg: "hover:bg-blue-500/10",
    border: "hover:border-blue-500/50",
  },
  {
    icon: MapPin,
    titleContentId: "why_bws_f3_title",
    defaultTitle: "Bihar Ke Liye, Bihar Se",
    descriptionContentId: "why_bws_f3_desc",
    defaultDescription: "As creators from Bihar, we understand your background, your language, and your dreams. Our content is designed specifically for you.",
    color: "text-amber-500",
    bg: "hover:bg-amber-500/10",
    border: "hover:border-amber-500/50",
  },
  {
    icon: MessageSquareHeart,
    titleContentId: "why_bws_f4_title",
    defaultTitle: "24/7 Doubt Support",
    descriptionContentId: "why_bws_f4_desc",
    defaultDescription: "Never get stuck on a problem again. Our support systems, including the BWS Buddy, are always available to help you, day or night.",
    color: "text-purple-500",
    bg: "hover:bg-purple-500/10",
    border: "hover:border-purple-500/50",
  },
];

export default function WhyBws() {
  const { textContent } = useAuth();
  
  return (
    <section className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
             <EditableText
              contentId="why_bws_title"
              defaultValue={textContent.why_bws_title || "Why BiharWaleSirji?"}
              onSave={() => {}}
            />
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
             <EditableText
              contentId="why_bws_subtitle"
              defaultValue={textContent.why_bws_subtitle || "We're not just another ed-tech platform. We are a revolution built on a foundation of trust, understanding, and a shared dream."}
              onSave={() => {}}
            />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <Card key={index} className={`text-center flex flex-col group transition-all duration-300 transform-gpu hover:-translate-y-2 ${feature.bg} ${feature.border}`}>
                    <CardContent className="p-8 flex-grow flex flex-col">
                         <div className="mx-auto bg-primary/10 p-5 rounded-full w-fit mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <feature.icon className={`w-10 h-10 ${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-bold font-headline mb-3">
                           <EditableText
                            contentId={feature.titleContentId}
                            defaultValue={textContent[feature.titleContentId] || feature.defaultTitle}
                            onSave={() => {}}
                          />
                        </h3>
                        <p className="text-muted-foreground flex-grow">
                          <EditableText
                            contentId={feature.descriptionContentId}
                            defaultValue={textContent[feature.descriptionContentId] || feature.defaultDescription}
                            onSave={() => {}}
                            multiline
                          />
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
