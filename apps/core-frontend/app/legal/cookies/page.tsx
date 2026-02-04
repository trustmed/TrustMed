export default function CookiesPage() {
  return (
    <div className="w-full py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tighter mb-8 text-foreground">
          Cookie Policy
        </h1>
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            TrustMed believes in minimizing data tracking. This Cookie Policy
            explains what little information we store on your device.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. What are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit
              a website. They are typically used to remember your preferences or
              login state.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. How We Use Cookies
            </h2>
            <p>
              We use only <strong>Strictly Necessary Cookies</strong>. These are
              essential for the platform to function securely.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session Tokens:</strong> To keep you logged in securely
                during your visit.
              </li>
              <li>
                <strong>Security Preferences:</strong> To prevent Cross-Site
                Request Forgery (CSRF) attacks.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. No Tracking or Advertising
            </h2>
            <p>
              We <strong>do not</strong> use cookies for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Marketing or advertising purposes.</li>
              <li>Tracking your browsing history across other websites.</li>
              <li>Selling your behavioral data to third parties.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Managing Cookies
            </h2>
            <p>
              Most web browsers allow you to control cookies through their
              settings preferences. However, limiting strictly necessary cookies
              may prevent you from accessing your secure medical dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
