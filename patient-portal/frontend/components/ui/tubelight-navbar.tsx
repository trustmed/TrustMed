"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  readonly items: NavItem[];
  className?: string;
}

/**
 * NavBar component for the main navigation menu.
 * Renders a glassmorphic navigation bar with animated tab indicators and theme toggle.
 * Displays navigation items with icons and highlights the active tab.
 * Positioned at the bottom on mobile and top on desktop.
 * 
 * @param {NavBarProps} props - Component props
 * @param {NavItem[]} props.items - Array of navigation items with name, url, and icon
 * @param {string} props.className - Additional CSS classes
 */
export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-white/70 dark:bg-black/70 border border-black/5 dark:border-white/10 backdrop-blur-xl py-1 px-1 rounded-full shadow-sm">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/60 hover:text-foreground",
                isActive && "text-primary dark:text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 dark:bg-primary/20 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary/20 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
            "text-foreground/80 hover:text-foreground",
          )}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={18} strokeWidth={2.5} />
            ) : (
              <Moon size={18} strokeWidth={2.5} />
            )
          ) : (
            <div className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}
