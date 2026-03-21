"use client";

import { AppointmentStatusBadge } from "@/components/appointments/AppointmentStatusBadge";
import { Button } from "@/components/ui/button";
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
        return format(new Date(`${isoDate}T12:00:00`), "yyyy/MM/dd");
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
}: AppointmentsTableProps) {
    if (appointments.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-6 py-14 text-center",
                    className
                )}
            >
                <CalendarOff className="h-10 w-10 text-muted-foreground" aria-hidden />
                <p className="text-base font-semibold text-foreground">No appointments found</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Try a different search, clear the status filter, or add a new appointment.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("w-full overflow-x-auto rounded-md border border-border", className)}>
            <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/40 text-left">
                        <th className="px-4 py-3 font-semibold text-foreground">Appointment no</th>
                        <th className="px-4 py-3 font-semibold text-foreground">Appointment type</th>
                        <th className="px-4 py-3 font-semibold text-foreground">Doctor&apos;s name</th>
                        <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 font-semibold text-foreground">Hospital location</th>
                        <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                        <th className="px-4 py-3 font-semibold text-foreground text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((row) => (
                        <tr key={row.id} className="border-b border-border/80 last:border-0">
                            <td className="px-4 py-3 font-semibold text-foreground">{row.appointmentNo}</td>
                            <td className="px-4 py-3 text-foreground">{row.appointmentType}</td>
                            <td className="px-4 py-3 text-foreground">{row.doctorName}</td>
                            <td className="px-4 py-3 text-foreground tabular-nums">{formatDisplayDate(row.date)}</td>
                            <td className="px-4 py-3 text-foreground">{row.hospitalLocation}</td>
                            <td className="px-4 py-3">
                                <AppointmentStatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-border"
                                        aria-label="View appointment"
                                        onClick={() => onView?.(row)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-border"
                                        aria-label="Edit appointment"
                                        onClick={() => onEdit?.(row)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-border text-destructive hover:text-destructive"
                                        aria-label="Delete appointment"
                                        onClick={() => onDelete?.(row)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
