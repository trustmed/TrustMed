"use client";

import * as React from "react";
import {
  Shield,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Download,
  Trash2,
  Calendar,
  UserCog,
  Eye,
  ShieldAlert,
  Activity,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lock,
  Network,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetHistory } from "@/services/api/medical-history/medical-history";
import type { HistoryEventDto } from "@/services/interfaces";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const EVENT_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  RECORD_UPLOADED: {
    label: "Document Uploaded",
    icon: Upload,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  RECORD_UPDATED: {
    label: "Document Updated",
    icon: FileText,
    color: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  RECORD_DELETED: {
    label: "Document Deleted",
    icon: Trash2,
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  RECORD_DOWNLOADED: {
    label: "Document Downloaded",
    icon: Download,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  RECORD_LISTED: {
    label: "Records Viewed",
    icon: Eye,
    color: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
  },
  RECORD_ACCESS_DENIED: {
    label: "Access Denied",
    icon: ShieldAlert,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  APPOINTMENT_CREATED: {
    label: "Appointment Created",
    icon: Calendar,
    color: "text-sky-500 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
  },
  APPOINTMENT_UPDATED: {
    label: "Appointment Updated",
    icon: Calendar,
    color: "text-sky-500 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
  },
  APPOINTMENT_CANCELLED: {
    label: "Appointment Cancelled",
    icon: Calendar,
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  PROFILE_UPDATED: {
    label: "Profile Updated",
    icon: UserCog,
    color: "text-violet-500 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-900/20",
  },
  ACCESS_REQUEST: {
    label: "Blockchain Request",
    icon: Network,
    color: "text-cyan-500 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  CONSENT_ACCESS_REQUESTED: {
    label: "Access Requested",
    icon: Lock,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  CONSENT_ACCESS_ACCEPTED: {
    label: "Access Approved",
    icon: CheckCircle,
    color: "text-green-500 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  CONSENT_ACCESS_REJECTED: {
    label: "Access Denied",
    icon: ShieldAlert,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
};

function getEventMeta(eventType: string) {
  return (
    EVENT_META[eventType] ?? {
      label: eventType,
      icon: Activity,
      color: "text-neutral-500",
      bgColor: "bg-neutral-50 dark:bg-neutral-800",
    }
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Documents", value: "document" },
  { label: "Appointments", value: "appointment" },
  { label: "Profile", value: "profile" },
  { label: "Blockchain", value: "blockchain" },
] as const;

type FilterValue = (typeof FILTER_TABS)[number]["value"];

function matchesFilter(event: HistoryEventDto, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "blockchain") return event.source === "blockchain";
  if (filter === "document")
    return [
      "RECORD_UPLOADED",
      "RECORD_UPDATED",
      "RECORD_DELETED",
      "RECORD_DOWNLOADED",
      "RECORD_LISTED",
      "RECORD_ACCESS_DENIED",
      "CONSENT_ACCESS_REQUESTED",
      "CONSENT_ACCESS_ACCEPTED",
      "CONSENT_ACCESS_REJECTED",
    ].includes(event.eventType);
  if (filter === "appointment")
    return [
      "APPOINTMENT_CREATED",
      "APPOINTMENT_UPDATED",
      "APPOINTMENT_CANCELLED",
    ].includes(event.eventType);
  if (filter === "profile") return event.eventType === "PROFILE_UPDATED";
  return true;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm px-5 py-4 flex-1 min-w-0">
      <div
        className={cn(
          "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center",
          accent
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs font-medium text-neutral-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: HistoryEventDto }) {
  const [open, setOpen] = React.useState(false);
  const meta = getEventMeta(event.eventType);
  const Icon = meta.icon;
  const ts = new Date(event.timestamp);

  return (
    <div
      className={cn(
        "border rounded-xl bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-200",
        open
          ? "border-blue-200 dark:border-blue-900 shadow-[0_0_0_3px_rgba(219,234,254,0.5)] dark:shadow-[0_0_0_3px_rgba(30,58,138,0.2)]"
          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
      >
        <div
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200",
            meta.bgColor,
            open && "scale-105"
          )}
        >
          <Icon className={cn("h-5 w-5", meta.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {meta.label}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {event.description || event.eventType}
          </p>
        </div>

        {/* Source Badge */}
        <span
          className={cn(
            "hidden sm:inline-flex shrink-0 items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold",
            event.source === "blockchain"
              ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {event.source === "blockchain" ? "Blockchain" : "Local"}
        </span>

        {/* Date Column */}
        <div className="hidden md:flex flex-col items-end shrink-0 min-w-[72px]">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {format(ts, "MMM d")}
          </span>
          <span className="text-[11px] text-neutral-400">
            {format(ts, "HH:mm")}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "h-[18px] w-[18px] shrink-0 ml-2 transition-all duration-200",
            open
              ? "rotate-180 text-blue-500"
              : "text-neutral-300 group-hover:text-neutral-500"
          )}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800">
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Timestamp
              </p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {format(ts, "MMMM d, yyyy · HH:mm:ss")}
              </p>
            </div>
            {event.fileName && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  File
                </p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5 truncate">
                  {event.fileName}
                </p>
              </div>
            )}
            {event.category && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Category
                </p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {event.category}
                </p>
              </div>
            )}
            {event.targetResource && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Resource ID
                </p>
                <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 truncate">
                  {event.targetResource}
                </p>
              </div>
            )}
          </div>

          {event.additionalData &&
            Object.keys(event.additionalData).length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Metadata
                </p>
                <pre className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(event.additionalData, null, 2)}
                </pre>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// Blockchain Event Row 

function BlockchainEventRow({ event }: { event: HistoryEventDto }) {
  const [open, setOpen] = React.useState(false);
  const ts = new Date(event.timestamp);

  return (
    <div
      className={cn(
        "border rounded-xl bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-300 relative group",
        open
          ? "border-cyan-200 dark:border-cyan-900 shadow-[0_0_0_3px_rgba(207,250,254,0.5)] dark:shadow-[0_0_0_3px_rgba(8,145,178,0.1)]"
          : "border-neutral-200 dark:border-neutral-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-full flex items-center gap-4 px-4 sm:px-5 py-4 text-left transition-colors z-10 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
      >
        <div
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300",
            "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-800/50",
            open && "scale-105"
          )}
        >
          <Network className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {getEventMeta(event.eventType).label}
            </p>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-mono">
            {event.description || event.eventType}
          </p>
        </div>

        {/* Source Badge */}
        <span className="hidden sm:inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/50">
          Verified On-Chain
        </span>

        {/* Date Column */}
        <div className="hidden md:flex flex-col items-end shrink-0 min-w-[72px]">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {format(ts, "MMM d")}
          </span>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
            {format(ts, "HH:mm")}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "h-[18px] w-[18px] shrink-0 ml-2 transition-all duration-300",
            open ? "rotate-180 text-cyan-500" : "text-neutral-300 group-hover:text-cyan-500/50"
          )}
        />
      </button>

      {open && (
        <div className="relative px-4 sm:px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 z-10">
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Timestamp (UTC)
              </p>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5 font-mono text-xs">
                {format(ts, "yyyy-MM-dd HH:mm:ss.SSS")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Network Status
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Immutable & Verified
              </div>
            </div>

            {event.targetResource && (
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Target Resource
                </p>
                <p className="font-mono text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 truncate bg-white dark:bg-neutral-900 p-1.5 rounded border border-neutral-200 dark:border-neutral-800">
                  {event.targetResource}
                </p>
              </div>
            )}
          </div>

          {event.additionalData && Object.keys(event.additionalData).length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Log Metadata
              </p>
              <pre className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(event.additionalData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Pagination

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  const withGaps: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of visible) {
    if (prev !== null && p - prev > 1) withGaps.push("…");
    withGaps.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-2">
      <p className="text-sm text-neutral-500">
        Page{" "}
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {totalPages}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-neutral-200 dark:border-neutral-700"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {withGaps.map((p, idx) =>
          p === "…" ? (
            <span
              key={`gap-${idx}`}
              className="px-1 text-sm text-neutral-400 select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg text-sm font-medium",
                page === p
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "border-neutral-200 dark:border-neutral-700"
              )}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-neutral-200 dark:border-neutral-700"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MedicalHistoryPage() {
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, refetch } = useGetHistory(
    { sort: "desc" },
    { query: { refetchOnWindowFocus: false } }
  );

  const events = React.useMemo(() => data?.events ?? [], [data?.events]);

  const filtered = React.useMemo(() => {
    let items = events.filter((e: HistoryEventDto) => matchesFilter(e, activeFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e: HistoryEventDto) =>
          (e.description ?? "").toLowerCase().includes(q) ||
          (e.eventType ?? "").toLowerCase().includes(q) ||
          (e.fileName ?? "").toLowerCase().includes(q) ||
          (e.category ?? "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [events, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const resetPage = React.useCallback(() => setPage(1), []);

  // Stat counts
  const docCount = events.filter((e: HistoryEventDto) =>
    ["RECORD_UPLOADED", "RECORD_UPDATED", "RECORD_DELETED", "RECORD_DOWNLOADED"].includes(e.eventType)
  ).length;
  const apptCount = events.filter((e: HistoryEventDto) =>
    ["APPOINTMENT_CREATED", "APPOINTMENT_UPDATED", "APPOINTMENT_CANCELLED"].includes(e.eventType)
  ).length;
  const profileCount = events.filter(
    (e: HistoryEventDto) => e.eventType === "PROFILE_UPDATED"
  ).length;

  const handleFilterChange = (v: FilterValue) => {
    setActiveFilter(v);
    resetPage();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    resetPage();
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-neutral-950 w-full">
      <div className="container mx-auto max-w-4xl py-10 md:py-12 px-4 sm:px-6 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Security &amp; Access Log
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1.5 text-sm">
              Complete audit trail of all actions on your medical data.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5 text-xs border-neutral-200 dark:border-neutral-800"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 shadow-sm">
              <SlidersHorizontal className="h-3 w-3" />
              <span>{events.length} total events</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <StatCard
            label="Total Events"
            value={events.length}
            icon={
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            }
            accent="bg-blue-50 dark:bg-blue-900/30"
          />
          <StatCard
            label="Document Actions"
            value={docCount}
            icon={
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            }
            accent="bg-indigo-50 dark:bg-indigo-900/30"
          />
          <StatCard
            label="Appointments"
            value={apptCount}
            icon={
              <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            }
            accent="bg-sky-50 dark:bg-sky-900/30"
          />
          <StatCard
            label="Profile Changes"
            value={profileCount}
            icon={
              <UserCog className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            }
            accent="bg-violet-50 dark:bg-violet-900/30"
          />
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm shrink-0 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleFilterChange(tab.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeFilter === tab.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search events, files, categories..."
              value={search}
              onChange={handleSearch}
              className="pl-9 h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* Results Meta */}
        {(search || activeFilter !== "all") && (
          <div className="flex items-center justify-between -mt-4">
            <p className="text-xs text-neutral-500">
              Showing{" "}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "result" : "results"}
            </p>
            <button
              type="button"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
                resetPage();
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Loading access log...
            </h3>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm">
            <div className="mb-4 h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Failed to load access log
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs">
              Please try refreshing the page.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Event List */}
        {!isLoading && !isError && (
          <div className="flex flex-col gap-2.5">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="mb-4 h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-neutral-400" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  No events found
                </h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                  {search || activeFilter !== "all"
                    ? "Try adjusting your filters or search term."
                    : "Your access log will appear here once you start using TrustMed."}
                </p>
              </div>
            ) : (
              pageItems.map((event: HistoryEventDto) =>
                event.source === "blockchain" ? (
                  <BlockchainEventRow key={event.id} event={event} />
                ) : (
                  <EventRow key={event.id} event={event} />
                )
              )
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>
    </div>
  );
}
