"use client";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
          Ready to Take Control?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Join thousands of patients and healthcare providers building the
          future of healthcare data ownership and transparency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 h-12 px-8"
          >
            Start Your Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 bg-transparent"
          >
            Schedule a Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
