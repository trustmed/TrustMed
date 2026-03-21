"use client";

import { useState } from "react";
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

export default function AppointmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [appointments] = useState(() => [...SEED_APPOINTMENTS]);

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [formMode, setFormMode] = useState<AppointmentFormMode>("add");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
        void values;
        setFormDialogOpen(false);
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
                onSubmit={handleFormSubmit}
            />

            <AppointmentDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                appointmentNo={activeAppointment?.appointmentNo}
                onConfirm={async () => {
                    setDeleteDialogOpen(false);
                }}
            />
        </div>
    );
}
