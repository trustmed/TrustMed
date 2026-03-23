"use client";
import { Home, Layers, Sparkles, HelpCircle, LogIn, LayoutDashboard } from "lucide-react";
import { getAuthUser } from "@/utils/auth";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function NavigationBar() {
  const user = getAuthUser();
  const navItems = [
    { name: "Home", url: "/#home", icon: Home },
    { name: "Platform", url: "/#platform", icon: Layers },
    { name: "Features", url: "/#features", icon: Sparkles },
    { name: "FAQ", url: "/#faq", icon: HelpCircle },
    user
      ? { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard }
      : { name: "Login", url: "/signin", icon: LogIn },
  ];

  return <NavBar items={navItems} />;
}
