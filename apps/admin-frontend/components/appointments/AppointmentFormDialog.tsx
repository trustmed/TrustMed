"use client";

import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { HOSPITAL_LOCATIONS } from "@/lib/appointments/hospital-locations";
import type { Appointment } from "@/lib/appointments/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type AppointmentFormMode = "add" | "edit" | "view";

export interface AppointmentFormValues {
    date: string;
    hospitalLocation: string;
    address: string;
    phone: string;
    email: string;
    doctor: string;
    appointmentType: string;
}

const APPOINTMENT_TYPES = [
    "Psychiatric",
    "Dermatology",
    "Cardiology",
    "General",
    "Orthopedics",
    "Pediatrics",
    "ENT",
    "Neurology",
    "Ophthalmology",
] as const;

function emptyForm(): AppointmentFormValues {
    return {
        date: "",
        hospitalLocation: "",
        address: "",
        phone: "",
        email: "",
        doctor: "",
        appointmentType: "",
    };
}

function appointmentToForm(a: Appointment): AppointmentFormValues {
    return {
        date: a.date,
        hospitalLocation: a.hospitalLocation,
        address: a.address,
        phone: a.phone,
        email: a.email,
        doctor: a.doctorName,
        appointmentType: a.appointmentType,
    };
}

export interface AppointmentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: AppointmentFormMode;
    patientId: string;
    patientName: string;
    appointment?: Appointment | null;
    loading?: boolean;
    onSubmit: (values: AppointmentFormValues) => void | Promise<void>;
}

export function AppointmentFormDialog({
    open,
    onOpenChange,
    mode,
    patientId,
    patientName,
    appointment,
    loading,
    onSubmit,
}: AppointmentFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <AppointmentFormDialogInner
                key={`${open}-${mode}-${appointment?.id ?? "new"}`}
                onOpenChange={onOpenChange}
                mode={mode}
                patientId={patientId}
                patientName={patientName}
                appointment={appointment}
                loading={loading}
                onSubmit={onSubmit}
            />
        </Dialog>
    );
}

type InnerProps = Omit<AppointmentFormDialogProps, "open">;

function AppointmentFormDialogInner({
    onOpenChange,
    mode,
    patientId,
    patientName,
    appointment,
    loading,
    onSubmit,
}: InnerProps) {
    const formId = useId();
    const [values, setValues] = useState<AppointmentFormValues>(() =>
        appointment && mode !== "add" ? appointmentToForm(appointment) : emptyForm()
    );

    const readOnly = mode === "view";
    const title =
        mode === "add" ? "Add appointment" : mode === "edit" ? "Edit appointment" : "View appointment";

    const hospitalLocationOptions = useMemo(() => {
        const known = HOSPITAL_LOCATIONS as readonly string[];
        const current = values.hospitalLocation.trim();
        if (current && !known.includes(current)) {
            return [current, ...known];
        }
        return [...known];
    }, [values.hospitalLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        if (!values.hospitalLocation.trim()) {
            toast.error("Please select a hospital location");
            return;
        }
        await onSubmit(values);
    };

    return (
        <DialogContent
            className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
            showCloseButton={!loading}
        >
            <div className="border-b border-border px-6 pb-4 pt-6">
                <DialogHeader className="gap-3 text-left">
                    <DialogTitle className="text-xl font-semibold tracking-tight">{title}</DialogTitle>
                    <div className="flex flex-col gap-2">
                        <span className="inline-flex w-fit rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {patientId}
                        </span>
                        <p className="text-sm font-medium text-foreground">{patientName}</p>
                    </div>
                </DialogHeader>
            </div>

            <form id={formId} onSubmit={handleSubmit} className="px-6 py-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5">
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-date`}>Date</Label>
                        <Input
                            id={`${formId}-date`}
                            type="date"
                            value={values.date}
                            onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
                            disabled={readOnly || loading}
                            required={!readOnly}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Hospital location</Label>
                        <Select
                            value={values.hospitalLocation || undefined}
                            onValueChange={(v) => setValues((prev) => ({ ...prev, hospitalLocation: v }))}
                            disabled={readOnly || loading}
                        >
                            <SelectTrigger className="h-10 w-full min-w-0 shadow-none">
                                <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                            <SelectContent>
                                {hospitalLocationOptions.map((loc) => (
                                    <SelectItem key={loc} value={loc}>
                                        {loc}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-address`}>Address</Label>
                        <Input
                            id={`${formId}-address`}
                            placeholder="Enter address"
                            value={values.address}
                            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
                            disabled={readOnly || loading}
                            readOnly={readOnly}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-phone`}>Phone number</Label>
                        <Input
                            id={`${formId}-phone`}
                            placeholder="Enter phone number"
                            value={values.phone}
                            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                            disabled={readOnly || loading}
                            readOnly={readOnly}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-email`}>Email</Label>
                        <Input
                            id={`${formId}-email`}
                            type="email"
                            placeholder="Enter email"
                            value={values.email}
                            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                            disabled={readOnly || loading}
                            readOnly={readOnly}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-doctor`}>Doctor</Label>
                        <Input
                            id={`${formId}-doctor`}
                            placeholder="Doctor name"
                            value={values.doctor}
                            onChange={(e) => setValues((v) => ({ ...v, doctor: e.target.value }))}
                            disabled={readOnly || loading}
                            readOnly={readOnly}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Appointment type</Label>
                        <Select
                            value={values.appointmentType || undefined}
                            onValueChange={(v) => setValues((prev) => ({ ...prev, appointmentType: v }))}
                            disabled={readOnly || loading}
                        >
                            <SelectTrigger className="h-10 w-full min-w-0 shadow-none">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {APPOINTMENT_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </form>

            {readOnly ? (
                <DialogFooter className="flex flex-row justify-center border-t border-border px-6 py-5 sm:justify-center">
                    <Button
                        type="button"
                        className="min-w-[120px] rounded-md font-semibold"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            ) : (
                <DialogFooter className="flex flex-col gap-3 border-t border-border px-6 py-5 sm:flex-row sm:justify-center sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="min-w-[120px] rounded-md border-foreground/25 font-semibold"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        disabled={loading}
                        className="min-w-[120px] rounded-md bg-[#c94435] font-semibold text-white hover:bg-[#c94435]/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </DialogFooter>
            )}
        </DialogContent>
    );
}
