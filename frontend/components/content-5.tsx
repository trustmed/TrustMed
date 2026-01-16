import { Globe, Lock, ShieldCheck, Zap } from "lucide-react";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <div className="mx-auto max-w-2xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            The TrustMed ecosystem bridges patient data, providers, and privacy.
          </h2>
          <p className="text-muted-foreground text-lg">
            TrustMed is evolving healthcare data management. It supports an
            entire ecosystem — from secure storage to instant, verifiable access
            for doctors and patients worldwide.
          </p>
        </div>
        <img
          src="/report.jpg"
          alt="Medical report with security shield"
          className="w-full h-auto rounded-lg shadow-2xl border border-gray-100/10 grayscale"
        />

        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4 pt-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Instant Access
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Share your records instantly with any healthcare provider via
              secure, temporary links.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Immutable Records
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Blockchain technology ensures your medical history is tamper-proof
              and verified.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Privacy First
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              You own your keys. No one accesses your data without your explicit
              permission.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-foreground" />

              <h3 className="text-sm font-medium text-foreground">
                Global Reach
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your health history travels with you, accessible anywhere in the
              world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
