import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

/**
 * Default navigation sections for footer.
 * Contains Platform, Company, and Legal section links.
 */
export const defaultSections = [
  {
    title: "Platform",
    links: [
      { name: "Features", href: "#" },
      { name: "Security", href: "#" },
      { name: "Compliance", href: "#" },
      { name: "For Providers", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "News", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/legal/privacy" },
      { name: "Terms of Service", href: "/legal/terms" },
      { name: "Cookie Policy", href: "/legal/cookies" },
      { name: "BAA Agreement", href: "#" },
    ],
  },
];

/**
 * Default social media links for footer.
 * Contains Instagram, Facebook, Twitter, and LinkedIn links with icons.
 */
export const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

/**
 * Default legal links for footer.
 * Contains Terms and Conditions and Privacy Policy links.
 */
export const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];
