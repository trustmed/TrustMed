"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/components/appointments/appointments-data";

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const { label, variant, className } = getStatusStyle(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

function getStatusStyle(status: AppointmentStatus) {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        variant: "secondary" as const,
        className: "border-0 bg-emerald-100 text-emerald-800",
      };
    case "pending":
      return {
        label: "Pending",
        variant: "secondary" as const,
        className: "border-0 bg-amber-100 text-amber-800",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive" as const,
        className: "border-0 bg-rose-100 text-rose-800",
      };
    default:
      return {
        label: status,
        variant: "outline" as const,
        className: "",
      };
  }
}

