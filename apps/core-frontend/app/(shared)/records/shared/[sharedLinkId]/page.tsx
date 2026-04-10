"use client";

import { use, useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, Eye, FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SharedRecordsApi,
  type SharedLinkMedicalRecordItem,
  type SharedLinkWithMedicalRecords,
} from "@/lib/api/sharedRecords";
import { cn } from "@/lib/utils";

function printBlobUrl(blobUrl: string, onDone?: () => void) {
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
      onDone?.();
      window.setTimeout(() => frame.remove(), 1000);
    }
  };

  frame.src = blobUrl;
}

export default function SharedMedicalRecordsPage({
  params,
}: {
  params: Promise<{ sharedLinkId: string }>;
}) {
  const { sharedLinkId } = use(params);

  const [sharedRecord, setSharedRecord] = useState<SharedLinkWithMedicalRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState("");
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSharedRecord = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await SharedRecordsApi.getPublicSharedLinkRecords(sharedLinkId);
        if (!isMounted) return;

        setSharedRecord(response.sharedRecord);
        setSelectedRecordId(response.sharedRecord.medicalRecords[0]?.id ?? null);
      } catch {
        if (!isMounted) return;
        setError("Unable to load shared medical records. This link may be invalid or inactive.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSharedRecord();

    return () => {
      isMounted = false;
    };
  }, [sharedLinkId]);

  const selectedRecord = useMemo(
    () =>
      sharedRecord?.medicalRecords.find((item) => item.id === selectedRecordId) ??
      null,
    [sharedRecord?.medicalRecords, selectedRecordId],
  );

  useEffect(() => {
    let objectUrl = "";
    let revoked = false;

    const loadPreview = async () => {
      if (!selectedRecordId) {
        setPreviewBlobUrl("");
        setPreviewMimeType("");
        setPreviewError(null);
        return;
      }

      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const url = `${SharedRecordsApi.getPublicRecordViewUrl(sharedLinkId, selectedRecordId)}?t=${Date.now()}`;
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
          throw new Error("Unable to load preview");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!revoked) {
          setPreviewBlobUrl(objectUrl);
          setPreviewMimeType(blob.type || "");
        }
      } catch {
        if (!revoked) {
          setPreviewBlobUrl("");
          setPreviewMimeType("");
          setPreviewError("Failed to load preview. You can still download the file.");
        }
      } finally {
        if (!revoked) {
          setPreviewLoading(false);
        }
      }
    };

    void loadPreview();

    return () => {
      revoked = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedRecordId, sharedLinkId]);

  const handleDownload = async (recordId: string) => {
    setDownloadingId(recordId);
    try {
      await SharedRecordsApi.downloadPublicSharedRecord(sharedLinkId, recordId);
    } finally {
      setDownloadingId((current) => (current === recordId ? null : current));
    }
  };

  const handlePrint = async (record: SharedLinkMedicalRecordItem) => {
    setPrintingId(record.id);

    try {
      const response = await fetch(
        `${SharedRecordsApi.getPublicRecordViewUrl(sharedLinkId, record.id)}?t=${Date.now()}`,
        { method: "GET" },
      );

      if (!response.ok) {
        throw new Error("Failed to load record for printing");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      printBlobUrl(blobUrl, () => {
        URL.revokeObjectURL(blobUrl);
        setPrintingId((current) => (current === record.id ? null : current));
      });
    } catch {
      setPrintingId((current) => (current === record.id ? null : current));
    }
  };

  const handleDownloadAll = async () => {
    if (!sharedRecord || sharedRecord.medicalRecords.length === 0) return;

    setDownloadingAll(true);
    try {
      await SharedRecordsApi.downloadAllPublicSharedRecords(
        sharedLinkId,
        sharedRecord.medicalRecords,
      );
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading shared medical records...</span>
        </div>
      </div>
    );
  }

  if (error || !sharedRecord) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-5 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
          <h2 className="mt-3 text-base font-semibold text-red-700 dark:text-red-300">
            Unable to open shared link
          </h2>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Shared Medical Records
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Recipient: {sharedRecord.recipient} · Shared on {sharedRecord.date}
          </p>
        </div>
        <Button
          onClick={handleDownloadAll}
          disabled={downloadingAll || sharedRecord.medicalRecords.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {downloadingAll ? "Downloading all..." : "Download All"}
        </Button>
      </div>

      {sharedRecord.medicalRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          No medical records are attached to this shared link.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
            <div className="flex flex-col gap-2">
              {sharedRecord.medicalRecords.map((record) => {
                const isSelected = record.id === selectedRecordId;
                const isDownloading = downloadingId === record.id;
                const isPrinting = printingId === record.id;

                return (
                  <div
                    key={record.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      isSelected
                        ? "border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950",
                    )}
                  >
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {record.fileOriginalName}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {record.recordType} · {record.date}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="gap-1"
                        onClick={() => setSelectedRecordId(record.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => void handleDownload(record.id)}
                        disabled={isDownloading}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {isDownloading ? "Downloading..." : "Download"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => void handlePrint(record)}
                        disabled={isPrinting}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        {isPrinting ? "Printing..." : "Print"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 min-h-[500px]">
            {selectedRecord && (
              <div className="mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {selectedRecord.fileOriginalName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {selectedRecord.recordType} · {selectedRecord.date}
                </p>
              </div>
            )}

            {previewLoading ? (
              <div className="flex min-h-[420px] items-center justify-center text-neutral-500 dark:text-neutral-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading preview...
              </div>
            ) : previewError ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <AlertCircle className="h-6 w-6 text-amber-500" />
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {previewError}
                </p>
              </div>
            ) : previewBlobUrl ? (
              previewMimeType.startsWith("image/") ? (
                <div className="flex h-[520px] w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  <img
                    src={previewBlobUrl}
                    alt={selectedRecord?.fileOriginalName ?? "Shared record image"}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <iframe
                  title="Shared record preview"
                  src={previewBlobUrl}
                  className="h-[520px] w-full rounded-lg border border-neutral-200 dark:border-neutral-800"
                />
              )
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-neutral-500 dark:text-neutral-400">
                <FileText className="h-8 w-8" />
                <p className="mt-2 text-sm">Select a medical record to preview</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
