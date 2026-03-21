"use client";

import { useState } from "react";
import { Upload, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dummy components to replace missing imports
const MedicalRecordCard = ({ record, onEdit, onDelete }: any) => (
  <div className="border p-3 rounded flex justify-between items-center">
    <div>
      <p className="font-semibold">{record.documentType}</p>
      <p className="text-sm text-muted-foreground">{record.dateOfRecord}</p>
    </div>
    <div className="flex gap-2">
      <Button size="sm" onClick={() => onEdit(record)}>Edit</Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(record)}>Delete</Button>
    </div>
  </div>
);

const MedicalRecordModal = ({ open, onClose, onSave, existingRecord }: any) => {
  if (!open) return null;
  const handleSave = () => {
    onSave(existingRecord || { id: Date.now().toString(), documentType: "Dummy Record", dateOfRecord: "2026-03-21" });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-5 rounded">
        <h3>{existingRecord ? "Edit Record" : "Upload Record"}</h3>
        <Button className="mt-3" onClick={handleSave}>Save</Button>
        <Button variant="outline" className="mt-1" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};

const DeleteConfirmDialog = ({ open, onConfirm, onCancel, deleting }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-5 rounded">
        <p>Are you sure you want to delete this record?</p>
        <div className="flex gap-2 mt-3">
          <Button onClick={onConfirm} disabled={deleting}>{deleting ? "Deleting..." : "Yes"}</Button>
          <Button variant="outline" onClick={onCancel}>No</Button>
        </div>
      </div>
    </div>
  );
};

// Dummy toast
const useToast = () => {
  const [toasts, setToasts] = useState<string[]>([]);
  const addToast = (msg: string) => setToasts((prev) => [...prev, msg]);
  const removeToast = (index: number) => setToasts((prev) => prev.filter((_, i) => i !== index));
  return { toasts, addToast, removeToast };
};
const ToastRenderer = ({ toasts, onRemove }: any) => (
  <div className="fixed top-5 right-5 flex flex-col gap-2">
    {toasts.map((t: string, i: number) => (
      <div key={i} className="bg-gray-800 text-white p-2 rounded flex justify-between">
        {t} <button onClick={() => onRemove(i)}>x</button>
      </div>
    ))}
  </div>
);

// Dummy data
const DUMMY_RECORDS = [
  { id: "1", documentType: "Blood Test", dateOfRecord: "2026-03-21" },
  { id: "2", documentType: "X-Ray", dateOfRecord: "2026-02-15" },
];

export function MedicalRecordsSection() {
  const [records, setRecords] = useState(DUMMY_RECORDS);
  const [loading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteRecord, setDeleteRecord] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleUpload = (data: any) => {
    setRecords((prev) => [data, ...prev]);
    addToast("Record added successfully.");
  };

  const handleEdit = (data: any) => {
    setRecords((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    addToast("Record updated successfully.");
  };

  const handleDeleteConfirm = () => {
    if (!deleteRecord) return;
    setDeleting(true);
    setTimeout(() => { // simulate delay
      setRecords((prev) => prev.filter((r) => r.id !== deleteRecord.id));
      addToast("Record deleted.");
      setDeleting(false);
      setDeleteRecord(null);
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">My Documents</h3>
          <p className="text-sm text-muted-foreground">Upload and manage your personal medical records.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Record
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No medical records yet.</p>
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
            Upload your first record
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onEdit={setEditRecord}
              onDelete={setDeleteRecord}
            />
          ))}
        </div>
      )}

      <MedicalRecordModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleUpload}
      />
      <MedicalRecordModal
        open={Boolean(editRecord)}
        onClose={() => setEditRecord(null)}
        onSave={handleEdit}
        existingRecord={editRecord ?? undefined}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteRecord)}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteRecord(null)}
        deleting={deleting}
      />
      <ToastRenderer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}