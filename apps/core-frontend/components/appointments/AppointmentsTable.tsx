"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { Appointment } from "@/components/appointments/appointments-data";
import { AppointmentStatusBadge } from "@/components/appointments/AppointmentStatusBadge";

type AppointmentsTableProps = {
  appointments: Appointment[];
};

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const hasRows = appointments.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <HeaderCell>Appointment No</HeaderCell>
              <HeaderCell>Appointment Type</HeaderCell>
              <HeaderCell>Doctor&apos;s Name</HeaderCell>
              <HeaderCell>Date</HeaderCell>
              <HeaderCell>Hospital Location</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell className="text-right">Action</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {hasRows ? (
              appointments.map((appt) => (
                <tr
                  key={appt.id}
                  className="border-t border-border text-sm hover:bg-muted/40"
                >
                  <BodyCell className="font-semibold">{appt.appointmentNo}</BodyCell>
                  <BodyCell>{appt.appointmentType}</BodyCell>
                  <BodyCell>{appt.doctorName}</BodyCell>
                  <BodyCell>{appt.date}</BodyCell>
                  <BodyCell>{appt.hospitalLocation}</BodyCell>
                  <BodyCell>
                    <AppointmentStatusBadge status={appt.status} />
                  </BodyCell>
                  <BodyCell className="text-right text-xs text-muted-foreground">
                    {/* Actions will be added in later commits */}
                    Actions
                  </BodyCell>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

function BodyCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 align-middle whitespace-nowrap", className)}>
      {children}
    </td>
  );
}

