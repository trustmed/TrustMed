"use client";

import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Benefits } from "@/components/benefits";
import { Security } from "@/components/security";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="w-full">
      <Header />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Security />
      <CTA />
      <Footer />
    </div>
  );
}
