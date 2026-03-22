"use client";

import type { AppointmentStatus } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<AppointmentStatus, { label: string; dot: string; className: string }> = {
    accepted: {
        label: "Accepted",
        dot: "bg-emerald-500",
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    pending: {
        label: "Pending",
        dot: "bg-amber-400",
        className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-neutral-400",
        className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    },
};

export interface AppointmentStatusBadgeProps {
    status: AppointmentStatus;
    className?: string;
}

export function AppointmentStatusBadge({ status, className }: Readonly<AppointmentStatusBadgeProps>) {
    const cfg = STATUS_STYLES[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                cfg.className,
                className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
        </span>
    );
}
