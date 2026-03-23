"use client";
import { Send, Trash2, Eye, KeyRound, Share2, Copy } from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MedicalRecordsTable } from "@/components/medical-records/MedicalRecordsTable";
// ActionButton with tooltip on hover
function ActionButton({ onClick, title, children }: { onClick?: () => void; title: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onClick}
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

const initialRecords = [
  { id: 1, recipient: "Dr. John Doe", date: "2026-03-20", status: "active" },
  { id: 2, recipient: "Dr. Jane Smith", date: "2026-02-15", status: "expired" },
  { id: 3, recipient: "Dr. Alice Brown", date: "2026-03-01", status: "deactive" },
  { id: 4, recipient: "Dr. Bob Lee", date: "2026-03-10", status: "active" },
];

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  deactive: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  expired: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ShareRecordPage() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [records, setRecords] = useState(initialRecords);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [manageId, setManageId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [shareId, setShareId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [modalState, setModalState] = useState({
    validity: 24, // hours
    active: true,
    pinEnabled: false,
    pin: "",
  });

  // Generate a dummy share link for the record
  const getShareLink = (id: number) => `https://trustmed.app/share/${id}`;

  const handleCopy = (link: string) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleDelete = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  const handleOpenManage = (id: number) => {
    // Optionally, load real values for the record here
    setManageId(id);
    setModalState({ validity: 24, active: true, pinEnabled: false, pin: "" });
  };

  const handleSaveManage = () => {
    // Optionally, update the record in state here
    setManageId(null);
  };

  let viewModal = null;
  if (viewId !== null) {
    const rec = records.find(r => r.id === viewId);
    if (rec) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      viewModal = (
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
              {/* Manage Access Details (dummy for now) */}
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
    }
  }

  // Dummy medical records data
  const medicalRecords = [
    { id: 1, patientName: "John Doe", recordType: "Lab Report", date: "2026-03-01", doctor: "Dr. Smith" },
    { id: 2, patientName: "Jane Smith", recordType: "Prescription", date: "2026-02-20", doctor: "Dr. Brown" },
    { id: 3, patientName: "Alice Brown", recordType: "Imaging", date: "2026-01-15", doctor: "Dr. Lee" },
    { id: 4, patientName: "Bob Lee", recordType: "Discharge Summary", date: "2025-12-10", doctor: "Dr. Green" },
  ];
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const [sendDrName, setSendDrName] = useState("Dr. Name");
  const handleSelectRecord = (id: number, checked: boolean) => {
    setSelectedRecordIds((prev) =>
      checked ? [...prev, id] : prev.filter((rid) => rid !== id)
    );
  };
  const handleSendRecords = () => {
    const toAdd = medicalRecords.filter(r => selectedRecordIds.includes(r.id)).map(() => ({
      id: Math.max(...records.map(rec => rec.id), 0) + 1 + Math.floor(Math.random()*10000),
      recipient: sendDrName,
      date: new Date().toISOString().slice(0, 10),
      status: "active"
    }));
    setRecords(prev => [...prev, ...toAdd]);
    setShowSendModal(false);
    setSelectedRecordIds([]);
    setSendDrName("Dr. Name");
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-neutral-950 w-full">
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent>
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
      <div className="container mx-auto max-w-3xl py-10 md:py-12 px-4 sm:px-6 flex flex-col gap-8">
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
          {records.length === 0 ? (
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
              <div
                key={record.id}
                className={cn(
                  "border rounded-xl bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm flex items-center gap-4 px-5 py-4",
                  statusStyles[record.status]
                )}
              >
                <div className={cn(
                  "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                  record.status === "active"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : record.status === "deactive"
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                )}>
                  <Send className={cn(
                    "h-5 w-5",
                    record.status === "active"
                      ? "text-emerald-500 dark:text-emerald-400"
                      : record.status === "deactive"
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {record.recipient}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    Sent on {record.date}
                  </p>
                  <span className={cn(
                    "inline-flex shrink-0 items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold capitalize mt-1",
                    statusStyles[record.status]
                  )}>
                    {record.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <ActionButton title="Share" onClick={() => setShareId(record.id)}>
                    <Share2 className="h-5 w-5" />
                  </ActionButton>
                          {/* Share Modal */}
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
                  <ActionButton title="View" onClick={() => setViewId(record.id)}>
                    <Eye className="h-5 w-5" />
                  </ActionButton>
                  <ActionButton title="Manage Access" onClick={() => handleOpenManage(record.id)}>
                    <KeyRound className="h-5 w-5" />
                  </ActionButton>
                  <ActionButton title="Delete" onClick={() => setDeleteId(record.id)}>
                    <Trash2 className="h-5 w-5" />
                  </ActionButton>
                </div>
                              {/* View Details Modal */}
                              {(() => {
                                let viewModal = null;
                                if (viewId !== null) {
                                  const rec = records.find(r => r.id === viewId);
                                  if (rec) {
                                    viewModal = (
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
                                            {/* Manage Access Details (dummy for now) */}
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
                                  }
                                }
                                return viewModal;
                              })()}
                      {/* Manage Access Modal */}
                      {manageId !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
                            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Manage Access</p>
                            <div className="w-full flex flex-col gap-4 mb-6">
                              {/* Validity Time */}
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
                              {/* Active/Deactive Toggle */}
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
                              {/* Enable PIN */}
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
              </div>
            ))
          )}
        </div>
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
                  onClick={() => handleDelete(deleteId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
