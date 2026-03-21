"use client";

import type { AppointmentStatus } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
    AppointmentStatus,
    { label: string; className: string }
> = {
    accepted: {
        label: "Accepted",
        className:
            "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-800",
    },
    cancelled: {
        label: "Cancelled",
        className:
            "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200 border-red-200/80 dark:border-red-800",
    },
    pending: {
        label: "Pending",
        className:
            "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100 border-amber-200/80 dark:border-amber-800",
    },
};

export interface AppointmentStatusBadgeProps {
    status: AppointmentStatus;
    className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
    const cfg = STATUS_STYLES[status];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium capitalize",
                cfg.className,
                className
            )}
        >
            {cfg.label}
        </span>
    );
}
