"use client";

import * as React from "react";

import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { DUMMY_APPOINTMENTS } from "@/components/appointments/appointments-data";

export default function AppointmentsPage() {
  const [search, setSearch] = React.useState("");
  const [appointments] = React.useState(DUMMY_APPOINTMENTS);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground">Upcoming Appointments</h1>
        </div>
      </div>

      <AppointmentsToolbar searchValue={search} onSearchChange={setSearch} />

      <AppointmentsTable appointments={appointments} />
    </div>
  );
}

