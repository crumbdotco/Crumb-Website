import dynamic from "next/dynamic";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { FlowingBackground } from "@/components/shared/FlowingBackground";
import { WaveDivider } from "@/components/shared/WaveDivider";

const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then(m => ({ default: m.HowItWorks })));
const FeaturesGrid = dynamic(() => import("@/components/sections/FeaturesGrid").then(m => ({ default: m.FeaturesGrid })));
const TrustStrip = dynamic(() => import("@/components/sections/TrustStrip").then(m => ({ default: m.TrustStrip })));
const CTASection = dynamic(() => import("@/components/sections/CTASection").then(m => ({ default: m.CTASection })));
const Footer = dynamic(() => import("@/components/sections/Footer").then(m => ({ default: m.Footer })));

export default function Home() {
  return (
    <main>
      <FlowingBackground />
      <Navbar />
      <Hero />
      <WaveDivider variant="cream-to-dark" />
      <HowItWorks />
      <WaveDivider variant="dark-to-cream" />
      <FeaturesGrid />
      <TrustStrip />
      <WaveDivider variant="cream-to-dark-complex" />
      <CTASection />
      <Footer />
    </main>
  );
}
