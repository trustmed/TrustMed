"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

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
      <button
        type="button"
        onClick={cycleTheme}
        title={`Current theme: ${active}. Click to cycle.`}
        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        <ActiveIcon size={16} className="text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
}
