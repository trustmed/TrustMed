"use client";

import { AppointmentStatusBadge } from "@/components/appointments/AppointmentStatusBadge";
import type { Appointment } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarOff, Eye, Pencil, Trash2 } from "lucide-react";

export interface AppointmentsTableProps {
    appointments: Appointment[];
    className?: string;
    onView?: (appointment: Appointment) => void;
    onEdit?: (appointment: Appointment) => void;
    onDelete?: (appointment: Appointment) => void;
}

function formatDisplayDate(isoDate: string) {
    try {
        return format(new Date(`${isoDate}T12:00:00`), "dd MMM yyyy");
    } catch {
        return isoDate;
    }
}

export function AppointmentsTable({
    appointments,
    className,
    onView,
    onEdit,
    onDelete,
}: Readonly<AppointmentsTableProps>) {
    if (appointments.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/50",
                    className
                )}
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <CalendarOff className="h-5 w-5 text-neutral-400" aria-hidden />
                </div>
                <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No appointments found</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        Try a different search, clear the status filter, or add a new appointment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full overflow-x-auto", className)}>
            <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Appt no</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Type</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Doctor</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Date</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Location</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Status</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((row) => (
                        <tr
                            key={row.id}
                            className="group border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50/70 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                        >
                            <td className="px-4 py-4">
                                <span className="font-mono text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    {row.appointmentNo}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-[13px] text-neutral-500 dark:text-neutral-400">
                                {row.appointmentType}
                            </td>
                            <td className="px-4 py-4">
                                <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                                    {row.doctorName}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
                                {formatDisplayDate(row.date)}
                            </td>
                            <td className="px-4 py-4 text-[13px] text-neutral-500 dark:text-neutral-400">
                                {row.hospitalLocation}
                            </td>
                            <td className="px-4 py-4">
                                <AppointmentStatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex justify-end gap-0.5">
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                                        aria-label="View appointment"
                                        onClick={() => onView?.(row)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                                        aria-label="Edit appointment"
                                        onClick={() => onEdit?.(row)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                        aria-label="Delete appointment"
                                        onClick={() => onDelete?.(row)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
