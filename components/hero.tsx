"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6 inline-block">
          <span className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
            🔒 Privacy-First Healthcare
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
          Your Medical Records,
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            {" "}
            Under Your Control
          </span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Secure, decentralized health records powered by blockchain technology. Share your medical history instantly
          with any healthcare provider, while maintaining complete control and transparency.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
            Start Protecting Your Data
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
            <span>Watch Demo</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-12 border-t border-border">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">100K+</div>
            <p className="text-sm text-muted-foreground">Patient Records Secured</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <p className="text-sm text-muted-foreground">Uptime Guarantee</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <p className="text-sm text-muted-foreground">Hospital Partners</p>
          </div>
        </div>
      </div>
    </section>
  )
}
