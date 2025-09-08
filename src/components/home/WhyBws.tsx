
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookHeart, MapPin, MessageSquareHeart } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Parivaar Jaisa Mahol",
    description: "Learn from mentors who feel like family. We teach with the care and understanding of an elder brother, making even the toughest subjects feel approachable.",
    color: "text-green-500",
    bg: "hover:bg-green-500/10",
    border: "hover:border-green-500/50",
  },
  {
    icon: BookHeart,
    title: "Sirf Ratta Nahi, Concept Samjho",
    description: "Our goal isn't just to help you pass exams, but to make you fall in love with learning. We focus on the 'why' behind every topic for true mastery.",
    color: "text-blue-500",
    bg: "hover:bg-blue-500/10",
    border: "hover:border-blue-500/50",
  },
  {
    icon: MapPin,
    title: "Bihar Ke Liye, Bihar Se",
    description: "As creators from Bihar, we understand your background, your language, and your dreams. Our content is designed specifically for you.",
    color: "text-amber-500",
    bg: "hover:bg-amber-500/10",
    border: "hover:border-amber-500/50",
  },
  {
    icon: MessageSquareHeart,
    title: "24/7 Doubt Support",
    description: "Never get stuck on a problem again. Our support systems, including the BWS Buddy, are always available to help you, day or night.",
    color: "text-purple-500",
    bg: "hover:bg-purple-500/10",
    border: "hover:border-purple-500/50",
  },
];

export default function WhyBws() {
  return (
    <section className="py-20 md:py-28 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Why BiharWaleSirji?</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            We're not just another ed-tech platform. We are a revolution built on a foundation of trust, understanding, and a shared dream.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <Card key={index} className={`text-center flex flex-col group transition-all duration-300 transform-gpu hover:-translate-y-2 ${feature.bg} ${feature.border}`}>
                    <CardContent className="p-8 flex-grow flex flex-col">
                         <div className="mx-auto bg-primary/10 p-5 rounded-full w-fit mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <feature.icon className={`w-10 h-10 ${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-bold font-headline mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground flex-grow">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
