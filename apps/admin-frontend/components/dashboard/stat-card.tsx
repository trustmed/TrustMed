import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  accent?: "indigo" | "emerald" | "amber" | "rose";
  className?: string;
}

/** 10% opacity icon backgrounds — looks sophisticated, not saturated */
const ACCENT_STYLES = {
  indigo: {
    wrap: "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400",
  },
  emerald: {
    wrap: "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  amber: {
    wrap: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  },
  rose: {
    wrap: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
  },
};

export function StatCard({
  icon,
  label,
  value,
  description,
  accent = "indigo",
  className,
}: Readonly<StatCardProps>) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 transition-all duration-300 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          styles.wrap
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[28px] font-bold leading-none tracking-tight text-neutral-900 dark:text-neutral-50">
          {value === "—" || value === "" ? (
            <span className="text-neutral-300 dark:text-neutral-600">0</span>
          ) : (
            value
          )}
        </p>
        <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        {description && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500">{description}</p>
        )}
      </div>
    </div>
  );
}
