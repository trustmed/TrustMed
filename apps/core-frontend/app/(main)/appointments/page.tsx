"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SEED_APPOINTMENTS } from "@/lib/appointments/seed-data";
import type { Appointment } from "@/lib/appointments/types";
import { AppointmentDeleteDialog } from "@/components/appointments/AppointmentDeleteDialog";
import {
    AppointmentFormDialog,
    type AppointmentFormMode,
    type AppointmentFormValues,
} from "@/components/appointments/AppointmentFormDialog";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import { Card, CardContent } from "@/components/ui/card";

const PATIENT_ID = "0054";
const PATIENT_NAME = "Kate Wanigaratne";

const FORM_SUBMIT_DELAY_MS = 600;
const DELETE_DELAY_MS = 600;

function nextAppointmentKeys(appointments: Appointment[]): { id: string; appointmentNo: string } {
    let maxId = 0;
    let maxNo = 0;
    for (const a of appointments) {
        const idNum = Number.parseInt(a.id, 10);
        if (!Number.isNaN(idNum) && idNum > maxId) maxId = idNum;
        const match = /^D(\d+)$/i.exec(a.appointmentNo.trim());
        if (match) {
            const n = Number.parseInt(match[1], 10);
            if (!Number.isNaN(n) && n > maxNo) maxNo = n;
        }
    }
    const next = Math.max(maxId, maxNo) + 1;
    return {
        id: String(next),
        appointmentNo: `D${String(next).padStart(3, "0")}`,
    };
}

export default function AppointmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [appointments, setAppointments] = useState(() => [...SEED_APPOINTMENTS]);

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [formMode, setFormMode] = useState<AppointmentFormMode>("add");
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

    const openAdd = () => {
        setFormMode("add");
        setActiveAppointment(null);
        setFormDialogOpen(true);
    };

    const openView = (a: Appointment) => {
        setFormMode("view");
        setActiveAppointment(a);
        setFormDialogOpen(true);
    };

    const openEdit = (a: Appointment) => {
        setFormMode("edit");
        setActiveAppointment(a);
        setFormDialogOpen(true);
    };

    const openDelete = (a: Appointment) => {
        setActiveAppointment(a);
        setDeleteDialogOpen(true);
    };

    const handleFormSubmit = async (values: AppointmentFormValues) => {
        if (formMode === "add") {
            setFormSubmitLoading(true);
            try {
                await new Promise((r) => setTimeout(r, FORM_SUBMIT_DELAY_MS));
                setAppointments((prev) => {
                    const keys = nextAppointmentKeys(prev);
                    const row: Appointment = {
                        ...keys,
                        appointmentType: values.appointmentType,
                        doctorName: values.doctor.trim(),
                        date: values.date,
                        hospitalLocation: "Colombo",
                        status: "pending",
                        address: values.address.trim(),
                        phone: values.phone.trim(),
                        email: values.email.trim(),
                    };
                    return [...prev, row];
                });
                toast.success("Appointment added");
                setFormDialogOpen(false);
            } finally {
                setFormSubmitLoading(false);
            }
            return;
        }

        if (formMode === "edit") {
            if (!activeAppointment) {
                toast.error("No appointment selected");
                return;
            }
            setFormSubmitLoading(true);
            try {
                await new Promise((r) => setTimeout(r, FORM_SUBMIT_DELAY_MS));
                const targetId = activeAppointment.id;
                setAppointments((prev) =>
                    prev.map((a) =>
                        a.id === targetId
                            ? {
                                  ...a,
                                  appointmentType: values.appointmentType,
                                  doctorName: values.doctor.trim(),
                                  date: values.date,
                                  address: values.address.trim(),
                                  phone: values.phone.trim(),
                                  email: values.email.trim(),
                              }
                            : a
                    )
                );
                toast.success("Appointment updated");
                setFormDialogOpen(false);
            } finally {
                setFormSubmitLoading(false);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!activeAppointment) {
            toast.error("No appointment selected");
            return;
        }
        const targetId = activeAppointment.id;
        setDeleteLoading(true);
        try {
            await new Promise((r) => setTimeout(r, DELETE_DELAY_MS));
            setAppointments((prev) => prev.filter((a) => a.id !== targetId));
            toast.success("Appointment removed");
            setDeleteDialogOpen(false);
            setActiveAppointment(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl py-6 md:py-8 flex flex-col gap-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upcoming Appointments</h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    View and manage your scheduled medical visits.
                </p>
            </div>

            <Card className="border-border/80 shadow-sm">
                <CardContent className="p-4 md:p-6 flex flex-col gap-6">
                    <AppointmentsToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onAddClick={openAdd}
                    />
                    <AppointmentsTable
                        appointments={appointments}
                        onView={openView}
                        onEdit={openEdit}
                        onDelete={openDelete}
                    />
                </CardContent>
            </Card>

            <AppointmentFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                mode={formMode}
                patientId={PATIENT_ID}
                patientName={PATIENT_NAME}
                appointment={activeAppointment}
                loading={formSubmitLoading}
                onSubmit={handleFormSubmit}
            />

            <AppointmentDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    if (!open && deleteLoading) return;
                    setDeleteDialogOpen(open);
                }}
                appointmentNo={activeAppointment?.appointmentNo}
                loading={deleteLoading}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
