"use client";
import { Send, Trash2, Eye, EyeOff, FileText, KeyRound, Share2, Copy, Plus, ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MedicalRecordsTable } from "@/components/medical-records/MedicalRecordsTable";
import { getAuthUser } from "@/utils/auth";
import { CATEGORY_LABELS, type RecordCategory } from "@/types/medical-records";
import { useMedicalRecordControllerGetAllByAuthUserId } from "@/services/api/medical-records/medical-records";
import {
  SharedRecordsApi,
  type SharedRecordItem,
  type SharedLinkMedicalRecordItem,
} from "@/lib/api/sharedRecords";
import { Button } from "@/components/ui/button";
import { Dialog as ModalDialog, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogTitle as ModalTitle, DialogFooter as ModalFooter } from "@/components/ui/dialog";
// ActionButton with tooltip on hover
function ActionButton({ onClick, title, children }: { onClick?: () => void; title: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick?.();
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {children}
      </button>
      {show && (
        <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-neutral-900 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none">
          {title}
        </div>
      )}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  deactivated: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  expired: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function SharedRecordRow({
  record,
  onShare,
  onView,
  onManage,
  onDelete,
  availableMedicalRecords,
  onRecordsAdded,
}: {
  record: SharedRecordItem;
  onShare: (id: string) => void;
  onView: (id: string) => void;
  onManage: (id: string) => void;
  onDelete: (id: string) => void;
  availableMedicalRecords: Array<{ id: string; fileOriginalName: string; recordType: string; date: string }>;
  onRecordsAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<SharedLinkMedicalRecordItem[]>([]);
  const [hiddenRecordIds, setHiddenRecordIds] = useState<Set<string>>(new Set());
  const [showAddRecordsDialog, setShowAddRecordsDialog] = useState(false);
  const [selectedRecordsToAdd, setSelectedRecordsToAdd] = useState<string[]>([]);
  const [isAddingRecords, setIsAddingRecords] = useState(false);
  const [isDeletingRecordIds, setIsDeletingRecordIds] = useState<Set<string>>(new Set());
  const hasLoadedRef = useRef(false);

  const toggleEndUserVisibility = (recordId: string) => {
    setHiddenRecordIds((previous) => {
      const updated = new Set(previous);
      if (updated.has(recordId)) {
        updated.delete(recordId);
      } else {
        updated.add(recordId);
      }
      return updated;
    });
  };

  const loadSharedLinkMedicalRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await SharedRecordsApi.getSharedLinkRecords(record.id);
      setMedicalRecords(response.sharedRecord.medicalRecords);
      hasLoadedRef.current = true;
    } catch {
      setError("Unable to load selected medical records right now.");
    } finally {
      setLoading(false);
    }
  }, [record.id]);

  const handleOpenAddRecordsDialog = async () => {
    setShowAddRecordsDialog(true);
    setSelectedRecordsToAdd([]);

    if (!hasLoadedRef.current) {
      await loadSharedLinkMedicalRecords();
    }
  };

  const handleAddRecords = async () => {
    if (selectedRecordsToAdd.length === 0) {
      return;
    }

    try {
      setIsAddingRecords(true);
      await SharedRecordsApi.addRecordsToSharedLink(record.id, {
        medicalRecordIds: selectedRecordsToAdd,
      });
      setShowAddRecordsDialog(false);
      setSelectedRecordsToAdd([]);
      // Reload the records
      hasLoadedRef.current = false;
      const response = await SharedRecordsApi.getSharedLinkRecords(record.id);
      setMedicalRecords(response.sharedRecord.medicalRecords);
      onRecordsAdded?.();
    } catch {
      setError("Unable to add records right now.");
    } finally {
      setIsAddingRecords(false);
    }
  };

  const filteredAvailableRecords = useMemo(() => {
    const addedRecordIds = new Set(medicalRecords.map((entry) => entry.id));
    return availableMedicalRecords.filter((entry) => !addedRecordIds.has(entry.id));
  }, [availableMedicalRecords, medicalRecords]);

  const removeExpandedRecord = async (recordId: string) => {
    try {
      setIsDeletingRecordIds((previous) => new Set(previous).add(recordId));
      await SharedRecordsApi.deleteRecordFromSharedLink(record.id, recordId);
      setMedicalRecords((previous) =>
        previous.filter((entry) => entry.id !== recordId),
      );
      setHiddenRecordIds((previous) => {
        if (!previous.has(recordId)) return previous;
        const updated = new Set(previous);
        updated.delete(recordId);
        return updated;
      });
      onRecordsAdded?.();
    } catch {
      setError("Unable to remove record from shared link right now.");
    } finally {
      setIsDeletingRecordIds((previous) => {
        const updated = new Set(previous);
        updated.delete(recordId);
        return updated;
      });
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadSelectedRecords = async () => {
      if (!open || hasLoadedRef.current) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await loadSharedLinkMedicalRecords();
      } catch {
        if (!cancelled) {
          setError("Unable to load selected medical records right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSelectedRecords();

    return () => {
      cancelled = true;
    };
  }, [loadSharedLinkMedicalRecords, open, record.id]);

  return (
    <div
      className={cn(
        "border rounded-xl bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-200",
        open
          ? "border-blue-200 dark:border-blue-900 shadow-[0_0_0_3px_rgba(219,234,254,0.5)] dark:shadow-[0_0_0_3px_rgba(30,58,138,0.2)]"
          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm",
      )}
    >
      <div className="flex items-stretch gap-3 px-5 py-4">
        <div className="flex flex-1 items-center gap-4 min-w-0 text-left">
          <div
            className={cn(
              "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
              record.status === "active"
                ? "bg-emerald-50 dark:bg-emerald-900/20"
                : record.status === "deactivated"
                ? "bg-yellow-50 dark:bg-yellow-900/20"
                : "bg-red-50 dark:bg-red-900/20",
              open && "scale-105",
            )}
          >
            <Send
              className={cn(
                "h-5 w-5",
                record.status === "active"
                  ? "text-emerald-500 dark:text-emerald-400"
                  : record.status === "deactivated"
                  ? "text-yellow-500 dark:text-yellow-400"
                  : "text-red-500 dark:text-red-400",
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {record.recipient}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              Sent on {record.date}
            </p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold capitalize mt-1",
                statusStyles[record.status],
              )}
            >
              {record.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ActionButton title="Share" onClick={() => onShare(record.id)}>
            <Share2 className="h-5 w-5" />
          </ActionButton>
          <ActionButton title="View" onClick={() => onView(record.id)}>
            <Eye className="h-5 w-5" />
          </ActionButton>
          <ActionButton title="Manage Access" onClick={() => onManage(record.id)}>
            <KeyRound className="h-5 w-5" />
          </ActionButton>
          <ActionButton title="Add Record" onClick={() => void handleOpenAddRecordsDialog()}>
            <Plus className="h-5 w-5" />
          </ActionButton>
          <ActionButton title="Delete" onClick={() => onDelete(record.id)}>
            <Trash2 className="h-5 w-5" />
          </ActionButton>
          <ActionButton title={open ? "Collapse" : "Expand"} onClick={() => setOpen((value) => !value)}>
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </ActionButton>
        </div>
      </div>

      {open && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 pb-5">
          <div className="pt-4">
            {loading ? (
              <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 px-4 py-8">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Loading selected medical records...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-4 py-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                No medical records were attached to this shared link.
              </div>
            ) : (
              <div className="grid gap-3">
                {medicalRecords.map((item) => (
                  (() => {
                    const isHiddenForUser = hiddenRecordIds.has(item.id);
                    return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-3",
                      isHiddenForUser
                        ? "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/10"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.fileOriginalName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {item.recordType}
                      </p>
                      {isHiddenForUser && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                          Hidden from end user
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="uppercase tracking-wide text-[10px] text-neutral-400">
                          Date
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          {item.date}
                        </p>
                      </div>
                      <ActionButton
                        title={isHiddenForUser ? "Show to user" : "Hide from user"}
                        onClick={() => toggleEndUserVisibility(item.id)}
                      >
                        {isHiddenForUser ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </ActionButton>
                      <ActionButton
                        title="View"
                        onClick={() =>
                          window.open(
                            `/medical-records/${item.id}/view`,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <FileText className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton
                        title="Delete record"
                        onClick={() => {
                          if (!isDeletingRecordIds.has(item.id)) {
                            void removeExpandedRecord(item.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ModalDialog open={showAddRecordsDialog} onOpenChange={setShowAddRecordsDialog}>
        <ModalContent className="w-[95vw] max-w-md">
          <ModalHeader>
            <ModalTitle>Add Medical Records</ModalTitle>
          </ModalHeader>
          {loading ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
              Loading records...
            </p>
          ) : filteredAvailableRecords.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
              No additional records available to add.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAvailableRecords.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRecordsToAdd.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecordsToAdd((prev) => [...prev, item.id]);
                      } else {
                        setSelectedRecordsToAdd((prev) =>
                          prev.filter((id) => id !== item.id)
                        );
                      }
                    }}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {item.fileOriginalName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.recordType}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {item.date}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddRecordsDialog(false);
                setSelectedRecordsToAdd([]);
              }}
              disabled={isAddingRecords}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRecords}
              disabled={selectedRecordsToAdd.length === 0 || isAddingRecords}
            >
              {isAddingRecords ? "Adding..." : "Add Records"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalDialog>
    </div>
  );
}

export default function ShareRecordPage() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [records, setRecords] = useState<SharedRecordItem[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [manageId, setManageId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isDeletingSharedLink, setIsDeletingSharedLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [modalState, setModalState] = useState({
    validity: 24, // hours
    active: true,
    pinEnabled: false,
    pin: "",
  });
  const authUser = getAuthUser();
  const authUserId = authUser?.sub ?? "";
  const { data: medicalRecordsData } = useMedicalRecordControllerGetAllByAuthUserId(authUserId, {
    query: {
      enabled: !!authUserId,
    },
  });
  const medicalRecords = useMemo(
    () =>
      (medicalRecordsData?.records ?? []).map((record) => ({
        id: record.id,
        fileOriginalName: record.fileName || "-",
        patientName: authUser?.firstName || authUser?.email?.split("@")[0] || "You",
        recordType: CATEGORY_LABELS[(record.category as RecordCategory) ?? "other" as RecordCategory] ?? record.category,
        date: record.recordDate || record.createdAt?.slice(0, 10) || "-",
        doctor: record.doctorName || "-",
      })),
    [authUser?.email, authUser?.firstName, medicalRecordsData?.records],
  );

  // Generate a dummy share link for the record
  const getShareLink = (id: string) => `https://trustmed.app/share/${id}`;

  const handleCopy = (link: string) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeletingSharedLink(true);
      await SharedRecordsApi.deleteSharedLink(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
    } catch {
      setRecordsError("Unable to delete shared link right now.");
    } finally {
      setIsDeletingSharedLink(false);
    }
  };

  const handleOpenManage = (id: string) => {
    // Optionally, load real values for the record here
    setManageId(id);
    setModalState({ validity: 24, active: true, pinEnabled: false, pin: "" });
  };

  const handleSaveManage = () => {
    // Optionally, update the record in state here
    setManageId(null);
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoadingRecords(true);
        setRecordsError(null);
        const response = await SharedRecordsApi.getMySharedRecords();
        setRecords(response.sharedRecords);
      } catch {
        setRecordsError("Unable to load records right now.");
      } finally {
        setIsLoadingRecords(false);
      }
    };

    void fetchRecords();
  }, [refreshToken]);

  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [sendDrName, setSendDrName] = useState("Dr. Name");
  const handleSelectRecord = (id: string, checked: boolean) => {
    setSelectedRecordIds((prev) =>
      checked ? [...prev, id] : prev.filter((rid) => rid !== id)
    );
  };
  const handleSendRecords = async () => {
    if (selectedRecordIds.length === 0) {
      return;
    }

    try {
      await SharedRecordsApi.sendSharedRecords({
        recipientName: sendDrName.trim(),
        medicalRecordIds: selectedRecordIds,
      });

      setShowSendModal(false);
      setSelectedRecordIds([]);
      setSendDrName("Dr. Name");
      setRefreshToken((prev) => prev + 1);
    } catch {
      setRecordsError("Unable to send records right now.");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-neutral-950 w-full">
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="w-[95vw] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Medical Record to Send</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="dr-name">Add Name</label>
            <Input id="dr-name" value={sendDrName} onChange={e => setSendDrName(e.target.value)} />
          </div>
          <MedicalRecordsTable
            records={medicalRecords}
            selectedIds={selectedRecordIds}
            onSelect={handleSelectRecord}
          />
          <DialogFooter className="pt-4">
            <button
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition-colors"
              disabled={selectedRecordIds.length === 0 || !sendDrName.trim()}
              onClick={handleSendRecords}
              type="button"
            >
              Send
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto max-w-6xl py-10 md:py-12 px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">Share Medical Record</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">List of all sent records and their status.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition-colors mt-2"
            onClick={() => setShowSendModal(true)}
            type="button"
            title="Send Record"
          >
            <Send className="h-5 w-5" />
            Send Record
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {recordsError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Failed to load records
              </h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs">{recordsError}</p>
            </div>
          ) : isLoadingRecords ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Loading records...
              </h3>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="mb-4 h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Send className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                No records found
              </h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                Your sent records will appear here once you share them.
              </p>
            </div>
          ) : (
            records.map((record) => (
              <SharedRecordRow
                key={record.id}
                record={record}
                onShare={setShareId}
                onView={setViewId}
                onManage={handleOpenManage}
                onDelete={setDeleteId}
                availableMedicalRecords={medicalRecords}
                onRecordsAdded={() => setRefreshToken((prev) => prev + 1)}
              />
            ))
          )}
        </div>
        {shareId !== null && (() => {
          const link = getShareLink(shareId);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Share Record Link</p>
                <div className="w-full flex flex-col gap-4 mb-6 items-center">
                  <div className="w-full flex items-center gap-2">
                    <input
                      ref={linkInputRef}
                      type="text"
                      value={link}
                      readOnly
                      className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm"
                    />
                    <button
                      className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      onClick={() => handleCopy(link)}
                      title="Copy link"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  {copied && <span className="text-green-600 text-xs">Copied!</span>}
                  <img src={"/QR.jpg"} alt="QR Code" className="mx-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white" width={160} height={160} />
                </div>
                <button
                  className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setShareId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
        {viewId !== null && (() => {
          const rec = records.find((r) => r.id === viewId);
          if (!rec) {
            return null;
          }
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Record Details</p>
                <div className="w-full flex flex-col gap-3 mb-6">
                  <div>
                    <span className="block text-xs text-neutral-400 mb-0.5">Recipient</span>
                    <span className="block text-base font-medium text-neutral-900 dark:text-neutral-100">{rec.recipient}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-400 mb-0.5">Date Sent</span>
                    <span className="block text-base font-medium text-neutral-900 dark:text-neutral-100">{rec.date}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-400 mb-0.5">Status</span>
                    <span className={cn("inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold capitalize", statusStyles[rec.status])}>{rec.status}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-400 mb-0.5">Validity (hours)</span>
                    <span className="block text-base font-medium text-neutral-900 dark:text-neutral-100">24</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-400 mb-0.5">Active</span>
                    <span className="block text-base font-medium text-neutral-900 dark:text-neutral-100">Yes</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-400 mb-0.5">PIN Enabled</span>
                    <span className="block text-base font-medium text-neutral-900 dark:text-neutral-100">No</span>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setViewId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
        {manageId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Manage Access</p>
              <div className="w-full flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Validity (hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={modalState.validity}
                    onChange={e => setModalState(s => ({ ...s, validity: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
                  <input
                    type="checkbox"
                    checked={modalState.active}
                    onChange={e => setModalState(s => ({ ...s, active: e.target.checked }))}
                    className="h-5 w-5 accent-indigo-600"
                  />
                  <span className="text-xs text-neutral-500">(Uncheck to deactivate link)</span>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                    <input
                      type="checkbox"
                      checked={modalState.pinEnabled}
                      onChange={e => setModalState(s => ({ ...s, pinEnabled: e.target.checked }))}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    Enable PIN
                  </label>
                  {modalState.pinEnabled && (
                    <input
                      type="text"
                      value={modalState.pin}
                      onChange={e => setModalState(s => ({ ...s, pin: e.target.value }))}
                      placeholder="Enter PIN"
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-3 w-full justify-center">
                <button
                  className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setManageId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                  onClick={handleSaveManage}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Record?</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center">Are you sure you want to delete this record? This action cannot be undone.</p>
              <div className="flex gap-3 w-full justify-center">
                <button
                  className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  onClick={() => void handleDelete(deleteId)}
                  disabled={isDeletingSharedLink}
                >
                  {isDeletingSharedLink ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
