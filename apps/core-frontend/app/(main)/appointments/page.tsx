"use client";

import { useState } from "react";
import { SEED_APPOINTMENTS } from "@/lib/appointments/seed-data";
import type { Appointment } from "@/lib/appointments/types";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { AppointmentsToolbar } from "@/components/appointments/AppointmentsToolbar";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AppointmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [appointments] = useState(() => [...SEED_APPOINTMENTS]);

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

    const openAdd = () => {
        setActiveAppointment(null);
        setFormDialogOpen(true);
    };

    const openView = (a: Appointment) => {
        setActiveAppointment(a);
        setFormDialogOpen(true);
    };

    const openEdit = (a: Appointment) => {
        setActiveAppointment(a);
        setFormDialogOpen(true);
    };

    const openDelete = (a: Appointment) => {
        setActiveAppointment(a);
        setDeleteDialogOpen(true);
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

            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {activeAppointment ? "Appointment" : "Add appointment"} (placeholder)
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete appointment (placeholder)</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dialog wiring only — content arrives in a later step.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
