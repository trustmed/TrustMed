"use client";

import IntroAnimation from "../ui/scroll-morph-hero";
import Stats from "./stats";

export default function Hero() {
  return (
    <IntroAnimation>
      <Stats />
    </IntroAnimation>
  );
}
