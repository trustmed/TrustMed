"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/config/api-config/axios";
import { config } from "@/config/config";
import {
  useMedicalRecordControllerGetById,
} from "@/services/api/medical-records/medical-records";
import { getAuthUser } from "@/utils/auth";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/medical-records";
import { MedicalRecordsApi } from "@/lib/api/medicalRecords";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function buildViewUrl(recordId: string): string {
  return `/api/medical-records/${recordId}/view`;
}

export default function MedicalRecordViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const recordId = resolvedParams.id;

  const authUser = getAuthUser();
  const authUserId = authUser?.sub || "";

  const { data: record, isLoading, error } = useMedicalRecordControllerGetById(
    authUserId,
    recordId,
    {
      query: { enabled: !!authUserId && !!recordId },
    },
  );

  const previewUrl = useMemo(
    () => (record ? `${config.backendUrl}${buildViewUrl(record.id)}` : ""),
    [record],
  );
  const [blobUrl, setBlobUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const lowerFileName = (record?.fileName || "").toLowerCase();
  const isImage =
    record?.fileType?.startsWith("image/") ||
    [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((ext) =>
      lowerFileName.endsWith(ext),
    );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isPdf =
    record?.fileType === "application/pdf" || lowerFileName.endsWith(".pdf");

  const goBack = () => {
    router.push("/medical-records");
  };

  useEffect(() => {
    let objectUrl = "";

    async function loadRecord() {
      if (!record || !previewUrl) {
        setBlobUrl("");
        setPreviewError("");
        return;
      }

      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await axiosInstance.get<Blob>(previewUrl, {
          responseType: "blob",
          params: { t: Date.now() },
        });

        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      } catch {
        setBlobUrl("");
        setPreviewError("Failed to load record preview");
      } finally {
        setPreviewLoading(false);
      }
    }

    void loadRecord();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [record, previewUrl]);

  const handleDownload = async () => {
    if (!record) return;

    setDownloading(true);
    try {
      await MedicalRecordsApi.downloadRecord(record.id);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!blobUrl) return;

    setPrinting(true);
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.visibility = "hidden";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);

    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } finally {
        setPrinting(false);
        window.setTimeout(() => {
          frame.remove();
        }, 1000);
      }
    };
    frame.src = blobUrl;
  };

  if (!authUserId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 text-amber-500">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Sign in required
        </h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm">
          You need to be signed in to preview this medical record.
        </p>
        <Button onClick={goBack} variant="outline" className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Records
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
        <p className="mt-4 text-sm text-neutral-500">Loading record...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Could not load record
        </h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm">
          The record may have been deleted or you may not have permission to view it.
        </p>
        <Button onClick={goBack} variant="outline" className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Records
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 -ml-2 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Record Viewer
            </h1>
            <p
              className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-[18rem] sm:max-w-xl"
              title={record.fileName}
            >
              {record.fileName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={handleDownload} disabled={downloading} className="gap-2">
            <Download className="h-4 w-4" />
            {downloading ? "Downloading..." : "Download"}
          </Button>
          <Button onClick={handlePrint} disabled={printing || !blobUrl} className="gap-2">
            <Printer className="h-4 w-4" />
            {printing ? "Printing..." : "Print"}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row gap-5 md:items-center">
        <div className={cn("hidden md:flex h-14 w-14 rounded-lg items-center justify-center shrink-0", CATEGORY_COLORS[record.category as keyof typeof CATEGORY_COLORS] || "bg-neutral-100 text-neutral-600")}>
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Category</span>
            <span className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
              {CATEGORY_LABELS[record.category as keyof typeof CATEGORY_LABELS] || record.category}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Source</span>
            <span className="text-sm text-neutral-900 dark:text-neutral-100 font-medium truncate" title={record.doctorName || record.hospitalName || "Unknown"}>
              {record.doctorName || record.hospitalName || "Unknown"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Added On</span>
            <span className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
              {formatDate(record.createdAt)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Size</span>
            <span className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
              {formatBytes(Number(record.fileSize))}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Preview</h2>
              <p className="text-xs text-neutral-500">Open the file directly in the viewer</p>
            </div>
            <span className="text-xs text-neutral-500 truncate max-w-[10rem] sm:max-w-none">{record.fileType || "Unknown type"}</span>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-950 min-h-[70vh] flex items-center justify-center">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3 text-sm text-neutral-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                Loading preview...
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="text-sm text-red-500">{previewError}</p>
              </div>
            ) : isImage ? (
              <img
                src={blobUrl}
                alt={record.fileName}
                className="w-full h-full max-h-[70vh] object-contain bg-neutral-50 dark:bg-neutral-950"
              />
            ) : (
              <iframe
                src={blobUrl}
                title={record.fileName}
                className="w-full h-[70vh] border-0 bg-neutral-50 dark:bg-neutral-950"
              />
            )}
          </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={handleDownload} disabled={downloading} className="gap-2 sm:w-auto w-full">
          <Download className="h-4 w-4" />
          {downloading ? "Downloading..." : "Download file"}
        </Button>
        <Button onClick={handlePrint} disabled={printing || !blobUrl} className="gap-2 sm:w-auto w-full">
          <Printer className="h-4 w-4" />
          {printing ? "Printing..." : "Print file"}
        </Button>
      </div>

    </div>
  );
}