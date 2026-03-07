import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Platforms } from "@/components/Platforms";
import { Premium } from "@/components/Premium";
import { CTA } from "@/components/CTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Platforms />
      <Premium />
      <CTA />
    </main>
  );
}
