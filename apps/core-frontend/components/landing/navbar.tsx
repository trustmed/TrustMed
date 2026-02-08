"use client";
import { Home, Layers, Sparkles, HelpCircle, LogIn } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function NavigationBar() {
  const navItems = [
    { name: "Home", url: "/#home", icon: Home },
    { name: "Platform", url: "/#platform", icon: Layers },
    { name: "Features", url: "/#features", icon: Sparkles },
    { name: "FAQ", url: "/#faq", icon: HelpCircle },
    { name: "Login", url: "/signin", icon: LogIn },
  ];

  return <NavBar items={navItems} />;
}
