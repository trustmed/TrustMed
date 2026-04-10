"use client";

export function Security() {
  const features = [
    {
      icon: "🔒",
      title: "Blockchain Security",
      description:
        "Immutable record of all access and consent events for complete transparency.",
    },
    {
      icon: "🔑",
      title: "Patient Ownership",
      description:
        "You own your data and control every access request with cryptographic verification.",
    },
    {
      icon: "🌐",
      title: "Decentralized",
      description:
        "No single point of failure. Data is distributed across secure nodes worldwide.",
    },
    {
      icon: "📊",
      title: "Full Transparency",
      description:
        "See exactly who accessed your data, when, and for what purpose in real-time.",
    },
    {
      icon: "🛡️",
      title: "Enterprise Encryption",
      description:
        "Military-grade encryption for all data at rest and in transit.",
    },
    {
      icon: "✅",
      title: "HIPAA Compliant",
      description:
        "Built to meet all healthcare compliance and regulatory requirements.",
    },
  ];

  return (
    <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Enterprise-Grade Security
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your health data is protected by the latest in blockchain and
            cryptographic security.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-xl p-6 border border-border hover:border-primary/50 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
