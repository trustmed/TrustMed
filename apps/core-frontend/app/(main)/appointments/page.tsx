"use client";

import * as React from "react";

import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { type Appointment } from "@/components/appointments/appointments-data";
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from "@/components/appointments/AppointmentFormDialog";
import { AppointmentDeleteDialog } from "@/components/appointments/AppointmentDeleteDialog";
import { AppointmentsApi } from "@/lib/api/appointments";

export default function AppointmentsPage() {
  const [search, setSearch] = React.useState("");
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");
  const [editingId, setEditingId] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await AppointmentsApi.list();
        if (!cancelled) {
          setAppointments(data);
        }
      } catch (error) {
        console.error("Failed to load appointments", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddClick = () => {
    setFormMode("add");
    setEditingId(null);
    setFormValues((prev) => ({
      ...prev,
      appointmentNo: "",
      date: "",
    }));
    setIsFormOpen(true);
  };

  const handleEditClick = (appointment: (typeof appointments)[number]) => {
    setFormMode("edit");
    setEditingId(appointment.id);
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
    (async () => {
      try {
        if (formMode === "add") {
          const created = await AppointmentsApi.create({
            appointmentNo: values.appointmentNo,
            patientName: values.patientName,
            date: values.date,
            address: values.address,
            phoneNumber: values.phoneNumber,
            email: values.email,
            doctor: values.doctor,
            appointmentType: values.appointmentType,
            hospitalLocation: values.address,
          });
          setAppointments((prev) => [created, ...prev]);
        } else if (formMode === "edit" && editingId) {
          const updated = await AppointmentsApi.update(editingId, {
            appointmentNo: values.appointmentNo,
            patientName: values.patientName,
            date: values.date,
            address: values.address,
            phoneNumber: values.phoneNumber,
            email: values.email,
            doctor: values.doctor,
            appointmentType: values.appointmentType,
            hospitalLocation: values.address,
          });
          setAppointments((prev) =>
            prev.map((appt) => (appt.id === updated.id ? updated : appt))
          );
        }
      } catch (error) {
        console.error("Failed to save appointment", error);
      }
    })();
    setFormValues(values);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredAppointments = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((appt) => {
      const haystack = [
        appt.appointmentNo,
        appt.appointmentType,
        appt.doctorName,
        appt.date,
        appt.hospitalLocation,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [appointments, search]);

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
        appointments={filteredAppointments}
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
          if (pendingDelete) {
            (async () => {
              try {
                await AppointmentsApi.remove(pendingDelete.id);
                setAppointments((prev) =>
                  prev.filter((appt) => appt.id !== pendingDelete.id)
                );
              } catch (error) {
                console.error("Failed to delete appointment", error);
              }
            })();
          }
          setIsDeleteOpen(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

