"use client"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "👤",
      title: "Create Your Identity",
      description: "Set up your secure blockchain-based digital identity that only you control with private keys.",
    },
    {
      number: "02",
      icon: "🏥",
      title: "Add Medical Records",
      description: "Healthcare providers securely upload encrypted copies of your medical data to your profile.",
    },
    {
      number: "03",
      icon: "🔐",
      title: "Control Access",
      description: "Grant temporary access to doctors and revoke permissions anytime with a single click.",
    },
    {
      number: "04",
      icon: "⚡",
      title: "Instant Sharing",
      description: "New healthcare providers access your complete history instantly with your permission.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">How TrustMed Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, transparent process that puts you in complete control of your health data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-muted/50 hover:bg-muted transition-colors rounded-2xl p-8 h-full border border-border">
                <div className="text-5xl mb-4 opacity-60">{step.icon}</div>
                <div className="text-sm font-bold text-primary mb-3">{step.number}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
