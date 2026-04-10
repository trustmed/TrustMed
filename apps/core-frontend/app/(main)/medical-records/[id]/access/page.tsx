"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Search, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedicalRecordControllerGetById } from "@/services/api/medical-records/medical-records";
import { getAuthUser } from "@/utils/auth";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/medical-records";
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

export default function RequestersPage({
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
    }
  );

  const goBack = () => {
    router.push("/medical-records");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
        <p className="mt-4 text-sm text-neutral-500">Loading access history...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500">
          <XCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Could not load record
        </h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm">
          The record you are looking for might have been deleted or you don&apos;t have permission to view it.
        </p>
        <Button onClick={goBack} variant="outline" className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Records
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Header and Nav */}
      <div className="flex items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 -ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Access History
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-none truncate" title={record.fileName}>
            Showing who has requested or accessed <span className="font-medium text-neutral-700 dark:text-neutral-300">{record.fileName}</span>
          </p>
        </div>
      </div>

      {/* Record Summary */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row gap-5 md:items-center">
        <div className={cn("hidden md:flex h-14 w-14 rounded-lg items-center justify-center shrink-0", CATEGORY_COLORS[record.category as keyof typeof CATEGORY_COLORS] || 'bg-neutral-100 text-neutral-600')}>
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

      {/* Requests List */}
      <div>
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
          Requests & Activity
        </h2>
        
        {(!record.requests || record.requests.length === 0) ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              No access requests yet
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              This record has not been requested by any doctor or hospital yet. When someone requests access via the hospital portal, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {record.requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(request => {
              const isAccepted = request.status === 'ACCEPTED';
              const isPending = request.status === 'PENDING';
              const isRejected = request.status === 'REJECTED';
              
              return (
                <div key={request.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/20">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {request.createdBy.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        {request.createdBy}
                        
                        {/* Status Badge inline for mobile mostly */}
                        <span className={cn(
                          "sm:hidden text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide",
                          isAccepted && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          isPending && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          isRejected && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {request.status}
                        </span>
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Requested on {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge Desktop */}
                  <div className="hidden sm:flex items-center justify-end shrink-0 w-32">
                     <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border",
                        isAccepted && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800/30",
                        isPending && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30",
                        isRejected && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30"
                      )}>
                        {isAccepted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {isPending && <Clock className="h-3.5 w-3.5" />}
                        {isRejected && <XCircle className="h-3.5 w-3.5" />}
                        {request.status}
                      </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
