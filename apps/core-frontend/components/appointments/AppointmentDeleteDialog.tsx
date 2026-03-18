"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type AppointmentDeleteDialogProps = {
  open: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  appointmentLabel?: string;
};

export function AppointmentDeleteDialog({
  open,
  onCancel,
  onConfirm,
  appointmentLabel,
}: AppointmentDeleteDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onCancel?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-background shadow-2xl">
            <div className="p-6 md:p-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                      <Trash2 className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <Dialog.Title className="text-3xl font-semibold tracking-tight text-foreground">
                      Delete item
                    </Dialog.Title>
                    <Dialog.Description className="mt-3 text-lg text-muted-foreground">
                      {appointmentLabel
                        ? `Are you sure you want to delete appointment ${appointmentLabel}?`
                        : "Are you sure you want to delete this item?"}
                    </Dialog.Description>
                  </div>
                </div>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-[220px] rounded-2xl text-lg font-semibold"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-14 w-[220px] rounded-2xl bg-destructive text-lg font-semibold text-destructive-foreground hover:bg-destructive/90"
                  onClick={onConfirm}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

