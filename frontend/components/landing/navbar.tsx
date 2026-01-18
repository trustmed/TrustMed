"use client";
import { Home, Layers, Sparkles, HelpCircle } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function NavigationBar() {
  const navItems = [
    { name: "Home", url: "/landing#home", icon: Home },
    { name: "Platform", url: "/landing#platform", icon: Layers },
    { name: "Features", url: "/landing#features", icon: Sparkles },
    { name: "FAQ", url: "/landing#faq", icon: HelpCircle },
  ];

  return <NavBar items={navItems} />;
}
