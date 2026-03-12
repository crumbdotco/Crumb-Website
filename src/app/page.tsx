import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { FeatureScroll } from "@/components/sections/FeatureScroll";
import { StatsShowcase } from "@/components/sections/StatsShowcase";
import { WrappedPreview } from "@/components/sections/WrappedPreview";
import { SoulmateSection } from "@/components/sections/SoulmateSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { DownloadCTA } from "@/components/sections/DownloadCTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureScroll />
      <StatsShowcase />
      <WrappedPreview />
      <SoulmateSection />
      <PricingSection />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
