"use client";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Hero } from "@/components/ui/animated-hero";

function HeroText() {
  return (
    <div className="relative block py-40 max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="z-10 relative">
        <Hero />
      </div>
      <DotPattern
        className={cn(
          "mask-[radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  );
}

export { HeroText };
