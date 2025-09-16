
import { EditableText } from "@/components/common/EditableText";
import { EditableImage } from "@/components/common/EditableImage";
import { getTextContent } from "@/lib/data/content";
import type { Metadata } from "next";
import Image from "next/image";
import Pillars from "@/components/about/Pillars";

export const metadata: Metadata = {
    title: "About Us - Reviving Bihar's Educational Excellence",
    description: "BiharwaleSir Ji is a movement to restore Bihar's rightful place as the educational epicenter of the world.",
}

export default async function AboutPage() {
  const textContent = await getTextContent();

  return (
    <div className="bg-[#111111]">
      <div className="relative py-20 md:py-28 text-center overflow-hidden">
        <Image
          src="https://i.postimg.cc/Gp3FkZmc/1d8aefb2637853f72d736309ce7b1503.jpg"
          alt="Nalanda Ruins"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint="nalanda ruins"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="relative z-20 container mx-auto px-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white tracking-tight">
            <EditableText
              contentId="about_title"
              defaultValue={textContent.about_title || "About BiharwaleSir Ji: Reviving Bihar's Educational Excellence"}
            />
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 space-y-16">
        
        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold font-headline mb-4">Our Mission</h2>
          <EditableText
            contentId="about_mission"
            defaultValue={textContent.about_mission || "BiharwaleSir Ji is not just another EdTech platform—it's a transformative movement dedicated to restoring Bihar's rightful place as the educational epicenter of the world. We are committed to changing perceptions about Bihar while honoring its rich cultural heritage through innovative, next-generation teaching methodologies infused with authentic Bihari values and traditions."}
            multiline
            className="w-full text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
          />
        </div>

        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold font-headline mb-4">Our Vision: From Bihar to Bharat Vishwaguru</h2>
          <EditableText
            contentId="about_vision"
            defaultValue={textContent.about_vision || "We envision Bihar reclaiming its historic legacy as a global center of learning, reminiscent of the ancient Nalanda and Vikramashila universities that once attracted scholars from across Asia. Our ultimate goal is to contribute to making Bharat a Vishwaguru—a world teacher that guides humanity through wisdom, knowledge, and cultural values."}
            multiline
            className="w-full text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
          />
        </div>
        
        <Pillars />

        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold font-headline mb-4">Our Commitment: Inclusive Excellence</h2>
          <EditableText
            contentId="about_commitment"
            defaultValue={textContent.about_commitment || "At BiharwaleSir Ji, we believe that every child deserves access to premium education regardless of their background or location. Our responsibility extends beyond traditional teaching—we are committed to:\n\n- Democratizing Quality Education\n- Cultural Integration\n- Holistic Development\n- Equal Opportunities\n- Community Building"}
            multiline
            className="w-full text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
          />
        </div>

        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold font-headline mb-4">Our Legacy: Ancient Wisdom, Modern Innovation</h2>
          <EditableText
            contentId="about_legacy"
            defaultValue={textContent.about_legacy || "Drawing inspiration from Bihar's glorious educational history—home to Nalanda University, the world's first residential international university that flourished for over 800 years—we combine time-tested wisdom with cutting-edge technology. Our approach honors the guru-shishya tradition while embracing digital innovation to create engaging, effective, and accessible learning experiences."}
            multiline
            className="w-full text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
          />
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
                Bihar se Bharat Tak
            </h2>
            <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
                Every student matters. Every dream counts. Every transformation begins with education.
            </p>
            <p className="mt-8 font-bold text-lg">Jai Hind. Jai Bihar. Jai Bharat.</p>
        </div>

      </div>
    </div>
  );
}
