import * as z from "zod";

export const DOCUMENT_TYPES = [
  "Lab Report",
  "Prescription",
  "X-Ray",
  "Discharge Summary",
  "Vaccination",
  "Other",
] as const;

export const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const medicalRecordSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, {
    required_error: "Document type is required",
  }),
  dateOfRecord: z.string().min(1, "Date of record is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  hospitalName: z.string().min(1, "Hospital / clinic name is required"),
  description: z.string().optional(),
  file: z
    .custom<File>((val) => val instanceof File, "File is required")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File must be 5 MB or smaller")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only PDF, JPG, and PNG files are accepted"
    )
    .optional(),
});

export const uploadMedicalRecordSchema = medicalRecordSchema.extend({
  file: z
    .custom<File>((val) => val instanceof File, "File is required")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File must be 5 MB or smaller")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only PDF, JPG, and PNG files are accepted"
    ),
});

export type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;
export type UploadMedicalRecordFormValues = z.infer<typeof uploadMedicalRecordSchema>;