"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

import { emergencyContactSchema } from "@/lib/schemas/profile";

// Extend schema to carry the DB id for existing records
const contactWithIdSchema = emergencyContactSchema.extend({
    id: z.string().optional(),
});
type ContactWithId = z.infer<typeof contactWithIdSchema>;

const formSchema = z.object({
    contacts: z.array(contactWithIdSchema),
});
type FormValues = z.infer<typeof formSchema>;

interface EmergencyContactsFormProps {
    onSave: (contacts: ContactWithId[]) => Promise<void>;
    initialData?: ContactWithId[];
    onDirtyChange?: (isDirty: boolean) => void;
}

export function EmergencyContactsForm({
    onSave,
    initialData,
    onDirtyChange,
}: EmergencyContactsFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            contacts: initialData?.length
                ? initialData
                : [{ name: "", relationship: "", phoneNumber: "", isPrimary: true }],
        },
    });

    const { isDirty } = form.formState;

    useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts",
    });

    useEffect(() => {
        form.reset({
            contacts: initialData?.length
                ? initialData
                : [{ name: "", relationship: "", phoneNumber: "", isPrimary: true }],
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    async function onSubmit(data: FormValues) {
        await onSave(data.contacts);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id}>
                            <CardContent className="pt-6 relative">
                                <div className="absolute top-4 right-4">
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`contacts.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Emergency Contact Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`contacts.${index}.relationship`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Relationship</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Parent, Spouse, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`contacts.${index}.phoneNumber`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 234 567 890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`contacts.${index}.isPrimary`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Primary Contact</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        append({ name: "", relationship: "", phoneNumber: "", isPrimary: false })
                    }
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Contact
                </Button>

                {/* Hidden submit — triggered by the global Save Changes button in the page */}
                <button type="submit" id="profile-form-submit" className="hidden" aria-hidden />
            </form>
        </Form>
    );
}
