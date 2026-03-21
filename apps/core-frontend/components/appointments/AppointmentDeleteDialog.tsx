"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface AppointmentDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointmentNo?: string;
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
}

export function AppointmentDeleteDialog({
    open,
    onOpenChange,
    appointmentNo,
    loading,
    onConfirm,
}: AppointmentDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete appointment</AlertDialogTitle>
                    <AlertDialogDescription className="text-left text-base text-foreground/90">
                        This will remove{" "}
                        <span className="font-semibold text-foreground">
                            {appointmentNo ? `appointment ${appointmentNo}` : "this appointment"}
                        </span>{" "}
                        from your list. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:justify-end">
                    <AlertDialogCancel disabled={loading} className="rounded-md font-semibold">
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        type="button"
                        className="min-w-[120px] rounded-md bg-[#c94435] font-semibold text-white hover:bg-[#c94435]/90"
                        disabled={loading}
                        onClick={() => void onConfirm()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting
                            </>
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
