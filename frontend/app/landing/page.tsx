import BentoGridShowcaseDemo from "@/components/landing/bento";
import { FooterSection } from "@/components/landing/footer";
import { HeroText } from "@/components/landing/hero-text";

import { FaqSection } from "@/components/landing/faq-section";
import Stats from "@/components/landing/stats";
import ContentSection from "@/components/content-5";

export default function page() {
  return (
    <div>
      {/* <Hero /> */}
      <section id="home">
        <HeroText />
        <Stats />
      </section>

      <section id="platform">
        <ContentSection />
      </section>

      <section id="features">
        <BentoGridShowcaseDemo />
      </section>

      <section id="faq">
        <FaqSection />
      </section>

      <FooterSection />
    </div>
  );
}
