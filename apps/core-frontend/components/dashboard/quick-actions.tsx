"use client";

import { useRouter } from "next/navigation";
import { Send, FileClock, FileText, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  variant: "primary" | "outline";
}

const ACTIONS: QuickAction[] = [
  {
    label: "Share Records",
    icon: <Send className="h-4 w-4" strokeWidth={2} />,
    href: "/share-record",
    variant: "primary",
  },
  {
    label: "Medical History",
    icon: <FileClock className="h-4 w-4" strokeWidth={2} />,
    href: "/medical-history",
    variant: "outline",
  },
  {
    label: "Medical Records",
    icon: <FileText className="h-4 w-4" strokeWidth={2} />,
    href: "/medical-records",
    variant: "outline",
  },
  {
    label: "Appointments",
    icon: <CalendarClock className="h-4 w-4" strokeWidth={2} />,
    href: "/appointments",
    variant: "outline",
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => router.push(action.href)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-200",
            action.variant === "primary"
              ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98]"
              : "border border-neutral-200/80 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
