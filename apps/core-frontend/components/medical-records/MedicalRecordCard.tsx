"use client";

import { format } from "date-fns";
import {
  FileText,
  ImageIcon,
  Pencil,
  Trash2,
  Download,
  Lock,
  FlaskConical,
  Pill,
  Syringe,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicalRecord } from "@/types/medicalRecords";
import { cn } from "@/lib/utils";

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onEdit: (record: MedicalRecord) => void;
  onDelete: (record: MedicalRecord) => void;
}

function DocumentIcon({ type }: { type: MedicalRecord["documentType"] }) {
  const cls = "h-5 w-5";
  switch (type) {
    case "Lab Report": return <FlaskConical className={cls} />;
    case "Prescription": return <Pill className={cls} />;
    case "X-Ray": return <ImageIcon className={cls} />;
    case "Vaccination": return <Syringe className={cls} />;
    default: return <ClipboardList className={cls} />;
  }
}

function docTypeBadgeColor(type: MedicalRecord["documentType"]) {
  switch (type) {
    case "Lab Report": return "bg-blue-50 text-blue-700 border-blue-200";
    case "Prescription": return "bg-green-50 text-green-700 border-green-200";
    case "X-Ray": return "bg-purple-50 text-purple-700 border-purple-200";
    case "Vaccination": return "bg-orange-50 text-orange-700 border-orange-200";
    case "Discharge Summary": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MedicalRecordCard({ record, onEdit, onDelete }: MedicalRecordCardProps) {
  const isSystem = record.source === "system";
  const isImage = record.fileType.startsWith("image/");

  return (
    <div
      className={cn(
        "relative flex gap-4 rounded-xl border bg-card px-5 py-4 shadow-xs transition-shadow hover:shadow-md",
        isSystem ? "border-border" : "border-border"
      )}
    >
      {/* Left: icon column */}
      <div className="shrink-0 flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            docTypeBadgeColor(record.documentType)
          )}
        >
          <DocumentIcon type={record.documentType} />
        </div>
        {/* Vertical connector line — purely decorative for the timeline feel */}
        <div className="mt-2 w-px flex-1 bg-border min-h-[8px]" />
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* Document type badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                docTypeBadgeColor(record.documentType)
              )}
            >
              {record.documentType}
            </span>

            {/* System badge */}
            {isSystem && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-muted-foreground/30 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                System
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={record.fileUrl}
              download={record.fileName}
              target="_blank"
              rel="noreferrer"
              title="Download"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </a>

            {!isSystem && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Edit"
                  onClick={() => onEdit(record)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
                  onClick={() => onDelete(record)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Doctor & Hospital */}
        <p className="text-sm font-medium text-foreground truncate">
          {record.doctorName}
          {record.hospitalName && (
            <span className="font-normal text-muted-foreground">
              {" · "}
              {record.hospitalName}
            </span>
          )}
        </p>

        {/* Description */}
        {record.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{record.description}</p>
        )}

        {/* File chip + date */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1">
            {isImage ? (
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              {record.fileName}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatBytes(record.fileSize)})
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            {format(new Date(record.dateOfRecord), "dd MMM yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
