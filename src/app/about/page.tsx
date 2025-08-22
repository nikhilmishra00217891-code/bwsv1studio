
import Image from "next/image";
import { BrainCircuit, HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
import { EditableText } from "@/components/common/EditableText";
import { getTextContent } from "@/lib/data/content";
import { EditableImage } from "@/components/common/EditableImage";

export const metadata: Metadata = {
    title: "About Us - BiharWaleSirji",
    description: "We’re not just a platform, we’re Parivaar.",
}

export default async function AboutPage() {
  const textContent = await getTextContent();

  return (
    <div className="relative bg-card/50 overflow-hidden">
        <EditableImage
            contentId="aboutPageBgImage"
            src={textContent.aboutPageBgImage || "https://placehold.co/1920x1080.png"}
            alt="Bihar Map"
            layout="fill"
            objectFit="cover"
            className="opacity-10"
            data-ai-hint="bihar map vector"
        />
      <div className="relative container mx-auto px-6 py-24 md:py-32 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight">
            <EditableText
              contentId="aboutPageTitle"
              defaultValue={textContent.aboutPageTitle || "We’re not just a platform, we’re Parivaar."}
              className="w-full text-center"
            />
          </h1>
        </div>

        <div className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm p-8 md:p-12 rounded-lg mt-12 shadow-lg">
          <EditableText
            contentId="aboutPageMainText"
            defaultValue={textContent.aboutPageMainText || `In the heartlands of Bihar, where dreams are forged in the fires of aspiration, education isn't just a path—it's a legacy. We, at BiharWaleSirji, were born from this very soil. We saw students, bright-eyed and brilliant, navigating the labyrinth of competitive exams with courage but often without a guide who truly understood their language, their culture, their spirit.

We are not just another ed-tech platform. We are the elder brother you never had, the 'Sirji' from your own neighborhood who knows how to make complex calculus feel like a friendly chat. Our slogan, 'Parivaar. Pratishtha. Parivartan.' (Family. Honor. Change.) is the heartbeat of our mission. We are building a family of learners, upholding the honor of your hard work, and bringing a revolution in how education is perceived and delivered.

Welcome home. Welcome to BiharWaleSirji.`}
            multiline
            className="w-full text-lg text-foreground/80 leading-relaxed space-y-6 block whitespace-pre-wrap text-left"
          />
        </div>

        <div className="mt-20 md:mt-28">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              <EditableText
                contentId="aboutPageBwsBuddyTitle"
                defaultValue={textContent.aboutPageBwsBuddyTitle || "Meet the BWS Buddy"}
                className="w-full text-center"
              />
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              <EditableText
                contentId="aboutPageBwsBuddySubtitle"
                defaultValue={textContent.aboutPageBwsBuddySubtitle || "Your AI Doubt Buddy, available 24x7."}
                className="w-full text-center"
              />
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-background/80 backdrop-blur-sm p-8 rounded-lg shadow-lg flex flex-col items-center text-center">
              <BrainCircuit className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold font-headline mb-2">
                <EditableText
                    contentId="aboutFeatureAITitle"
                    defaultValue={textContent.aboutFeatureAITitle || "Powered by AI"}
                    className="w-full text-center"
                />
              </h3>
              <EditableText
                contentId="aboutFeatureAIDescription"
                defaultValue={textContent.aboutFeatureAIDescription || "Leveraging the latest in artificial intelligence to provide instant, accurate, and step-by-step solutions to your toughest questions."}
                multiline
                className="w-full text-foreground/80 block"
              />
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-8 rounded-lg shadow-lg flex flex-col items-center text-center">
              <HeartHandshake className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold font-headline mb-2">
                <EditableText
                    contentId="aboutFeatureEmpathyTitle"
                    defaultValue={textContent.aboutFeatureEmpathyTitle || "Trained to Think Like Your Elder Brother"}
                    className="w-full text-center"
                />
              </h3>
              <EditableText
                contentId="aboutFeatureEmpathyDescription"
                defaultValue={textContent.aboutFeatureEmpathyDescription || "Our AI isn't just smart; it's empathetic. We've trained it on our unique teaching philosophy to be encouraging, patient, and always ready to help you understand, not just memorize."}
                multiline
                className="w-full text-foreground/80 block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
