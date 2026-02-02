import {
  defaultSections,
  defaultSocialLinks,
  defaultLegalLinks,
} from "./footer-data";

interface FooterProps {
  logo?: {
    url: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

/**
 * FooterSection component for the site footer.
 * Renders a comprehensive footer with logo, description, navigation sections, social links,
 * copyright information, and legal links. All content is customizable via props.
 * 
 * @param {FooterProps} props - Footer configuration
 * @param {Object} props.logo - Logo configuration with URL, alt text, and title
 * @param {Array} props.sections - Navigation sections with links (Platform, Company, Legal)
 * @param {string} props.description - Footer description text
 * @param {Array} props.socialLinks - Social media links with icons
 * @param {string} props.copyright - Copyright text
 * @param {Array} props.legalLinks - Legal policy links
 */
export const FooterSection = ({
  logo = {
    url: "/",
    alt: "TrustMed Logo",
    title: "TrustMed",
  },
  sections = defaultSections,
  description = "Secure, blockchain-powered healthcare data management for the modern world.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2024 TrustMed Inc. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: FooterProps) => {
  return (
    <section className="py-12 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url} className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-md p-1">
                  <img
                    src="/logo-black.png"
                    alt={logo.alt}
                    className="h-8 w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/logo-white.png"
                    alt={logo.alt}
                    className="hidden h-8 w-auto object-contain dark:block"
                  />
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {logo.title}
                </h2>
              </a>
            </div>
            <p className="max-w-[70%] text-sm text-muted-foreground">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social) => (
                <li
                  key={social.label}
                  className="font-medium hover:text-primary transition-colors"
                >
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 font-bold text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link) => (
                    <li
                      key={link.name}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-border/40 py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link) => (
              <li
                key={link.name}
                className="hover:text-primary transition-colors"
              >
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
