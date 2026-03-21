"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  medicalRecordSchema,
  uploadMedicalRecordSchema,
  DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  MedicalRecordFormValues,
} from "@/schemas/medicalRecords";
import { MedicalRecord } from "@/types/medicalRecords";
import { cn } from "@/lib/utils";

interface MedicalRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MedicalRecordFormValues) => Promise<void>;
  /** Pass existing record to pre-fill the form (edit mode) */
  existingRecord?: MedicalRecord;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MedicalRecordModal({
  open,
  onClose,
  onSave,
  existingRecord,
}: MedicalRecordModalProps) {
  const isEditMode = Boolean(existingRecord);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const schema = isEditMode ? medicalRecordSchema : uploadMedicalRecordSchema;

  const form = useForm<MedicalRecordFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      documentType: existingRecord?.documentType ?? undefined,
      dateOfRecord: existingRecord?.dateOfRecord ?? "",
      doctorName: existingRecord?.doctorName ?? "",
      hospitalName: existingRecord?.hospitalName ?? "",
      description: existingRecord?.description ?? "",
      file: undefined,
    },
  });

  // Reset form whenever the modal opens/closes or record changes
  useEffect(() => {
    if (open) {
      form.reset({
        documentType: existingRecord?.documentType ?? undefined,
        dateOfRecord: existingRecord?.dateOfRecord ?? "",
        doctorName: existingRecord?.doctorName ?? "",
        hospitalName: existingRecord?.hospitalName ?? "",
        description: existingRecord?.description ?? "",
        file: undefined,
      });
      setSelectedFile(null);
    }
  }, [open, existingRecord]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileChange(file: File | null) {
    if (!file) return;
    setSelectedFile(file);
    form.setValue("file", file, { shouldValidate: true });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }

  async function onSubmit(data: MedicalRecordFormValues) {
    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const fileError = form.formState.errors.file?.message;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary">
          <h2 className="text-base font-semibold text-white">
            {isEditMode ? "Edit Medical Record" : "Upload Medical Record"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[75vh]">
          <Form {...form}>
            <form
              id="medical-record-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Document Type */}
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Document Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Record */}
              <FormField
                control={form.control}
                name="dateOfRecord"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date of Record <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Doctor Name & Hospital Name side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Doctor Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Malik Perera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hospitalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hospital / Clinic <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="City General Hospital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this record…"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <FormItem>
                <FormLabel>
                  Attachment{!isEditMode && <span className="text-destructive"> *</span>}
                  {isEditMode && (
                    <span className="ml-1 text-xs text-muted-foreground">(leave empty to keep existing)</span>
                  )}
                </FormLabel>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors",
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/40",
                    fileError && "border-destructive"
                  )}
                >
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-primary">Click to upload</span>
                    {" "}or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 5 MB</p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Selected file preview */}
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
                    {selectedFile.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatBytes(selectedFile.size)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        form.setValue("file", undefined as unknown as File);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Existing file indicator (edit mode) */}
                {isEditMode && !selectedFile && existingRecord && (
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate flex-1">
                      {existingRecord.fileName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">current</span>
                  </div>
                )}

                {fileError && (
                  <p className="text-xs text-destructive mt-1">{fileError}</p>
                )}
              </FormItem>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="medical-record-form"
            disabled={saving}
            className="bg-primary text-white hover:bg-primary/90 min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Saving…" : "Uploading…"}
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Upload Record"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
