import { Navbar }          from "@/components/sections/v2/Navbar";
import { Hero }            from "@/components/sections/v2/Hero";
import { PlatformMarquee } from "@/components/sections/v2/PlatformMarquee";
import { FeatureScroll }   from "@/components/sections/v2/FeatureScroll";
import { StatsBand }       from "@/components/sections/v2/StatsBand";
import { BentoSection }    from "@/components/sections/v2/BentoSection";
import { WaitlistSection } from "@/components/sections/v2/WaitlistSection";
import { Footer }          from "@/components/sections/v2/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <PlatformMarquee />
      <FeatureScroll />
      <StatsBand />
      <BentoSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
