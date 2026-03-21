"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
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
import {
    AppointmentsToolbar,
    type AppointmentStatusFilter,
} from "@/components/appointments/AppointmentsToolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PATIENT_ID = "0054";
const PATIENT_NAME = "Kate Wanigaratne";

const FORM_SUBMIT_DELAY_MS = 600;
const DELETE_DELAY_MS = 600;
const PAGE_SIZE = 10;
const INITIAL_TABLE_LOAD_MS = 320;

function appointmentSearchBlob(a: Appointment): string {
    let displayDate = a.date;
    try {
        displayDate = format(new Date(`${a.date}T12:00:00`), "yyyy/MM/dd");
    } catch {
        /* keep raw */
    }
    return [
        a.appointmentNo,
        a.appointmentType,
        a.doctorName,
        a.date,
        displayDate,
        a.hospitalLocation,
        a.status,
        a.phone,
        a.email,
        a.address,
    ]
        .join(" ")
        .toLowerCase();
}

function matchesAppointmentSearch(a: Appointment, query: string): boolean {
    const t = query.trim().toLowerCase();
    if (!t) return true;
    return appointmentSearchBlob(a).includes(t);
}

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
    const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>("all");
    const [page, setPage] = useState(1);
    const [tableReady, setTableReady] = useState(false);
    const [appointments, setAppointments] = useState(() => [...SEED_APPOINTMENTS]);

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [formMode, setFormMode] = useState<AppointmentFormMode>("add");
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        const id = window.setTimeout(() => setTableReady(true), INITIAL_TABLE_LOAD_MS);
        return () => window.clearTimeout(id);
    }, []);

    const filteredAppointments = useMemo(
        () =>
            appointments.filter(
                (a) =>
                    (statusFilter === "all" || a.status === statusFilter) &&
                    matchesAppointmentSearch(a, searchQuery)
            ),
        [appointments, statusFilter, searchQuery]
    );

    const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        setPage((p) => Math.min(p, totalPages));
    }, [totalPages]);

    const start = (page - 1) * PAGE_SIZE;
    const pageSlice = filteredAppointments.slice(start, start + PAGE_SIZE);
    const rangeEnd = filteredAppointments.length === 0 ? 0 : Math.min(start + pageSlice.length, filteredAppointments.length);

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
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                    />
                    {!tableReady ? (
                        <div
                            className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-md border border-border bg-muted/15"
                            role="status"
                            aria-live="polite"
                            aria-busy="true"
                        >
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
                            <p className="text-sm text-muted-foreground">Loading appointments…</p>
                        </div>
                    ) : (
                        <>
                            <AppointmentsTable
                                appointments={pageSlice}
                                onView={openView}
                                onEdit={openEdit}
                                onDelete={openDelete}
                            />
                            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {filteredAppointments.length === 0
                                        ? "Showing 0 of 0"
                                        : `Showing ${start + 1}–${rangeEnd} of ${filteredAppointments.length}`}
                                    {filteredAppointments.length > 0 && (
                                        <span className="text-muted-foreground/80">
                                            {" "}
                                            · Page {page} of {totalPages}
                                        </span>
                                    )}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="min-w-[88px]"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="min-w-[88px]"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
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
