export default function PrivacyPage() {
  return (
    <div className="w-full py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tighter mb-8 text-foreground">
          Privacy Policy
        </h1>
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            At TrustMed, we fundamentally believe that your health data belongs
            to you. Unlike traditional systems that silo your data or monetize
            it, TrustMed is built on a decentralized architecture that puts you
            in complete control.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Data Ownership & Private Keys
            </h2>
            <p>
              Your medical records are encrypted using advanced cryptography.
              You hold the private keys to your data. This means clearly that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>TrustMed cannot access your unencrypted medical records.</li>
              <li>
                We cannot sell, trade, or share your data with third parties.
              </li>
              <li>
                Access is granted only by you, explicitly, to specific
                healthcare providers.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Decentralized Storage
            </h2>
            <p>
              We utilize decentralized storage solutions (IPFS) and permissioned
              blockchain networks (Hyperledger Fabric) to ensure the integrity
              and availability of your audit trails. Your actual file contents
              are never stored centrally on our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Information We Collect
            </h2>
            <p>
              We only collect the minimal metadata necessary to facilitate the
              handshake between you and your healthcare providers. This
              includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Public wallet addresses for identity verification.</li>
              <li>
                Transaction logs of access requests (who requested what and
                when).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              4. Security
            </h2>
            <p>
              We employ industry-standard security measures, but heavily rely on
              the inherent security of blockchain technology. You are
              responsible for keeping your private keys and login credentials
              safe. If you lose your keys, TrustMed cannot recover your
              encrypted data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              5. Contact Us
            </h2>
            <p>
              If you have any questions about our privacy practices or the
              security of your data, please contact our Data Protection Officer
              at privacy@trustmed.io.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
