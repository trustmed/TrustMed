"use client";

import * as React from "react";

import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";

export default function AppointmentsPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground">Upcoming Appointments</h1>
        </div>
      </div>

      <AppointmentsToolbar searchValue={search} onSearchChange={setSearch} />

      {/* Table will be added in next commits */}
      <div className="h-[560px] w-full rounded-xl border border-border bg-muted/20" />
    </div>
  );
}

