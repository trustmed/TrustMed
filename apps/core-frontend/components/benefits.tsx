"use client";

export function Benefits() {
  const benefits = [
    {
      category: "For Patients",
      icon: "❤️",
      items: [
        "Complete control over your medical data",
        "Instant access to your full medical history",
        "No more repeating medical tests",
        "Secure emergency provider access",
        "Lifetime audit trail of all access",
      ],
    },
    {
      category: "For Hospitals",
      icon: "🏥",
      items: [
        "Reduced administrative costs",
        "Better patient care with complete histories",
        "Interoperability between systems",
        "HIPAA compliance built-in",
        "Faster patient onboarding",
      ],
    },
  ];

  return (
    <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Benefits for Everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            TrustMed creates a win-win for patients and healthcare providers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{benefit.icon}</span>
                <h3 className="text-2xl font-bold text-foreground">
                  {benefit.category}
                </h3>
              </div>
              <ul className="space-y-3">
                {benefit.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
