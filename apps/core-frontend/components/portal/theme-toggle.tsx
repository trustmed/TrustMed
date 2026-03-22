"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const THEMES = [
  { value: "light", icon: Sun,     label: "Light" },
  { value: "dark",  icon: Moon,    label: "Dark"  },
  { value: "system", icon: Monitor, label: "Auto"  },
] as const;

/**
 * Collapsed state: a single icon cycling through themes on click.
 * Expanded state: a 3-segment inline toggle showing light / dark / system.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { open, animate } = useSidebar();

  const active = theme ?? "system";

  // Collapsed: cycle icon button
  const ActiveIcon = THEMES.find((t) => t.value === active)?.icon ?? Monitor;

  const cycleTheme = () => {
    const idx = THEMES.findIndex((t) => t.value === active);
    const next = THEMES[(idx + 1) % THEMES.length].value;
    setTheme(next);
  };

  return (
    <div className="flex items-center gap-2 py-2">
      {/* Collapsed → single icon button */}
      {!open && (
        <button
          type="button"
          onClick={cycleTheme}
          title={`Current theme: ${active}. Click to cycle.`}
          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ActiveIcon size={16} className="text-neutral-500 dark:text-neutral-400" />
        </button>
      )}

      {/* Expanded → compact icon-only segmented control */}
      {open && (
        <motion.div
          animate={{
            display: animate ? (open ? "flex" : "none") : "flex",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="flex items-center gap-1 p-1 bg-[#F1F5F9] dark:bg-neutral-800 rounded-xl w-full"
        >
          {THEMES.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                "flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all duration-200",
                active === value
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
