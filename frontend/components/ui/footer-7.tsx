import React from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  description?: string;
  copyright?: string;
}

const sections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#" },
      { name: "Security", href: "#" },
      { name: "Pricing", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
  { icon: <FaGithub className="size-5" />, href: "#", label: "GitHub" },
];

export const Footer7 = ({
  description = "Secure, decentralized healthcare data management.",
  copyright = `© ${new Date().getFullYear()} TrustMed. All rights reserved.`,
}: Footer7Props) => {
  return (
    <section className="py-16 md:py-24 bg-background text-foreground border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-lg">TrustMed</span>
            </div>

            <p className="max-w-[70%] text-sm text-muted-foreground">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social) => (
                <li
                  key={social.label}
                  className="font-medium hover:text-foreground transition-colors"
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
                      className="font-medium hover:text-foreground transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-border py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
        </div>
      </div>
    </section>
  );
};
