"use client";

import { Upload, Search, FolderOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadRecordModal } from "@/components/medical-records/upload-record-modal";
import { EditRecordModal } from "@/components/medical-records/edit-record-modal";
import { DeleteRecordModal } from "@/components/medical-records/delete-record-modal";
import { ViewRecordModal } from "@/components/medical-records/view-record-modal";
import { RecordCard } from "@/components/medical-records/record-card";
import { AcceptRequestModal } from "@/components/medical-records/accept-request-modal";
import { RecordCategory, CATEGORY_LABELS } from "@/types/medical-records";
import useMedicalRecords from "./hooks/useMedicalRecords";

export default function MedicalRecordsPage() {
  const {
    handleUpload,
    handleView,
    handleEdit,
    handleDelete,
    handleDownload,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    modal,
    setModal,
    selectedRecord,
    setSelectedRecord,
    toasts,
    records,
    filtered,
    refetchConsentRequests,
    refetchRecords,
    showToast,
  } = useMedicalRecords();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Medical Records
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {records.length} record{records.length !== 1 ? "s" : ""} stored
            securely
          </p>
        </div>
        <Button onClick={() => setModal("upload")} className="gap-2 shrink-0">
          <Upload className="h-4 w-4" /> Upload Record
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterCategory}
          onValueChange={(v) => setFilterCategory(v as RecordCategory | "all")}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2 text-neutral-400" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(
              Object.entries(CATEGORY_LABELS) as [RecordCategory, string][]
            ).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records list */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
            {filtered.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onView={handleView}
                onEdit={(r) => {
                  setSelectedRecord(r);
                  setModal("edit");
                }}
                onDelete={(r) => {
                  setSelectedRecord(r);
                  setModal("delete");
                }}
                onDownload={handleDownload}
                onAcceptRequest={() => {
                  setSelectedRecord(record);
                  setModal("accept_request");
                }}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <FolderOpen className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {search || filterCategory !== "all"
              ? "No records match your search"
              : "No records yet"}
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            {search || filterCategory !== "all"
              ? "Try adjusting your filters"
              : "Upload your first medical record to get started"}
          </p>
          {!search && filterCategory === "all" && (
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => setModal("upload")}
            >
              <Upload className="h-4 w-4" /> Upload Record
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <UploadRecordModal
        open={modal === "upload"}
        onClose={() => setModal(null)}
        onUpload={handleUpload}
      />
      <ViewRecordModal
        record={selectedRecord}
        open={modal === "view"}
        onClose={() => {
          setModal(null);
          setSelectedRecord(null);
        }}
      />
      <EditRecordModal
        record={selectedRecord}
        open={modal === "edit"}
        onClose={() => {
          setModal(null);
          setSelectedRecord(null);
        }}
        onSave={handleEdit}
      />
      <DeleteRecordModal
        record={selectedRecord}
        open={modal === "delete"}
        onClose={() => {
          setModal(null);
          setSelectedRecord(null);
        }}
        onDelete={handleDelete}
      />
      {modal === "accept_request" && selectedRecord && (
        <AcceptRequestModal
          record={selectedRecord}
          pendingRequest={selectedRecord.requestStatus?.id ? {
            id: selectedRecord.requestStatus.id,
            status: 'PENDING' as never,
          } as never : undefined}
          open={true}
          onClose={() => {
            setModal(null);
            setSelectedRecord(null);
          }}
          onSuccess={() => {
            setModal(null);
            refetchConsentRequests();
            refetchRecords();
            showToast("Request responded successfully", "success");
          }}
        />
      )}
    </div>
  );
}
