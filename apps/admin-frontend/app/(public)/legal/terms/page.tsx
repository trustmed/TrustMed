export default function TermsPage() {
  return (
    <div className="w-full py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tighter mb-8 text-foreground">
          Terms of Service
        </h1>
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            Welcome to TrustMed. By accessing or using our decentralized
            healthcare platform, you agree to be bound by these Terms of
            Service. Please read them carefully.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Nature of Service
            </h2>
            <p>
              TrustMed is a platform for secure management and sharing of
              medical records. We are a technology provider, not a healthcare
              provider. We do not provide medical advice, diagnosis, or
              treatment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. User Responsibilities (Key Management)
            </h2>
            <p>
              TrustMed is a non-custodial service. You are solely responsible
              for maintaining the security of your private keys, passwords, and
              access credentials.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="font-medium text-foreground">Warning:</p>
              <p className="text-sm mt-1">
                If you lose your private keys, you may permanently lose access
                to your encrypted medical records. TrustMed cannot recover lost
                keys.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Acceptable Use
            </h2>
            <p>
              You agree not to use the platform for any illegal purpose. You
              must not attempt to upload malicious code, interfere with the
              network integrity (Hyperledger Fabric nodes), or attempt to gain
              unauthorized access to other users&apos; data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, TrustMed shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of data due to
              user error (e.g., lost keys).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes via the platform or email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
