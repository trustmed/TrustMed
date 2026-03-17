import { z } from "zod";

export const coreIdentitySchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    dob: z.date({
        required_error: "Date of birth is required",
    }),
    biologicalSex: z.enum(["Male", "Female", "Intersex"], {
        required_error: "Biological sex is required",
    }),
    bloodType: z.enum(
        ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
        {
            required_error: "Blood type is required",
        }
    ),
    heightCm: z.coerce
        .number()
        .min(0, "Height must be positive")
        .max(300, "Height must be realistic"),
    weightKg: z.coerce
        .number()
        .min(0, "Weight must be positive")
        .max(500, "Weight must be realistic"),
});

export const emergencyContactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    relationship: z.string().min(2, "Relationship is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    isPrimary: z.boolean().default(false),
});

export const allergySchema = z.object({
    allergenName: z.string().min(2, "Allergen name is required"),
    category: z.enum(["Medication", "Food", "Environmental"]).optional(),
    severity: z.enum(["Mild", "Moderate", "Severe"]).optional(),
    reaction: z.string().optional(),
});

export const medicationSchema = z.object({
    name: z.string().min(2, "Medication name is required"),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    purpose: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const insuranceSchema = z.object({
    provider: z.string().min(2, "Insurance provider is required"),
    policyNumber: z.string().min(2, "Policy number is required"),
    groupNumber: z.string().optional(),
});

export const profileSchema = z.object({
    coreIdentity: coreIdentitySchema,
    emergencyContacts: z.array(emergencyContactSchema).optional(),
    allergies: z.array(allergySchema).optional(),
    medications: z.array(medicationSchema).optional(),
    insurance: insuranceSchema.optional(),
});


export type CoreIdentityValues = z.infer<typeof coreIdentitySchema>;
export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>;
export type AllergyValues = z.infer<typeof allergySchema>;
export type MedicationValues = z.infer<typeof medicationSchema>;
export type InsuranceValues = z.infer<typeof insuranceSchema>;
