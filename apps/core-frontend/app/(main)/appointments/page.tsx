"use client";

import * as React from "react";

import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { DUMMY_APPOINTMENTS, type Appointment } from "@/components/appointments/appointments-data";
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from "@/components/appointments/AppointmentFormDialog";
import { AppointmentDeleteDialog } from "@/components/appointments/AppointmentDeleteDialog";

export default function AppointmentsPage() {
  const [search, setSearch] = React.useState("");
  const [appointments, setAppointments] = React.useState<Appointment[]>(DUMMY_APPOINTMENTS);
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

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<(typeof appointments)[number] | null>(null);

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

  const handleDeleteClick = (appointment: (typeof appointments)[number]) => {
    setPendingDelete(appointment);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (values: AppointmentFormValues) => {
    if (formMode === "add") {
      const next: Appointment = {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
        appointmentNo: values.appointmentNo || `D${String(appointments.length + 1).padStart(3, "0")}`,
        appointmentType: values.appointmentType || "General",
        doctorName: values.doctor || "—",
        date: values.date || new Date().toISOString().slice(0, 10),
        hospitalLocation: values.address || "—",
        status: "pending",
      };
      setAppointments((prev) => [next, ...prev]);
    }
    // Edit wiring comes in a later commit.
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

      <AppointmentsTable
        appointments={appointments}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <AppointmentFormDialog
        open={isFormOpen}
        mode={formMode}
        values={formValues}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <AppointmentDeleteDialog
        open={isDeleteOpen}
        appointmentLabel={pendingDelete?.appointmentNo}
        onCancel={() => {
          setIsDeleteOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={() => {
          // Actual deletion of the row will be handled in a later commit.
          setIsDeleteOpen(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

