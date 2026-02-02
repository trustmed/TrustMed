"use client";

/**
 * Footer component for the application.
 * Renders a multi-column footer with branding, navigation links organized by category
 * (Product, Company, Legal), social media links, and copyright information.
 * Dynamically displays the current year.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-foreground to-accent flex items-center justify-center">
                <span className="text-foreground font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-lg">TrustMed</span>
            </div>
            <p className="text-sm opacity-75">
              Secure, decentralized healthcare data management.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm opacity-75 hover:opacity-100 transition">
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm opacity-75">
            © {currentYear} TrustMed. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a
              href="#"
              className="text-sm opacity-75 hover:opacity-100 transition"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-sm opacity-75 hover:opacity-100 transition"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="text-sm opacity-75 hover:opacity-100 transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
