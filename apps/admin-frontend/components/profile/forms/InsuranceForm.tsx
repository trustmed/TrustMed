"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { insuranceSchema, InsuranceValues } from "@/lib/schemas/profile";

interface InsuranceFormProps {
    onSave: (data: InsuranceValues) => Promise<void>;
    initialData?: Partial<InsuranceValues>;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function InsuranceForm({ onSave, initialData, onDirtyChange }: InsuranceFormProps) {
    const form = useForm<InsuranceValues>({
        resolver: zodResolver(insuranceSchema),
        defaultValues: {
            provider: initialData?.provider ?? "",
            policyNumber: initialData?.policyNumber ?? "",
            groupNumber: initialData?.groupNumber ?? "",
        },
    });

    const { isDirty } = form.formState;
    useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

    useEffect(() => {
        if (initialData) {
            form.reset({
                provider: initialData.provider ?? "",
                policyNumber: initialData.policyNumber ?? "",
                groupNumber: initialData.groupNumber ?? "",
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    async function onSubmit(data: InsuranceValues) {
        await onSave(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. BlueCross BlueShield" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="policyNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Policy Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. XYZ123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="groupNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Group Number (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. GRP-00123" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Hidden submit — triggered by the global Save Changes button in the page */}
                <button type="submit" id="profile-form-submit" className="hidden" aria-hidden />
            </form>
        </Form>
    );
}
