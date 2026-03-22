import Link from "next/link";
import { FolderHeart, FileText } from "lucide-react";
import { CATEGORY_LABELS, type MedicalRecord, type RecordCategory } from "@/types/medical-records";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RecentRecordsProps {
  records: MedicalRecord[];
}

const CATEGORY_ACCENT: Record<string, { bg: string; text: string }> = {
  lab_report: {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  prescription: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  imaging: {
    bg: "bg-violet-500/10 dark:bg-violet-400/10",
    text: "text-violet-600 dark:text-violet-400",
  },
  discharge_summary: {
    bg: "bg-orange-500/10 dark:bg-orange-400/10",
    text: "text-orange-600 dark:text-orange-400",
  },
  vaccination: {
    bg: "bg-teal-500/10 dark:bg-teal-400/10",
    text: "text-teal-600 dark:text-teal-400",
  },
  other: {
    bg: "bg-neutral-200/60 dark:bg-neutral-700/40",
    text: "text-neutral-500 dark:text-neutral-400",
  },
};

export function RecentRecords({ records }: Readonly<RecentRecordsProps>) {
  const recent = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 dark:bg-emerald-400/10">
            <FolderHeart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Recent Medical Records
          </h3>
        </div>
        <Link
          href="/medical-records"
          className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
        >
          View all →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <FileText className="h-5 w-5 text-neutral-400" strokeWidth={2} />
          </div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            No records yet
          </p>
          <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
            Upload your first medical record to see it here
          </p>
        </div>
      ) : (
        <div className="px-3 pb-3">
          <div className="divide-y divide-neutral-100 rounded-xl bg-neutral-50/60 dark:divide-neutral-800 dark:bg-neutral-800/30">
            {recent.map((record) => {
              const accent = CATEGORY_ACCENT[record.category] ?? CATEGORY_ACCENT.other;
              const label =
                CATEGORY_LABELS[record.category as RecordCategory] ?? record.category;
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      accent.bg,
                      accent.text
                    )}
                  >
                    <FileText className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                      {record.fileName}
                    </p>
                    <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
                      {label} · {format(new Date(record.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                  {/* Category pill */}
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      accent.bg,
                      accent.text
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
