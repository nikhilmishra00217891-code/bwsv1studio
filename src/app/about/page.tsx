
import { EditableText } from "@/components/common/EditableText";
import { EditableImage } from "@/components/common/EditableImage";
import { getTextContent } from "@/lib/data/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us - Reviving Bihar's Educational Excellence",
    description: "BiharwaleSir Ji is a movement to restore Bihar's rightful place as the educational epicenter of the world.",
}

export default async function AboutPage() {
  const textContent = await getTextContent();

  return (
    <div className="relative bg-background overflow-hidden">
        <EditableImage
            contentId="aboutPageBgImage_nalanda"
            src={textContent.aboutPageBgImage_nalanda || "https://i.postimg.cc/Gp3FkZmc/1d8aefb2637853f72d736309ce7b1503.jpg"}
            alt="Nalanda Ruins"
            layout="fill"
            objectFit="cover"
            className="opacity-10"
            data-ai-hint="nalanda ruins"
        />
      <div className="relative container mx-auto px-6 py-20 md:py-28 animate-fade-in space-y-16">
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
            <EditableText
              contentId="about_title"
              defaultValue={textContent.about_title || "About BiharwaleSir Ji: Reviving Bihar's Educational Excellence"}
            />
          </h1>
        </div>

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
        
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-headline mb-8 text-center">Our Foundation: Three Pillars of Transformation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold font-headline mb-3">पारिवार (Parivar) - Family</h3>
              <EditableText
                contentId="about_pillar_parivar"
                defaultValue={textContent.about_pillar_parivar || "Bihar is an integral and valuable part of Bharat's grand family, deserving respect and recognition rather than ridicule. Every student who joins us becomes part of our Gyan Parivar (Knowledge Family), where learning transcends boundaries and creates bonds that last a lifetime. We believe that education flourishes in an environment of mutual respect, care, and collective growth—values that have been the cornerstone of Bihar's educational heritage."}
                multiline
                className="w-full text-sm text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
              />
            </div>
             <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold font-headline mb-3">प्रतिष्ठा (Pratishtha) - Dignity & Honor</h3>
              <EditableText
                contentId="about_pillar_pratishtha"
                defaultValue={textContent.about_pillar_pratishtha || "We are dedicated to elevating Bihar's dignity and transforming it into the nation's premier state for education and development. More importantly, we are committed to enhancing the pratishtha (dignity) of every student—from their academic journey through examinations to their professional and personal lives. We believe that quality education is the most powerful tool for restoring and building individual and collective honor."}
                multiline
                className="w-full text-sm text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
              />
            </div>
             <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold font-headline mb-3">परिवर्तन (Parivartan) - Transformation</h3>
              <EditableText
                contentId="about_pillar_parivartan"
                defaultValue={textContent.about_pillar_parivartan || "Our mission is to catalyze positive change in Bihar and contribute to Bharat's journey toward becoming a global leader. We aim to transform the life of every child by providing them with opportunities and educational experiences that rival those available to students in metropolitan cities like Mumbai. Through our comprehensive approach to learning, we ensure that geographical location never becomes a barrier to accessing world-class education."}
                multiline
                className="w-full text-sm text-foreground/80 leading-relaxed block whitespace-pre-wrap text-left"
              />
            </div>
          </div>
        </div>

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

    