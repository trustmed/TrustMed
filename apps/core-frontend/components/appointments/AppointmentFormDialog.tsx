"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export type AppointmentFormValues = {
  appointmentNo: string;
  patientName: string;
  date: string;
  address: string;
  phoneNumber: string;
  email: string;
  doctor: string;
  appointmentType: string;
};

type AppointmentFormDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  values: AppointmentFormValues;
  onClose?: () => void;
  onSubmit?: (values: AppointmentFormValues) => void;
};

export function AppointmentFormDialog({
  open,
  mode,
  values,
  onClose,
  onSubmit,
}: AppointmentFormDialogProps) {
  const [form, setForm] = React.useState(values);

  React.useEffect(() => {
    setForm(values);
  }, [values]);

  const handleChange = (field: keyof AppointmentFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  const title = mode === "add" ? "Add Appointment" : "Edit Appointment";

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center px-4",
          )}
        >
          <div className="w-full max-w-3xl rounded-3xl bg-background shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Dialog.Title className="text-lg font-semibold text-foreground">
                    {title}
                  </Dialog.Title>
                  <p className="text-sm text-muted-foreground">
                    {form.patientName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted px-4 py-2 text-sm font-semibold">
                    {form.appointmentNo || "—"}
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date">
                  <Input
                    type="date"
                    value={form.date}
                    onChange={handleChange("date")}
                  />
                </Field>
                <Field label="Address">
                  <Input
                    placeholder="Enter Address"
                    value={form.address}
                    onChange={handleChange("address")}
                  />
                </Field>
                <Field label="Phone Number">
                  <Input
                    placeholder="Enter Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="Enter Email"
                    value={form.email}
                    onChange={handleChange("email")}
                  />
                </Field>
                <Field label="Doctor">
                  <Input
                    placeholder="Enter Doctor Name"
                    value={form.doctor}
                    onChange={handleChange("doctor")}
                  />
                </Field>
                <Field label="Appointment Type">
                  <Input
                    placeholder="Enter Appointment Type"
                    value={form.appointmentType}
                    onChange={handleChange("appointmentType")}
                  />
                </Field>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl px-6"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-destructive px-8 text-destructive-foreground hover:bg-destructive/90"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

