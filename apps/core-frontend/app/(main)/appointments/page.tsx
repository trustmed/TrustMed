"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAppointmentsControllerCreate,
  useAppointmentsControllerEdit,
  useAppointmentsControllerDelete,
  useAppointmentsControllerFindAllByAuthUserId,
} from "@/services/api/appointments/appointments";
import { getAuthUser } from "@/utils/auth";
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

const authUser = typeof window !== "undefined" ? getAuthUser() : null;
const PATIENT_ID = authUser?.sub || "";
const PATIENT_NAME = authUser ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() : "";

const PAGE_SIZE = 10;

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
    const { data: appointmentData, isLoading: tableLoading, refetch: refetchAppointments } = useAppointmentsControllerFindAllByAuthUserId(
        { authUserId: PATIENT_ID },
        { query: { enabled: !!PATIENT_ID } }
    );

    const appointments = useMemo(() => {
        const records = (appointmentData as { records?: Appointment[] })?.records;
        return Array.isArray(records) ? records : [];
    }, [appointmentData]);

    const createMutation = useAppointmentsControllerCreate();
    const editMutation = useAppointmentsControllerEdit();
    const deleteMutation = useAppointmentsControllerDelete();

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [formMode, setFormMode] = useState<AppointmentFormMode>("add");
    const [pendingAppointmentNo, setPendingAppointmentNo] = useState("");
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeAppointment, setActiveAppointment] =
      useState<Appointment | null>(null);

    const tableReady = !tableLoading;


  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (statusFilter === "all" || a.status === statusFilter) &&
          matchesAppointmentSearch(a, searchQuery),
      ),
    [appointments, statusFilter, searchQuery],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / PAGE_SIZE),
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageSlice = filteredAppointments.slice(start, start + PAGE_SIZE);
  const rangeEnd =
    filteredAppointments.length === 0
      ? 0
      : Math.min(start + pageSlice.length, filteredAppointments.length);

  const openAdd = () => {
    const nextKeys = nextAppointmentKeys(appointments);
    setFormMode("add");
    setPendingAppointmentNo(nextKeys.appointmentNo);
    setActiveAppointment(null);
    setFormDialogOpen(true);
  };

  const openView = (a: Appointment) => {
    setFormMode("view");
    setPendingAppointmentNo("");
    setActiveAppointment(a);
    setFormDialogOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setFormMode("edit");
    setPendingAppointmentNo("");
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
            const fallbackNo = nextAppointmentKeys(appointments).appointmentNo;
            const appointmentNo = pendingAppointmentNo || fallbackNo;
                const payload = {
              appointmentNo,
                    date: values.date,
                    doctor: values.doctor.trim(),
                    type: values.appointmentType,
                    location: values.hospitalLocation.trim(),
                    status: "pending" as const,
                    patientId: PATIENT_ID,
                    address: values.address.trim(),
                    phone: values.phone.trim(),
                    email: values.email.trim(),
                };
  
                await createMutation.mutateAsync({ data: payload });
                await refetchAppointments();
                toast.success("Appointment added");
                setFormDialogOpen(false);
            } catch {
                toast.error("Failed to add appointment");
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
                const payload = {
                    id: activeAppointment.id,
                    type: values.appointmentType,
                    doctor: values.doctor.trim(),
                    date: values.date,
                    location: values.hospitalLocation.trim(),
                    address: values.address.trim(),
                    phone: values.phone.trim(),
                    email: values.email.trim(),
                };
                await editMutation.mutateAsync({ data: payload });
                await refetchAppointments();
                toast.success("Appointment updated");
                setFormDialogOpen(false);
            } catch {
                toast.error("Failed to update appointment");
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
      await deleteMutation.mutateAsync({ data: { id: targetId } });
      await refetchAppointments();
      toast.success("Appointment removed");
      setDeleteDialogOpen(false);
      setActiveAppointment(null);
    } catch {
      toast.error("Failed to delete appointment");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 md:py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          View and manage your scheduled medical visits.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <AppointmentsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={openAdd}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {!tableReady ? (
          <div
            className="flex min-h-[320px] flex-col items-center justify-center gap-3"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2
              className="h-6 w-6 animate-spin text-neutral-300"
              aria-hidden
            />
            <p className="text-sm text-neutral-400">Loading appointments…</p>
          </div>
        ) : (
          <>
            <AppointmentsTable
              appointments={pageSlice}
              onView={openView}
              onEdit={openEdit}
              onDelete={openDelete}
            />
            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
              <p className="text-xs text-neutral-400">
                {filteredAppointments.length === 0
                  ? "No results"
                  : `${start + 1}–${rangeEnd} of ${filteredAppointments.length} appointments`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs font-medium text-neutral-500">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AppointmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        appointmentNo={pendingAppointmentNo}
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
