import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { WhatYoullDiscover } from "@/components/sections/WhatYoullDiscover";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WrappedPreview } from "@/components/sections/WrappedPreview";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { SocialProof } from "@/components/sections/SocialProof";
import { WaitlistSection } from "@/components/sections/WaitlistSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WhatYoullDiscover />
      <HowItWorks />
      <WrappedPreview />
      <FeaturesGrid />
      <SocialProof />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
