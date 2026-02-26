"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import { allergySchema, medicationSchema } from "@/lib/schemas/profile";

// Extend schemas to carry the DB id for existing records
const allergyWithIdSchema = allergySchema.extend({ id: z.string().optional() });
const medicationWithIdSchema = medicationSchema.extend({ id: z.string().optional() });

type AllergyWithId = z.infer<typeof allergyWithIdSchema>;
type MedicationWithId = z.infer<typeof medicationWithIdSchema>;

const formSchema = z.object({
    allergies: z.array(allergyWithIdSchema).optional(),
    medications: z.array(medicationWithIdSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MedicalHistoryFormProps {
    onSave: (data: { allergies: AllergyWithId[]; medications: MedicationWithId[] }) => Promise<void>;
    initialData?: FormValues;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function MedicalHistoryForm({ onSave, initialData, onDirtyChange }: MedicalHistoryFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || { allergies: [], medications: [] },
    });

    const { isDirty } = form.formState;
    useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

    useEffect(() => {
        if (initialData) form.reset(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const {
        fields: allergyFields,
        append: appendAllergy,
        remove: removeAllergy,
    } = useFieldArray({ control: form.control, name: "allergies" });

    const {
        fields: medicationFields,
        append: appendMedication,
        remove: removeMedication,
    } = useFieldArray({ control: form.control, name: "medications" });

    async function onSubmit(data: FormValues) {
        await onSave({
            allergies: data.allergies ?? [],
            medications: data.medications ?? [],
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* ── Allergies ─────────────────────────────────────── */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Allergies</h3>
                    {allergyFields.map((field, index) => (
                        <Card key={field.id}>
                            <CardContent className="pt-6 relative">
                                <div className="absolute top-4 right-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAllergy(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`allergies.${index}.allergenName`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Allergen Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Peanuts, Penicillin..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`allergies.${index}.severity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Severity</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select severity" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {["Mild", "Moderate", "Severe"].map((s) => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`allergies.${index}.reaction`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>Reaction</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Hives, Anaphylaxis..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendAllergy({ allergenName: "", severity: "Mild", reaction: "" })}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Allergy
                    </Button>
                </div>

                {/* ── Medications ───────────────────────────────────── */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Medications</h3>
                    {medicationFields.map((field, index) => (
                        <Card key={field.id}>
                            <CardContent className="pt-6 relative">
                                <div className="absolute top-4 right-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeMedication(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`medications.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Medication Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Lisinopril" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`medications.${index}.dosage`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dosage</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="10mg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`medications.${index}.frequency`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Frequency</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Once Daily" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            appendMedication({ name: "", dosage: "", frequency: "", isActive: true })
                        }
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                    </Button>
                </div>

                {/* Hidden submit — triggered by the global Save Changes button in the page */}
                <button type="submit" id="profile-form-submit" className="hidden" aria-hidden />
            </form>
        </Form>
    );
}
