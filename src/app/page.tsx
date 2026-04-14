import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";
import { FlowingBackground } from "@/components/shared/FlowingBackground";
import { WaveDivider } from "@/components/shared/WaveDivider";

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
