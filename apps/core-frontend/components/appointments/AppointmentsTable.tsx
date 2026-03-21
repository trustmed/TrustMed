"use client";

import { cn } from "@/lib/utils";

export interface AppointmentsTableProps {
    className?: string;
}

export function AppointmentsTable({ className }: AppointmentsTableProps) {
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
                <tbody />
            </table>
        </div>
    );
}
