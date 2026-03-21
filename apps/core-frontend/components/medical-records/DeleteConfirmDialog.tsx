"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  recordName?: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  recordName,
  deleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm bg-card rounded-xl shadow-2xl border border-border p-6 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mx-auto">
          <Trash2 className="h-6 w-6 text-destructive" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-foreground">Delete Record?</h3>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete
            {recordName ? (
              <> &ldquo;<span className="font-medium text-foreground">{recordName}</span>&rdquo;</>
            ) : (
              " this record"
            )}
            ? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Yes, Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
