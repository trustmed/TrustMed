"use client";

import { AppointmentStatusBadge } from "@/components/appointments/AppointmentStatusBadge";
import type { Appointment } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface AppointmentsTableProps {
    appointments: Appointment[];
    className?: string;
}

function formatDisplayDate(isoDate: string) {
    try {
        return format(new Date(`${isoDate}T12:00:00`), "yyyy/MM/dd");
    } catch {
        return isoDate;
    }
}

export function AppointmentsTable({ appointments, className }: AppointmentsTableProps) {
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
                            <td className="px-4 py-3 text-right" />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
