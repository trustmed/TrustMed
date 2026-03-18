"use client";

import * as React from "react";

import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { DUMMY_APPOINTMENTS } from "@/components/appointments/appointments-data";
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from "@/components/appointments/AppointmentFormDialog";

export default function AppointmentsPage() {
  const [search, setSearch] = React.useState("");
  const [appointments] = React.useState(DUMMY_APPOINTMENTS);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");
  const [formValues, setFormValues] = React.useState<AppointmentFormValues>({
    appointmentNo: "",
    patientName: "Kate Wanigaratne",
    date: "",
    address: "",
    phoneNumber: "",
    email: "",
    doctor: "",
    appointmentType: "",
  });

  const handleAddClick = () => {
    setFormMode("add");
    setFormValues((prev) => ({
      ...prev,
      appointmentNo: "",
      date: "",
    }));
    setIsFormOpen(true);
  };

  const handleEditClick = (appointment: (typeof appointments)[number]) => {
    setFormMode("edit");
    setFormValues({
      appointmentNo: appointment.appointmentNo,
      patientName: "Kate Wanigaratne",
      date: appointment.date,
      address: "",
      phoneNumber: "",
      email: "",
      doctor: appointment.doctorName,
      appointmentType: appointment.appointmentType,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: AppointmentFormValues) => {
    // In this commit we only close the dialog; data wiring comes later.
    setFormValues(values);
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground">Upcoming Appointments</h1>
        </div>
      </div>

      <AppointmentsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={handleAddClick}
      />

      <AppointmentsTable appointments={appointments} onEditClick={handleEditClick} />

      <AppointmentFormDialog
        open={isFormOpen}
        mode={formMode}
        values={formValues}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

