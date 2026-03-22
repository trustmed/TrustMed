"use client";

import { Upload, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UploadRecordModal } from "@/components/medical-records/upload-record-modal";
import { EditRecordModal } from "@/components/medical-records/edit-record-modal";
import { DeleteRecordModal } from "@/components/medical-records/delete-record-modal";
import { RecordCard } from "@/components/medical-records/record-card";
import { RecordCategory, CATEGORY_LABELS } from "@/types/medical-records";
import useMedicalRecords from "./hooks/useMedicalRecords";

export default function MedicalRecordsPage() {
  const {
    handleUpload,
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
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <Input
            placeholder="Search records, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          />
        </div>
        
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-none gap-2 items-center flex-1">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
              filterCategory === "all"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            )}
          >
            All <span className="hidden sm:inline">Records</span>
          </button>
          
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 shrink-0" />
          
          {(Object.entries(CATEGORY_LABELS) as [RecordCategory, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterCategory(val)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors border flex items-center gap-1.5",
                filterCategory === val
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              {filterCategory === val && (
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-500/40">
                  <span className="text-[8px] font-bold text-indigo-700 dark:text-indigo-200">✓</span>
                </span>
              )}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Records list (Hybrid Table List) */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          
          {/* Table Header */}
          <div className="hidden md:flex md:items-center px-4 pb-2 pt-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800/80">
            <div className="w-[35%] pr-4 uppercase">Record Name</div>
            <div className="w-[20%] pr-4 uppercase">Category</div>
            <div className="w-[20%] pr-4 uppercase">Doctor / Hospital</div>
            <div className="w-[15%] pr-4 text-right uppercase">Date Added</div>
            <div className="w-10"></div>
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={(r) => {
                  setSelectedRecord(r);
                  setModal("edit");
                }}
                onDelete={(r) => {
                  setSelectedRecord(r);
                  setModal("delete");
                }}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900/20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <FolderOpen className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {search || filterCategory !== "all"
              ? "No records found"
              : "No medical records"}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm">
            {search || filterCategory !== "all"
              ? "We couldn't find any records matching your current filters. Try adjusting your search term or category."
              : "Upload your first medical record to get started with building your secure health history."}
          </p>
          {search || filterCategory !== "all" ? (
            <Button
              variant="ghost"
              className="mt-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              onClick={() => { setSearch(""); setFilterCategory("all"); }}
            >
              Clear all filters
            </Button>
          ) : (
            <Button
              variant="outline"
              className="mt-6 gap-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
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
    </div>
  );
}
