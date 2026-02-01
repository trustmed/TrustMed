"use client";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 w-full bg-background border-b border-border z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                T
              </span>
            </div>
            <span className="font-bold text-xl text-foreground">TrustMed</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Benefits
            </a>
            <a
              href="#security"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Security
            </a>
            <a
              href="#contact"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Contact
            </a>
          </nav>

          <Button className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
