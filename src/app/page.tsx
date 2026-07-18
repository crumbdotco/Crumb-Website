import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Manifesto } from "@/components/landing/Manifesto";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeedMarquee } from "@/components/landing/FeedMarquee";
import { Band } from "@/components/landing/Band";
import { TasteMatch } from "@/components/landing/TasteMatch";
import { Groups } from "@/components/landing/Groups";
import { FoundingSection } from "@/components/landing/FoundingSection";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollFX } from "@/components/landing/ScrollFX";
import "./landing.css";

export default function Home() {
  return (
    <div className="landing">
      <Header />
      <span id="top" />
      <Hero />
      <Manifesto />
      <HowItWorks />
      <FeedMarquee />
      <Band />
      <TasteMatch />
      <Groups />
      <FoundingSection />
      <CTA />
      <Footer />
      <ScrollFX />
    </div>
  );
}
